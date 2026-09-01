import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PhoneIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { Avatar, Eyebrow, ScreenTitle } from "../../components/trip/TripChrome";
import { formatPhoneNumber, phoneLinkValue } from "../../utils/phone";
import { getEmergencyContacts } from "../../api/emergencyContacts";

export default function TripTeam() {
  const { event, user, isAdmin } = useOutletContext();
  const roster = event.travelingTeam || [];
  const travel = event.travel || [];
  const contacts = event.teamContacts || {};
  const anyContact = roster.some((name) => contacts[name]?.phone);

  // Admins only: the endpoint refuses to return anyone else's, so this is a
  // convenience for the person who would be making the call, not the guard.
  const [ice, setIce] = useState({});
  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    getEmergencyContacts(user, { isAdmin: true })
      .then((result) => !cancelled && setIce(result.all || {}))
      .catch(() => { /* the roster is still useful without it */ });
    return () => { cancelled = true; };
  }, [isAdmin, user?.email]);

  const rally = (event.schedule || [])
    .flatMap((day) => (day.items || []).map((item) => ({ ...item, day: day.day })))
    .find((item) => /all[\s-]*hands|rally/i.test(`${item.owner} ${item.title}`));

  return (
    <div className="space-y-4">
      <div>
        <Eyebrow>Traveling team</Eyebrow>
        <ScreenTitle className="mt-2">{roster.length} on the floor</ScreenTitle>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-[#93a0b4]">
          {[event.booth, rally ? `rally at ${rally.time} ${String(rally.day || "").split(",")[0]}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div>
        {roster.map((name, index) => {
          const contact = contacts[name] || {};
          const row = travel.find((entry) => (entry.person || "").toLowerCase() === name.toLowerCase());
          const arrival = row?.arrivalFlight?.flightNumber
            ? `Arrives ${[row.arrivalFlight.date, row.arrivalFlight.time].filter(Boolean).join(" ")}`.trim()
            : "Arrival TBD";
          const dialable = contact.phone ? phoneLinkValue(contact.phone) : "";
          const theirIce = isAdmin ? ice[(contact.email || "").toLowerCase()] : null;
          return (
            <div
              key={name}
              className={index === roster.length - 1 ? "" : "border-b border-white/[0.07]"}
            >
            <div className="flex min-h-[56px] items-center gap-3 py-2.5">
              <Avatar name={name} index={index} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold leading-[1.25] text-white">{name}</p>
                <p className="mt-0.5 text-[12px] leading-[1.35] text-[#75808d]">
                  {contact.phone ? formatPhoneNumber(contact.phone) : arrival}
                </p>

              </div>
              {/* Hidden per-person when there is no number, rather than
                  offering a button that cannot do anything. */}
              {dialable && (
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`tel:${dialable}`}
                    aria-label={`Call ${name}`}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-white"
                  >
                    <PhoneIcon className="h-[18px] w-[18px]" />
                  </a>
                  <a
                    href={`sms:${dialable}`}
                    aria-label={`Message ${name}`}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-white"
                  >
                    <ChatBubbleLeftIcon className="h-[18px] w-[18px]" />
                  </a>
                </div>
              )}
            </div>

            {isAdmin && theirIce && (
              <a
                href={`tel:${phoneLinkValue(theirIce.phone)}`}
                className="mb-2.5 flex items-baseline gap-2 rounded-lg border border-[#f59e0b]/25 bg-[#f59e0b]/[0.07] px-3 py-2"
              >
                <span className="font-switch-reg shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#f59e0b]">
                  ICE
                </span>
                <span className="min-w-0 text-[12.5px] leading-[1.4] text-[#f5c37b]">
                  {theirIce.name}
                  {theirIce.relationship ? ` · ${theirIce.relationship}` : ""}
                  {" · "}
                  <span className="font-semibold text-white">{formatPhoneNumber(theirIce.phone)}</span>
                </span>
              </a>
            )}
            </div>
          );
        })}
      </div>

      {!anyContact && (
        <p className="text-[11.5px] leading-[1.5] text-[#75808d]">
          Phone numbers fill in as people confirm — the roster shows arrival status until then.
        </p>
      )}
    </div>
  );
}
