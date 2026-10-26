import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';

const OPTIONS = [
  { value: 'light', label: 'בהיר', Icon: Sun },
  { value: 'dark', label: 'כהה', Icon: Moon },
  { value: 'system', label: 'אוטומטי', Icon: Monitor },
] as const;

/** Single icon button that flips between light and dark. */
export function ThemeIconButton({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
      className={`p-2 -m-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

/** Segmented light / dark / system control for settings panels. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme : undefined;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span>מראה</span>
      <div role="radiogroup" aria-label="מראה" className="inline-flex rounded-full border border-border p-0.5 bg-background">
        {OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={current === value}
            onClick={() => setTheme(value)}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
              current === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
