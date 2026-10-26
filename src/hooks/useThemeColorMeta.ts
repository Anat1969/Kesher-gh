import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/** Keeps the browser UI (address bar, PWA title bar) in step with the active theme. */
export function useThemeColorMeta() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const color = resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff';
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', color));
  }, [resolvedTheme]);
}
