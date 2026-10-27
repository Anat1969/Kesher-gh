import { useRegisterSW } from 'virtual:pwa-register/react';

const CHECK_EVERY = 30 * 60 * 1000;

/**
 * Keeps the installed app current: registers the service worker, checks for a new version
 * whenever the app comes back to the foreground (and every half hour), and reloads into it.
 */
export default function UpdateNotice() {
  useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
      check();
      setInterval(check, CHECK_EVERY);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    },
  });
  return null;
}
