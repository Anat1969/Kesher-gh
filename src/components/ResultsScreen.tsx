import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, MILESTONES, levelColor, type Level } from '../game/gameItems';
import { analyzePersonality, type Connection } from '../game/personality';
import { SECRET_KEYS } from '../game/evaluator';
import type { RecordResult, Stats } from '../lib/storage';
import { buildShareText, shareText, type ShareOutcome } from '../lib/share';
import ConnectionLines from './ConnectionLines';
import AnimatedNumber from './AnimatedNumber';

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

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] },
});

function Section({ kicker, title, children, delay = 0 }: { kicker: string; title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section {...reveal(delay)} className="panel p-5 sm:p-6">
      <p className="label-mono mb-1">{kicker}</p>
      <h2 className="mb-4 text-2xl font-extralight">{title}</h2>
      {children}
    </motion.section>
  );
}

function ConnectionMap({ directConns, chainConns }: Pick<ResultsScreenProps, 'directConns' | 'chainConns'>) {
  const used = new Set(directConns.flatMap(c => [c.a, c.b]));
  return (
    <div className="well relative mx-auto w-full max-w-[340px] p-2.5">
      <ConnectionLines directConns={directConns} chainConns={chainConns} newestId={0} />
      <div className="relative z-[2] grid grid-cols-5 gap-2">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            data-card={i}
            title={item.l}
            className={`grid aspect-square place-items-center rounded-[5px] border border-border text-xl ${used.has(i) ? '' : 'opacity-30 grayscale'}`}
            style={{ background: 'linear-gradient(160deg, hsl(var(--surface-1)), hsl(var(--surface-2)))', boxShadow: '0 2px 0 hsl(var(--edge))' }}
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
  const maxCnt = Math.max(1, ...LEVEL_ORDER.map(l => cnt[l]));

  const allConns = [...directConns, ...chainConns];
  const history = stats.history.slice(0, 12).reverse();
  const histMax = Math.max(1, ...history.map(h => h.total));

  const onShare = async () => {
    const text = buildShareText({ total, directConns, chainCount: chainConns.length, personality, best: personality?.best });
    setShareState(await shareText(text));
    setTimeout(() => setShareState(null), 2500);
  };

  return (
    <main className="mx-auto max-w-[760px] px-4 pb-16 pt-8">
      {/* Hero */}
      <section className="text-center">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-mono">סיום!</motion.h1>
        {record?.isNewBest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, type: 'spring', stiffness: 300, damping: 18 }}
            className="mx-auto mt-3 w-fit rounded-full border border-foreground/30 bg-foreground px-3 py-1 text-xs font-medium text-background shadow-md"
          >
            שיא אישי חדש
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}>
          <AnimatedNumber value={total} duration={1.4} className="display-num mt-2 block text-[7rem] sm:text-[9rem] font-thin text-foreground" />
        </motion.div>
        <p className="text-xl font-light text-foreground/85">{lastMs ? lastMs.lbl : 'בדרך לראות'}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <span dir="ltr">{score}</span> מקשרים ישירים, <span dir="ltr">{chainScore}</span> מבונוס שרשרת. שיא: <span dir="ltr">{stats.bestScore}</span>
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <button onClick={onPlayAgain} className="btn btn-primary h-12 px-8 text-base">שחקו שוב</button>
          {directConns.length > 0 && (
            <button onClick={onShare} className="btn btn-ghost h-12 px-6 text-sm">
              {shareState === 'copied' ? 'התוצאה הועתקה' : shareState === 'shared' ? 'שותף' : 'שיתוף התוצאה'}
            </button>
          )}
          <button onClick={onMenu} className="btn btn-text h-12 px-4 text-sm">לדף הבית</button>
        </div>

        {/* Milestones */}
        <ol className="mx-auto mt-8 grid max-w-[560px] grid-cols-3 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-6" aria-label="אבני דרך">
          {MILESTONES.map((m, i) => {
            const hit = m.pts <= total;
            return (
              <motion.li
                key={m.pts}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className={`px-2 py-2.5 text-center ${hit ? 'bg-foreground text-background' : 'bg-surface-1 text-muted-foreground'}`}
              >
                <div className="font-mono text-[0.68rem]" dir="ltr">{m.pts}</div>
                <div className="mt-0.5 text-[0.72rem] leading-tight">{m.lbl}</div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4">
        {record && record.newSecrets.length > 0 && (
          <motion.section {...reveal()} className="panel relative overflow-hidden p-5 text-center">
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: levelColor('s') }} />
            <p className="label-mono">אוסף הסודות</p>
            <div className="mt-1 text-2xl font-light" style={{ color: levelColor('s') }}>
              {record.newSecrets.length === 1 ? 'גיליתם סוד חדש' : `גיליתם ${record.newSecrets.length} סודות חדשים`}
            </div>
            <div className="well mx-auto mt-3 h-2 max-w-[320px] overflow-hidden rounded-full">
              <motion.div className="h-full rounded-full" style={{ background: levelColor('s') }}
                initial={{ width: 0 }} animate={{ width: `${(stats.secrets.length / SECRET_KEYS.length) * 100}%` }} transition={{ delay: 0.5, duration: 0.9 }} />
            </div>
            <Link to="/secrets" className="btn btn-text mt-2 h-9 text-sm">
              <span dir="ltr">{stats.secrets.length}/{SECRET_KEYS.length}</span> סודות. לאוסף המלא
            </Link>
          </motion.section>
        )}

        {/* Depth profile */}
        <Section kicker="פרופיל עומק" title="איך התפלגו הקשרים שלך">
          <div className="space-y-3">
            {LEVEL_ORDER.map((lv, i) => (
              <div key={lv} className="grid grid-cols-[4.5rem_minmax(0,1fr)_3.5rem] items-center gap-3">
                <span className="text-lg font-light" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
                <div className="well h-7 overflow-hidden">
                  <motion.div
                    className={`flex h-full items-center justify-end font-mono ${cnt[lv] > 0 ? 'px-2' : ''} text-[0.7rem] text-white`}
                    style={{ background: `linear-gradient(270deg, ${levelColor(lv)}, ${levelColor(lv, 0.7)})`, boxShadow: '0 1px 0 hsl(0 0% 100% / 0.25) inset' }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(cnt[lv] / maxCnt) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {cnt[lv] > 0 && <span dir="ltr">{cnt[lv]}</span>}
                  </motion.div>
                </div>
                <span className="display-num text-left text-2xl" style={{ color: levelColor(lv) }} dir="ltr">{pts[lv]}</span>
              </div>
            ))}
          </div>
        </Section>

        {personality && (
          <Section kicker="סגנון החשיבה שלך" title={personality.type}>
            <p className="text-base leading-relaxed text-foreground/90">{personality.desc}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'חוזקה', body: personality.strength },
                { title: 'שאיפה', body: personality.growth },
              ].map(row => (
                <div key={row.title} className="well p-4">
                  <div className="label-mono mb-1.5">{row.title}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{row.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="display-num text-4xl" dir="ltr">{Math.round(personality.deepRatio * 100)}%</span>
              <span className="text-sm text-muted-foreground">קשרים עמוקים (דרש וסוד)</span>
            </div>

            {personality.best && (
              <div className="relative mt-5 overflow-hidden rounded-md border border-border bg-surface-1 p-4 shadow-sm">
                <span className="absolute inset-y-0 right-0 w-1" style={{ background: levelColor(personality.best.ev.lv) }} />
                <div className="label-mono mb-2">הקשר הטוב ביותר שמצאתם</div>
                <div className="flex items-start gap-3">
                  <span className="whitespace-nowrap text-3xl">{ITEMS[personality.best.a].e}{ITEMS[personality.best.b].e}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: levelColor(personality.best.ev.lv) }}>{personality.best.ev.sub}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{personality.best.ev.exp}</p>
                  </div>
                </div>
              </div>
            )}
          </Section>
        )}

        {directConns.length > 0 && (
          <Section kicker="מפה" title="מפת הקשרים שלך">
            <ConnectionMap directConns={directConns} chainConns={chainConns} />
          </Section>
        )}

        {allConns.length > 0 && (
          <Section kicker={`${directConns.length} ישירים · ${chainConns.length} שרשרת`} title="כל הקשרים">
            <ul className="max-h-96 space-y-1.5 overflow-y-auto pl-1">
              {allConns.map((c, i) => {
                const color = c.isChain ? 'hsl(var(--chain))' : levelColor(c.ev.lv);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setOpenLog(openLog === i ? null : i)}
                      aria-expanded={openLog === i}
                      className="relative flex w-full items-start gap-3 overflow-hidden rounded border border-border bg-surface-1 p-2.5 pr-3.5 text-right transition hover:bg-surface-2"
                    >
                      <span className={`absolute inset-y-0 right-0 w-[3px] ${c.isChain ? 'opacity-60' : ''}`} style={{ background: color }} />
                      <span className="whitespace-nowrap text-base">{ITEMS[c.a].e}{ITEMS[c.b].e}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8rem] font-medium" style={{ color }}>{c.isChain ? 'שרשרת · ' : ''}{c.ev.sub}</div>
                        <div className={`text-xs text-muted-foreground ${openLog === i ? 'leading-relaxed' : 'truncate'}`}>{c.ev.exp}</div>
                      </div>
                      <span dir="ltr" className="font-mono text-xs" style={{ color }}>+{c.isChain ? c.bonus : c.ev.sc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {history.length > 1 && (
          <Section kicker="היסטוריה" title="משחקים אחרונים">
            <div className="flex h-32 items-end gap-1.5" aria-hidden="true">
              {history.map((h, i) => {
                const last = i === history.length - 1;
                return (
                  <div key={h.date} className="flex h-full flex-1 flex-col justify-end gap-1">
                    <span className={`text-center font-mono text-[0.6rem] ${last ? 'text-foreground' : 'text-muted-foreground'}`} dir="ltr">{h.total}</span>
                    <motion.div
                      className="rounded-t-[3px]"
                      style={{
                        background: last ? 'linear-gradient(180deg, hsl(var(--foreground)), hsl(var(--foreground) / 0.7))' : 'linear-gradient(180deg, hsl(var(--surface-3)), hsl(var(--surface-2)))',
                        boxShadow: '0 1px 0 hsl(var(--hi) / 0.5) inset',
                      }}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.max(4, (h.total / histMax) * 85)}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.5 }}
                    />
                  </div>
                );
              })}
            </div>
            <p className="sr-only">ציונים אחרונים: {history.map(h => h.total).join(', ')}</p>
          </Section>
        )}
      </div>
    </main>
  );
}
