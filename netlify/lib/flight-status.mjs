// Pure logic for detecting meaningful changes in a flight's status. No I/O and
// no side-effecting imports, so it can be exercised directly with node.

// A time shift smaller than this is noise — schedules jitter by a few minutes
// constantly and nobody wants a push for it.
export const MINOR_DELAY_MINUTES = 15;
// At or beyond this, the whole team needs to know: it changes booth coverage.
export const MAJOR_DELAY_MINUTES = 30;

const STATUSES_WORTH_BROADCASTING = new Set(['canceled', 'cancelled', 'diverted']);

function localMinutes(value) {
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
  if (!match) return null;
  return { date: match[1], minutes: Number(match[2]) * 60 + Number(match[3]) };
}

// Minutes between two local wall-clock stamps from the same provider. Both come
// back in the airport's own local zone, so comparing them needs no timezone
// maths — but a date rollover does, hence the day delta.
export function minutesBetween(fromLocal, toLocal) {
  const a = localMinutes(fromLocal);
  const b = localMinutes(toLocal);
  if (!a || !b) return null;
  const dayDelta = (Date.parse(`${b.date}T00:00:00Z`) - Date.parse(`${a.date}T00:00:00Z`)) / 86_400_000;
  if (!Number.isFinite(dayDelta)) return null;
  return b.minutes - a.minutes + dayDelta * 1440;
}

// Reduce a provider flight object to just what we track between runs.
export function snapshotOf(flight) {
  const leg = (side) => {
    const movement = flight?.[side] || {};
    return {
      scheduled: movement.scheduledTime?.local || '',
      revised: movement.revisedTime?.local || movement.actualTime?.local || '',
      terminal: movement.terminal || '',
      gate: movement.gate || '',
    };
  };
  return {
    status: String(flight?.status || '').trim(),
    departure: leg('departure'),
    arrival: leg('arrival'),
  };
}

function delayMinutes(leg) {
  if (!leg?.revised || !leg?.scheduled) return 0;
  return minutesBetween(leg.scheduled, leg.revised) || 0;
}

// What changed between two snapshots, and who needs to hear about it.
// `audience` is "team" for anything affecting booth coverage, "traveler" for
// details only the person flying can act on.
export function describeChange(previous, next, context) {
  const who = context?.person || 'A teammate';
  const flightNumber = context?.flightNumber || 'flight';
  const changes = [];

  const wasStatus = String(previous?.status || '').toLowerCase();
  const nowStatus = String(next?.status || '').toLowerCase();
  if (nowStatus && nowStatus !== wasStatus && STATUSES_WORTH_BROADCASTING.has(nowStatus)) {
    changes.push({
      audience: 'team',
      title: `${who}'s flight ${next.status.toLowerCase()}`,
      body: `${flightNumber} is ${next.status.toLowerCase()}.`,
    });
    // A cancellation supersedes any delay detail; sending both is noise.
    return changes;
  }

  const previousDelay = delayMinutes(previous?.departure);
  const nextDelay = delayMinutes(next?.departure);
  const moved = Math.abs(nextDelay - previousDelay);
  if (moved >= MINOR_DELAY_MINUTES) {
    const label = nextDelay > 0 ? `delayed ${Math.round(nextDelay)} min` : 'back on schedule';
    changes.push({
      audience: Math.abs(nextDelay) >= MAJOR_DELAY_MINUTES ? 'team' : 'traveler',
      title: `${who}'s flight ${nextDelay > 0 ? 'is delayed' : 'is back on schedule'}`,
      body: `${flightNumber} ${label}${next.departure?.revised ? ` — now departing ${next.departure.revised.slice(11, 16)}` : ''}.`,
    });
  }

  const gateChanged = next?.departure?.gate && next.departure.gate !== (previous?.departure?.gate || '');
  const terminalChanged = next?.departure?.terminal && next.departure.terminal !== (previous?.departure?.terminal || '');
  if ((gateChanged || terminalChanged) && previous) {
    const parts = [
      terminalChanged ? `terminal ${next.departure.terminal}` : '',
      gateChanged ? `gate ${next.departure.gate}` : '',
    ].filter(Boolean).join(', ');
    changes.push({
      audience: 'traveler',
      title: `${flightNumber} departure change`,
      body: `Now ${parts}.`,
    });
  }

  return changes;
}

// Is this leg close enough to departure to be worth spending an API call on?
// `windowHours` bounds the lookahead; the small negative allowance keeps a
// flight in scope briefly after its scheduled time so a delay announced at the
// gate still reaches people.
export function legIsDue(leg, now, windowHours) {
  if (!leg?.date || !/^\d{4}-\d{2}-\d{2}$/.test(leg.date)) return false;
  if (!/^[A-Z0-9]{3,8}$/i.test(String(leg.flightNumber || '').replace(/[^A-Z0-9]/gi, ''))) return false;
  const time = /^\d{2}:\d{2}$/.test(leg.time || '') ? leg.time : '12:00';
  const scheduled = Date.parse(`${leg.date}T${time}:00Z`);
  if (!Number.isFinite(scheduled)) return false;
  const hoursOut = (scheduled - now.getTime()) / 3_600_000;
  return hoursOut <= windowHours && hoursOut >= -3;
}
