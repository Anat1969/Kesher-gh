import { ITEMS, LEVEL_COLORS, LEVEL_NAMES, MILESTONES, LEVEL_CSS_CLASSES, LEVEL_BG_CLASSES } from '../game/gameItems';
import { analyzePersonality } from '../game/personality';
import type { Connection } from '../game/personality';
import type { Level } from '../game/gameItems';
import { SCORE_VALUES } from '../game/gameItems';

interface ResultsScreenProps {
  directConns: Connection[];
  chainConns: Connection[];
  score: number;
  chainScore: number;
  onPlayAgain: () => void;
}

export default function ResultsScreen({ directConns, chainConns, score, chainScore, onPlayAgain }: ResultsScreenProps) {
  const total = score + chainScore;
  const achieved = MILESTONES.filter(m => m.pts <= total);
  const lastMs = achieved[achieved.length - 1];

  const cnt: Record<Level, number> = { p: 0, r: 0, d: 0, s: 0 };
  const pts: Record<Level, number> = { p: 0, r: 0, d: 0, s: 0 };
  directConns.forEach(c => { cnt[c.ev.lv]++; pts[c.ev.lv] += c.ev.sc; });

  const personality = directConns.length > 0 ? analyzePersonality(directConns, chainConns) : null;

  const allConns = [
    ...directConns.map(c => ({ ...c, isChain: false as const })),
    ...chainConns.map(c => ({ ...c, isChain: true as const })),
  ];

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-start py-8 px-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, hsl(var(--gold) / 0.06), transparent 65%)' }}>

      <h1 className="font-display text-4xl font-black text-gold-light mb-2">סיום!</h1>
      <div className="font-display text-7xl font-black text-gold-light mb-1">{total}</div>
      <div className="text-muted-foreground text-sm mb-4">{lastMs ? lastMs.lbl : 'מתחיל לראות'}</div>

      {/* Milestones */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
        {MILESTONES.map(m => (
          <div key={m.pts}
            className={`px-3 py-1 rounded-full text-xs font-display font-bold border ${
              m.pts <= total
                ? 'bg-gold/20 text-gold-light border-gold/30'
                : 'bg-surface-2 text-muted border-border'
            }`}>
            {m.lbl} · {m.pts}
          </div>
        ))}
      </div>

      {/* Level breakdown */}
      <div className="grid grid-cols-4 gap-3 mb-6 max-w-md w-full">
        {(['p', 'r', 'd', 's'] as Level[]).map(k => (
          <div key={k} className="bg-surface-1 border border-border rounded-lg p-3 text-center">
            <div className={`font-display text-sm font-bold ${LEVEL_CSS_CLASSES[k]}`}>{LEVEL_NAMES[k]}</div>
            <div className="text-xs text-muted-foreground">{cnt[k]} קשרים</div>
            <div className={`font-display font-bold ${LEVEL_CSS_CLASSES[k]}`}>{pts[k]}</div>
          </div>
        ))}
      </div>

      {/* Chain bonus */}
      <div className="bg-surface-1 border border-chain/25 rounded-xl p-4 text-center mb-6 max-w-md w-full">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">בונוס שרשרת</div>
        <div className="font-display text-2xl font-black text-chain">+{chainScore} נק'</div>
        <div className="text-xs text-muted-foreground">{chainConns.length} חיבורי שרשרת</div>
      </div>

      {/* Personality */}
      {personality && (
        <div className="bg-surface-1 border border-border rounded-xl p-5 mb-6 max-w-md w-full text-right">
          <div className="font-display text-xl font-bold text-gold-light mb-2">
            {personality.emoji} {personality.type}
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-4">{personality.desc}</p>

          <div className="flex gap-3 items-start mb-3">
            <span className="text-lg">💪</span>
            <div>
              <div className="text-xs font-bold text-gold-light mb-0.5">חוזקה</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{personality.strength}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start mb-3">
            <span className="text-lg">🎯</span>
            <div>
              <div className="text-xs font-bold text-gold-light mb-0.5">שאיפה</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{personality.growth}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start mb-3">
            <span className="text-lg">📊</span>
            <div>
              <div className="text-xs font-bold text-gold-light mb-0.5">פיזור קשרים</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-level-pshat">{personality.cnt.p} פשט</strong> ·{' '}
                <strong className="text-level-remez">{personality.cnt.r} רמז</strong> ·{' '}
                <strong className="text-level-drash">{personality.cnt.d} דרש</strong> ·{' '}
                <strong className="text-level-sod">{personality.cnt.s} סוד</strong>
                <br />קשרים עמוקים: {Math.round(personality.deepRatio * 100)}% מהסך
              </p>
            </div>
          </div>

          {personality.best && (
            <div className="bg-surface-2 border border-border rounded-lg p-3 mt-3">
              <div className="text-xs font-bold text-gold-light mb-1">הקשר הטוב שמצאת</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ITEMS[personality.best.a].e}+{ITEMS[personality.best.b].e}</span>
                <div>
                  <div className={`text-xs font-display font-bold ${LEVEL_CSS_CLASSES[personality.best.ev.lv]}`}>
                    {LEVEL_NAMES[personality.best.ev.lv]} — {personality.best.ev.sub}
                  </div>
                  <div className="text-xs text-muted-foreground">{personality.best.ev.exp.substring(0, 100)}...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full log */}
      <div className="bg-surface-1 border border-border rounded-xl p-4 mb-6 max-w-md w-full">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-right">כל הקשרים</div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {allConns.map((c, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-md bg-surface-2 text-right ${c.isChain ? 'border-r-2 border-chain/40' : ''}`}>
              <span className="text-sm whitespace-nowrap">{ITEMS[c.a].e}+{ITEMS[c.b].e}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-display font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                  {c.isChain ? '⛓ שרשרת' : LEVEL_NAMES[c.ev.lv]} · {c.ev.sub}
                </div>
                <div className="text-xs text-muted-foreground truncate">{c.ev.exp.substring(0, 65)}{c.ev.exp.length > 65 ? '...' : ''}</div>
              </div>
              <span className={`font-display text-xs font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                +{c.isChain ? c.bonus : c.ev.sc}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-display text-lg font-bold hover:opacity-90 transition-all hover:scale-[1.04] mb-8"
      >
        שחק שוב
      </button>
    </div>
  );
}
