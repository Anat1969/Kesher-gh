import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const OPTIONS = [
  { value: 'light', label: 'בהיר' },
  { value: 'dark', label: 'כהה' },
  { value: 'system', label: 'אוטומטי' },
] as const;

/** Segmented light / dark / system control for settings panels. */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? theme : undefined;

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span>מראה</span>
      <div role="radiogroup" aria-label="מראה" className="inline-flex rounded border border-border bg-background p-0.5">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={current === value}
            onClick={() => setTheme(value)}
            className={`rounded-[3px] px-2.5 py-1 text-xs transition-colors ${
              current === value ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
