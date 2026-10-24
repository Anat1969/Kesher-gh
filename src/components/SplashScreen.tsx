import { Download } from 'lucide-react';
import { LEVEL_NAMES, LEVEL_CSS_CLASSES, LEVEL_BG_CLASSES, LEVEL_ORDER, SCORE_VALUES, type Level } from '../game/gameItems';
import { GAME_DURATION } from '../game/engine';
import { SECRET_KEYS } from '../game/evaluator';
import type { Settings, Stats } from '../lib/storage';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { SettingsToggles } from './PauseDialog';
import { ThemeIconButton } from './ThemeToggle';

interface SplashScreenProps {
  stats: Stats;
  settings: Settings;
  onStart: () => void;
  onSettings: (patch: Partial<Settings>) => void;
}

const LEVEL_INFO: Record<Level, { title: string; desc: string; examples: string }> = {
  p: { title: 'קשר גלוי', desc: 'מה שכולם רואים מיד', examples: 'שניהם מהטבע · שניהם עגולים · שניהם מאירים' },
  r: { title: 'קשר סמלי', desc: 'מטאפורה, ייצוג תרבותי', examples: 'אחד מסמל את השני · קשר מיתולוגי · הפכים' },
  d: { title: 'קשר מופשט', desc: 'מושג, תהליך, עיקרון', examples: 'שניהם עוסקים ב"שינוי" · עקרונות פנימיים משותפים' },
  s: { title: 'קשר נסתר', desc: 'פרדוקס, קפיצה יצירתית', examples: 'סתירה שהיא אמת · חיבור בין-תחומי עמוק' },
};

export default function SplashScreen({ stats, settings, onStart, onSettings }: SplashScreenProps) {
  const { canInstall, install } = useInstallPrompt();
  const secretsFound = stats.secrets.length;

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] flex flex-col items-center px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-10 text-center"
    >
      <div className="self-stretch flex justify-end max-w-[500px] w-full mx-auto -mt-4 mb-2">
        <ThemeIconButton />
      </div>
      <h1 className="font-display text-[5.5rem] sm:text-[6.5rem] font-black text-foreground tracking-wider leading-none mb-1">
        קֶשֶׁר
      </h1>
      <p className="text-sm text-muted-foreground tracking-wide mb-6">מצאו קשרים — המערכת מגלה את עומקם</p>

      <button
        onClick={onStart}
        className="bg-primary text-primary-foreground px-12 py-3.5 rounded-full font-display text-xl font-bold hover:opacity-90 transition-all hover:scale-[1.04] active:scale-[0.98] tracking-wide mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {stats.gamesPlayed > 0 ? 'משחק חדש' : 'התחילו לשחק'}
      </button>

      {/* Personal records */}
      {stats.gamesPlayed > 0 && (
        <section aria-label="השיאים שלך" className="grid grid-cols-3 gap-2 max-w-[500px] w-full mb-6">
          {[
            { label: 'שיא אישי', value: stats.bestScore, icon: '🏆' },
            { label: 'משחקים', value: stats.gamesPlayed, icon: '🎲' },
            { label: 'סודות נחשפו', value: `${secretsFound}/${SECRET_KEYS.length}`, icon: '🔮' },
          ].map(s => (
            <div key={s.label} className="bg-surface-1 border border-border rounded-xl py-2.5">
              <div className="text-[0.65rem] text-muted-foreground">{s.icon} {s.label}</div>
              <div className="font-display text-xl font-bold text-foreground tabular-nums" dir="ltr">{s.value}</div>
            </div>
          ))}
        </section>
      )}

      {/* How to play */}
      <section aria-labelledby="how-title" className="max-w-[500px] w-full">
        <h2 id="how-title" className="sr-only">איך משחקים</h2>
        <p className="text-sm text-muted-foreground leading-7 mb-5">
          בונים <strong className="text-foreground">שרשרת אחת</strong> של כל 25 הכרטיסים: כל כרטיס חדש מתחבר לקודם.<br />
          המערכת מזהה ומסבירה את הקשר — ככל שהוא עמוק יותר, הניקוד גבוה יותר.<br />
          <strong className="text-foreground">{GAME_DURATION / 60} דקות · מטרה: 300 נקודות</strong>
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {LEVEL_ORDER.map(lv => (
            <div key={lv} className="bg-surface-1 border border-border rounded-xl p-3.5 text-right">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${LEVEL_BG_CLASSES[lv]}`} />
                <span className={`font-display text-base font-bold ${LEVEL_CSS_CLASSES[lv]}`}>{LEVEL_NAMES[lv]}</span>
                <span className="text-[0.7rem] text-muted-foreground mr-auto">{SCORE_VALUES[lv]} נק'</span>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{LEVEL_INFO[lv].title}</strong> – {LEVEL_INFO[lv].desc}
              </div>
              <div className="text-[0.68rem] text-muted-foreground/70 mt-1 italic">{LEVEL_INFO[lv].examples}</div>
            </div>
          ))}
        </div>

        <div className="bg-surface-1 border border-chain/25 rounded-xl p-3.5 mb-6 text-right">
          <div className="flex items-center gap-2 mb-1.5 text-chain">
            <span aria-hidden="true">⛓</span>
            <span className="font-display text-sm font-bold">חיבורי שרשרת</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            כשמחברים A ל-B וגם B ל-C, המערכת מגלה אוטומטית גם את הקשר שבין A ל-C — חיבור שרשרת שמוסיף ניקוד בונוס.
          </div>
        </div>
      </section>

      <details className="max-w-[500px] w-full bg-surface-1 border border-border rounded-xl text-right group">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm text-muted-foreground flex items-center justify-between">
          <span>⚙️ הגדרות</span>
          <span className="transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
        </summary>
        <div className="px-4 pb-4">
          <SettingsToggles settings={settings} onSettings={onSettings} />
        </div>
      </details>

      {canInstall && (
        <button
          onClick={install}
          className="mt-4 inline-flex items-center gap-2 text-sm text-foreground border border-foreground/25 rounded-full px-4 py-2 hover:bg-foreground/5 transition"
        >
          <Download className="w-4 h-4" /> התקנה כאפליקציה
        </button>
      )}
    </div>
  );
}
