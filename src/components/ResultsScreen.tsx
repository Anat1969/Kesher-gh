import { useMemo, useState } from 'react';
import { Share2, Check, RotateCcw, Home } from 'lucide-react';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, MILESTONES, LEVEL_CSS_CLASSES, LEVEL_BG_CLASSES, type Level } from '../game/gameItems';
import { analyzePersonality, type Connection } from '../game/personality';
import { SECRET_KEYS } from '../game/evaluator';
import type { RecordResult, Stats } from '../lib/storage';
import { buildShareText, shareText, type ShareOutcome } from '../lib/share';
import ConnectionLines from './ConnectionLines';

interface ResultsScreenProps {
  directConns: Connection[];
  chainConns: Connection[];
  score: number;
  chainScore: number;
  stats: Stats;
  record: RecordResult | null;
  onPlayAgain: () => void;
  onMenu: () => void;
}

function ConnectionMap({ directConns, chainConns }: Pick<ResultsScreenProps, 'directConns' | 'chainConns'>) {
  const used = new Set(directConns.flatMap(c => [c.a, c.b]));
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <ConnectionLines directConns={directConns} chainConns={chainConns} newestId={0} />
      <div className="grid grid-cols-5 gap-2 relative z-[2]">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            data-card={i}
            title={item.l}
            className={`aspect-square grid place-items-center rounded-lg text-xl bg-surface-2/80 border border-border ${used.has(i) ? '' : 'opacity-30'}`}
          >
            {item.e}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResultsScreen({
  directConns, chainConns, score, chainScore, stats, record, onPlayAgain, onMenu,
}: ResultsScreenProps) {
  const [shareState, setShareState] = useState<ShareOutcome | null>(null);
  const [openLog, setOpenLog] = useState<number | null>(null);

  const total = score + chainScore;
  const lastMs = MILESTONES.filter(m => m.pts <= total).pop();
  const personality = useMemo(
    () => (directConns.length > 0 ? analyzePersonality(directConns, chainConns) : null),
    [directConns, chainConns],
  );

  const cnt: Record<Level, number> = { p: 0, r: 0, d: 0, s: 0 };
  const pts: Record<Level, number> = { p: 0, r: 0, d: 0, s: 0 };
  directConns.forEach(c => { cnt[c.ev.lv]++; pts[c.ev.lv] += c.ev.sc; });

  const allConns = [...directConns, ...chainConns];

  const onShare = async () => {
    const text = buildShareText({ total, directConns, chainCount: chainConns.length, personality, best: personality?.best });
    setShareState(await shareText(text));
    setTimeout(() => setShareState(null), 2500);
  };

  return (
    <div
      dir="rtl"
      className="min-h-[100dvh] flex flex-col items-center py-8 px-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
      style={{ background: 'radial-gradient(ellipse at 50% 15%, hsl(var(--gold) / 0.08), transparent 60%)' }}
    >
      <h1 className="font-display text-3xl font-black text-gold-light mb-1">סיום!</h1>
      {record?.isNewBest && (
        <div className="mb-1 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold-light text-xs font-bold animate-in zoom-in duration-500">
          🏆 שיא אישי חדש!
        </div>
      )}
      <div className="font-display text-7xl font-black text-gold-light tabular-nums animate-in zoom-in-50 duration-700" dir="ltr">{total}</div>
      <div className="text-muted-foreground text-sm mb-1">{lastMs ? lastMs.lbl : 'בדרך לראות'}</div>
      <div className="text-xs text-muted-foreground/80 mb-4">
        {score} קשרים ישירים <span dir="ltr">+ {chainScore}</span> בונוס שרשרת · שיא: <span dir="ltr">{stats.bestScore}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={onPlayAgain}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-display text-base font-bold hover:opacity-90 transition-all hover:scale-[1.03]"
        >
          <RotateCcw className="w-4 h-4" /> שחקו שוב
        </button>
        {directConns.length > 0 && (
          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 border border-gold/40 text-gold-light px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gold/10 transition"
          >
            {shareState === 'copied' || shareState === 'shared' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {shareState === 'copied' ? 'הועתק!' : shareState === 'shared' ? 'שותף!' : 'שיתוף'}
          </button>
        )}
      </div>

      {/* Milestones */}
      <ol className="flex flex-wrap justify-center gap-2 mb-6 max-w-md" aria-label="אבני דרך">
        {MILESTONES.map(m => (
          <li
            key={m.pts}
            className={`px-3 py-1 rounded-full text-xs font-display font-bold border ${
              m.pts <= total ? 'bg-gold/20 text-gold-light border-gold/30' : 'bg-surface-2 text-muted-foreground/60 border-border'
            }`}
          >
            {m.pts <= total ? '✓ ' : ''}{m.lbl} · {m.pts}
          </li>
        ))}
      </ol>

      {/* New secrets */}
      {record && record.newSecrets.length > 0 && (
        <div className="bg-level-sod/10 border border-level-sod/30 rounded-xl p-4 text-center mb-6 max-w-md w-full">
          <div className="font-display text-lg font-bold text-level-sod">✨ גיליתם {record.newSecrets.length === 1 ? 'סוד חדש' : `${record.newSecrets.length} סודות חדשים`}!</div>
          <div className="text-xs text-muted-foreground mt-1">
            אוסף הסודות: <span dir="ltr">{stats.secrets.length}/{SECRET_KEYS.length}</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
            <div className="h-full bg-level-sod rounded-full transition-all duration-700" style={{ width: `${(stats.secrets.length / SECRET_KEYS.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Level breakdown */}
      <section className="max-w-md w-full mb-6" aria-label="פיזור לפי רמות">
        {directConns.length > 0 && (
          <div className="flex h-2.5 rounded-full overflow-hidden mb-3" aria-hidden="true">
            {LEVEL_ORDER.map(lv => cnt[lv] > 0 && (
              <div key={lv} className={LEVEL_BG_CLASSES[lv]} style={{ width: `${(cnt[lv] / directConns.length) * 100}%` }} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-4 gap-2">
          {LEVEL_ORDER.map(k => (
            <div key={k} className="bg-surface-1 border border-border rounded-lg p-2.5 text-center">
              <div className={`font-display text-sm font-bold ${LEVEL_CSS_CLASSES[k]}`}>{LEVEL_NAMES[k]}</div>
              <div className="text-[0.68rem] text-muted-foreground">{cnt[k]} קשרים</div>
              <div className={`font-display font-bold ${LEVEL_CSS_CLASSES[k]}`}>{pts[k]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Personality */}
      {personality && (
        <section className="bg-surface-1 border border-border rounded-xl p-5 mb-6 max-w-md w-full text-right">
          <div className="text-[0.7rem] text-muted-foreground mb-1">סגנון החשיבה שלך</div>
          <h2 className="font-display text-2xl font-bold text-gold-light mb-2">
            {personality.emoji} {personality.type}
          </h2>
          <p className="text-sm text-foreground leading-relaxed mb-4">{personality.desc}</p>

          {[
            { icon: '💪', title: 'חוזקה', body: personality.strength },
            { icon: '🎯', title: 'שאיפה', body: personality.growth },
          ].map(row => (
            <div key={row.title} className="flex gap-3 items-start mb-3">
              <span className="text-lg" aria-hidden="true">{row.icon}</span>
              <div>
                <div className="text-xs font-bold text-gold-light mb-0.5">{row.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{row.body}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            קשרים עמוקים (דרש + סוד): <strong className="text-foreground">{Math.round(personality.deepRatio * 100)}%</strong>
          </p>

          {personality.best && (
            <div className="bg-surface-2 border border-border rounded-lg p-3 mt-4">
              <div className="text-xs font-bold text-gold-light mb-1.5">הקשר הטוב ביותר שמצאתם</div>
              <div className="flex items-start gap-2">
                <span className="text-2xl whitespace-nowrap">{ITEMS[personality.best.a].e}{ITEMS[personality.best.b].e}</span>
                <div>
                  <div className={`text-xs font-display font-bold ${LEVEL_CSS_CLASSES[personality.best.ev.lv]}`}>
                    {personality.best.ev.sub}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{personality.best.ev.exp}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Connection map */}
      {directConns.length > 0 && (
        <section className="bg-surface-1 border border-border rounded-xl p-4 mb-6 max-w-md w-full">
          <h2 className="text-xs tracking-widest text-muted-foreground mb-3 text-right">מפת הקשרים שלך</h2>
          <ConnectionMap directConns={directConns} chainConns={chainConns} />
        </section>
      )}

      {/* Full log */}
      {allConns.length > 0 && (
        <section className="bg-surface-1 border border-border rounded-xl p-4 mb-6 max-w-md w-full">
          <h2 className="text-xs tracking-widest text-muted-foreground mb-3 text-right">
            כל הקשרים ({directConns.length} ישירים · {chainConns.length} שרשרת)
          </h2>
          <ul className="space-y-1.5 max-h-80 overflow-y-auto">
            {allConns.map((c, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setOpenLog(openLog === i ? null : i)}
                  aria-expanded={openLog === i}
                  className={`w-full flex items-start gap-2 p-2 rounded-md bg-surface-2 text-right hover:bg-surface-3 transition ${c.isChain ? 'border-r-2 border-chain/50' : ''}`}
                >
                  <span className="text-sm whitespace-nowrap">{ITEMS[c.a].e}{ITEMS[c.b].e}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-display font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                      {c.isChain ? '⛓ שרשרת · ' : ''}{c.ev.sub}
                    </div>
                    <div className={`text-xs text-muted-foreground ${openLog === i ? 'leading-relaxed' : 'truncate'}`}>{c.ev.exp}</div>
                  </div>
                  <span dir="ltr" className={`font-display text-xs font-bold ${c.isChain ? 'text-chain' : LEVEL_CSS_CLASSES[c.ev.lv]}`}>
                    +{c.isChain ? c.bonus : c.ev.sc}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent history */}
      {stats.history.length > 1 && (
        <section className="bg-surface-1 border border-border rounded-xl p-4 mb-6 max-w-md w-full">
          <h2 className="text-xs tracking-widest text-muted-foreground mb-3 text-right">משחקים אחרונים</h2>
          <div className="flex items-end gap-1 h-16" aria-hidden="true">
            {stats.history.slice(0, 12).reverse().map((h, i, arr) => (
              <div
                key={h.date}
                title={`${h.total}`}
                className={`flex-1 rounded-t ${i === arr.length - 1 ? 'bg-gold' : 'bg-surface-3'}`}
                style={{ height: `${Math.max(6, (h.total / Math.max(1, stats.bestScore)) * 100)}%` }}
              />
            ))}
          </div>
          <p className="sr-only">
            ציונים אחרונים: {stats.history.slice(0, 12).map(h => h.total).join(', ')}
          </p>
        </section>
      )}

      <button onClick={onMenu} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <Home className="w-4 h-4" /> למסך הראשי
      </button>
    </div>
  );
}
