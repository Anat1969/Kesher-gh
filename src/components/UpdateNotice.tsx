import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const CHECK_EVERY = 30 * 60 * 1000;
const RELOADED_FOR = 'kesher:reloaded-for';

/**
 * Asks the server which build is live (version.json, never cached). When it is not the build
 * this page runs, the page is stale: drop the service worker and its caches and reload once.
 * Guarded so a page that cannot reach the new build never reloads in a loop.
 */
async function ensureLatest() {
  if (typeof __BUILD__ !== 'string' || !navigator.onLine) return;
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const { build } = (await res.json()) as { build?: string };
    if (!build || build === __BUILD__ || build < __BUILD__) return;
    if (sessionStorage.getItem(RELOADED_FOR) === build) return; // already tried for this build
    sessionStorage.setItem(RELOADED_FOR, build);
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map(r => r.unregister()));
    if ('caches' in window) await Promise.all((await caches.keys()).map(k => caches.delete(k)));
    window.location.reload();
  } catch {
    // Offline or blocked: keep running the version we have.
  }
}

/**
 * Keeps the installed app current. Two layers: the service worker checks for a new version on
 * every return to the app (and every half hour) and reloads into it; and the page itself
 * compares its build with the live one, so an old copy can never stay on screen.
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

  useEffect(() => {
    ensureLatest();
    const onShow = () => { if (document.visibilityState === 'visible') ensureLatest(); };
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);

  return null;
}
