import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import type { Settings } from '../lib/storage';

export const DEV_SESSION_URL = 'https://claude.ai/code/session_01AWJaM53EKZELq66AcxaJZT';

interface MenuItem {
  label: string;
  hint?: string;
  pressed?: boolean;
  onSelect: () => unknown;
}

interface MenuElement extends HTMLElement {
  items: MenuItem[];
  status: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'ai-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { chat?: string; research?: string };
    }
  }
}

interface Props {
  settings: Settings;
  onSettings: (patch: Partial<Settings>) => void;
}

/**
 * The A&I logo button (https://appofapp-gh.vercel.app/ai-menu.js, loaded in index.html).
 * Copy link, development chat and install come from the element; the app's own
 * preferences (appearance, sound, haptics) are added as its items.
 */
export default function AIMenu({ settings, onSettings }: Props) {
  const ref = useRef<MenuElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.items = [
      { label: 'מצב כהה', hint: isDark ? 'פעיל' : 'כבוי', pressed: isDark, onSelect: () => setTheme(isDark ? 'light' : 'dark') },
      { label: 'צלילים', hint: settings.sound ? 'פעילים' : 'כבויים', pressed: settings.sound, onSelect: () => onSettings({ sound: !settings.sound }) },
      { label: 'רטט', hint: settings.haptics ? 'פעיל' : 'כבוי', pressed: settings.haptics, onSelect: () => onSettings({ haptics: !settings.haptics }) },
      { label: 'שמות על הכרטיסים', hint: settings.labels ? 'מוצגים' : 'רק תמונות', pressed: settings.labels, onSelect: () => onSettings({ labels: !settings.labels }) },
    ];
  }, [isDark, setTheme, settings.sound, settings.haptics, settings.labels, onSettings]);

  return <ai-menu ref={ref} chat={DEV_SESSION_URL} />;
}
