import { useEffect, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpOnSquareIcon,
  BellIcon,
  BellSlashIcon,
  DevicePhoneMobileIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  isEventPushEnabled,
  subscribeToEventPush,
  supportsPushNotifications,
  unsubscribeFromEventPush,
} from '../api/pushNotifications';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function detectPlatform() {
  const userAgent = window.navigator.userAgent || '';
  const isIPadDesktopMode = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/i.test(userAgent) || isIPadDesktopMode) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'other';
}

export default function PwaControls({ eventId }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [platform] = useState(detectPlatform);
  const supported = supportsPushNotifications();

  useEffect(() => {
    const capturePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const markInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', markInstalled);
    isEventPushEnabled(eventId).then(setSubscribed).catch(() => {});
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', markInstalled);
    };
  }, [eventId]);

  const install = async () => {
    if (platform === 'ios') {
      setShowInstallHelp(true);
      setMessage('Follow the steps below to add the app to your Home Screen.');
      return;
    }
    if (!installPrompt) {
      setShowInstallHelp(true);
      setMessage('Use your browser menu to install the app.');
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const toggleNotifications = async () => {
    if (platform === 'ios' && !installed) {
      setShowInstallHelp(true);
      setMessage('On iPhone, install and open the Home Screen app before enabling notifications.');
      return;
    }
    if (!supported) {
      setMessage(platform === 'ios'
        ? 'Notifications require iOS 16.4 or later and the app must be opened from its Home Screen icon.'
        : 'Push notifications are not supported in this browser.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      if (subscribed) {
        await unsubscribeFromEventPush(eventId);
        setSubscribed(false);
        setMessage('Notifications turned off for this device.');
      } else {
        await subscribeToEventPush(eventId);
        setSubscribed(true);
        setMessage('Notifications are on for this event.');
      }
    } catch (error) {
      setMessage(error.message || 'Unable to change notification settings.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap gap-2">
        {!installed && (
          <button type="button" onClick={install} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            <ArrowDownTrayIcon className="h-5 w-5" /> Install app
          </button>
        )}
        <button type="button" onClick={toggleNotifications} disabled={busy} aria-pressed={subscribed} className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${subscribed ? 'border-[#10b981]/45 bg-[#10b981]/15 text-white hover:bg-[#10b981]/25' : 'border-[#0951fa]/45 bg-[#0951fa]/20 text-white hover:bg-[#0951fa]/30'}`}>
          {subscribed ? <BellIcon className="h-5 w-5" /> : <BellSlashIcon className="h-5 w-5" />}
          {busy ? 'Updating...' : subscribed ? 'Notifications on' : 'Enable notifications'}
        </button>
      </div>
      {message && <p role="status" className="mt-2 text-xs leading-5 text-gray-400">{message}</p>}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowInstallHelp(false);
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="install-app-title" className="w-full max-w-md rounded-lg border border-white/15 bg-[#111827] p-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#00ace8]">{platform === 'ios' ? 'iPhone and iPad' : platform === 'android' ? 'Android' : 'Install this app'}</p>
                <h2 id="install-app-title" className="mt-1 text-xl font-bold">Add Trade Shows to your Home Screen</h2>
              </div>
              <button type="button" onClick={() => setShowInstallHelp(false)} aria-label="Close installation instructions" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 text-gray-300 hover:bg-white/10 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {platform === 'ios' ? (
              <ol className="mt-5 space-y-4 text-sm leading-6 text-gray-200">
                <li className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0951fa] font-bold">1</span><span>Tap the <strong className="text-white">Share</strong> button in your browser toolbar. <ArrowUpOnSquareIcon className="ml-1 inline h-5 w-5 text-[#00ace8]" /></span></li>
                <li className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0951fa] font-bold">2</span><span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0951fa] font-bold">3</span><span>Keep <strong className="text-white">Open as Web App</strong> turned on, then tap <strong className="text-white">Add</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10b981] font-bold">4</span><span>Open the new <strong className="text-white">Trade Shows</strong> icon, then tap <strong className="text-white">Enable notifications</strong>.</span></li>
              </ol>
            ) : (
              <div className="mt-5 flex gap-3 text-sm leading-6 text-gray-200">
                <DevicePhoneMobileIcon className="h-8 w-8 shrink-0 text-[#00ace8]" />
                <p>Open your browser menu and choose <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.</p>
              </div>
            )}

            <button type="button" onClick={() => setShowInstallHelp(false)} className="mt-6 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-[#0951fa] px-4 py-2 text-sm font-bold text-white hover:bg-[#0645d8]">
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
