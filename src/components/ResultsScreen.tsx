import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ITEMS, LEVEL_NAMES, LEVEL_ORDER, MILESTONES, levelColor, type Level } from '../game/gameItems';
import { analyzePersonality, type Connection } from '../game/personality';
import { SECRET_KEYS, readingsFor, evaluate } from '../game/evaluator';
import type { RecordResult, Stats } from '../lib/storage';
import { buildShareText, buildDailyShareText, shareText, type ShareOutcome } from '../lib/share';
import ConnectionLines from './ConnectionLines';
import AnimatedNumber from './AnimatedNumber';
import { streak, type DailyConfig } from '../game/daily';
import { useGame } from '../context/GameContext';
import Glyph from './Glyph';
import Rich from './Rich';
import { markLead } from '../lib/marker';
import { CompetitionCard } from './Competition';
import LearningChart from './LearningChart';
import { trendLine } from '../lib/learning';

interface ResultsScreenProps {
  directConns: Connection[];
  chainConns: Connection[];
  score: number;
  chainScore: number;
  stats: Stats;
  record: RecordResult | null;
  onPlayAgain: () => void;
  onMenu: () => void;
  /** Set when the game was the daily challenge. */
  daily?: DailyConfig | null;
  path?: number[];
  onDaily?: () => void;
}

const EASE = [0.4, 0, 0.2, 1] as const;
const inView = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-30px' },
  transition: { delay, duration: 0.8, ease: EASE },
});

function Section({ n, kicker, title, children }: { n: string; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section {...inView()} className="border-t border-foreground/80 pt-5">
      <p className="label-mono"><span className="num-mono">{n}</span> · {kicker}</p>
      <h2 className="mb-6 mt-2 text-3xl font-extralight">{title}</h2>
      {children}
    </motion.section>
  );
}

function ConnectionMap({ directConns, chainConns }: Pick<ResultsScreenProps, 'directConns' | 'chainConns'>) {
  const used = new Set(directConns.flatMap(c => [c.a, c.b]));
  return (
    <div className="well relative mx-auto w-full max-w-[420px] p-2.5">
      <ConnectionLines directConns={directConns} chainConns={chainConns} newestId={0} />
      <div className="relative z-[2] grid grid-cols-5 gap-1.5">
        {ITEMS.map((item, i) => (
          <span
            key={i}
            data-card={i}
            className={`flex aspect-square flex-col items-center justify-center gap-1 truncate rounded-[2px] border px-0.5 text-[0.68rem] ${
              used.has(i) ? 'border-border bg-surface-1 text-foreground' : 'border-transparent text-muted-foreground/40'
            }`}
          >
            <Glyph i={i} size={22} />
            {item.l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResultsScreen({
  directConns, chainConns, score, chainScore, stats, record, onPlayAgain, onMenu, daily = null, path = [], onDaily = onPlayAgain,
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

  const onShare = async () => {
    const text = buildShareText({ total, directConns, chainCount: chainConns.length, personality, best: personality?.best });
    setShareState(await shareText(text));
    setTimeout(() => setShareState(null), 2500);
  };

  const meantSub = (c: Connection) =>
    c.meant && c.meant !== readingsFor(c.a, c.b)[0]?.key
      ? readingsFor(c.a, c.b).find(r => r.key === c.meant)?.sub.replace(/^[^—]*—\s*/, '')
      : undefined;

  let n = 0;
  const next = () => String(++n).padStart(2, '0');

  return (
    <main className="mx-auto max-w-[860px] px-5 pb-20 pt-10 md:pt-16">
      {daily ? (
        <DailyHeadline daily={daily} path={path} directConns={directConns} onPlayAgain={onDaily} onMenu={onMenu} />
      ) : (<>
      {/* Headline figure */}
      <section className="grid grid-cols-[minmax(0,1fr)] items-end gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-mono flex items-center gap-3">
            <span className="h-px w-8 bg-foreground/40" />
            סיום!
          </motion.h1>
          {record?.isNewBest && <p className="label-mono mt-3 w-fit border border-foreground px-1.5 py-px text-foreground">שיא אישי חדש</p>}
          <AnimatedNumber value={total} duration={1.6} className="display-num mt-4 block text-[7.5rem] font-thin sm:text-[10rem]" />
          <p className="mt-3 text-2xl font-extralight">{lastMs ? lastMs.lbl : 'בדרך לראות'}</p>
        </div>
        <dl className="grid min-w-[240px] grid-cols-[minmax(0,1fr)_auto] gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
          <dt className="text-muted-foreground">קשרים ישירים</dt><dd className="num-mono" dir="ltr">{score}</dd>
          <dt className="text-muted-foreground">בונוס שרשרת</dt><dd className="num-mono" dir="ltr">{chainScore}</dd>
          <dt className="text-muted-foreground">שיא אישי</dt><dd className="num-mono" dir="ltr">{stats.bestScore}</dd>
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <button onClick={onPlayAgain} className="btn btn-primary h-12 px-8 text-base">שחקו שוב</button>
        {directConns.length > 0 && (
          <button onClick={onShare} className="btn btn-ghost h-12 px-6 text-sm">
            {shareState === 'copied' ? 'התוצאה הועתקה' : shareState === 'shared' ? 'שותף' : 'שיתוף התוצאה'}
          </button>
        )}
        <button onClick={onMenu} className="btn btn-text h-12 px-3 text-sm">לדף הבית</button>
      </div>

      {/* Milestone scale */}
      <ol className="mt-12 grid grid-cols-6 border-t border-border" aria-label="אבני דרך">
        {MILESTONES.map(m => {
          const hit = m.pts <= total;
          return (
            <li key={m.pts} className={`relative pl-2 pt-3 ${hit ? 'text-foreground' : 'text-muted-foreground/60'}`}>
              <span className={`absolute -top-px right-0 h-[3px] w-full ${hit ? 'bg-foreground' : ''}`} />
              <div className="num-mono text-[0.7rem]" dir="ltr" style={{ textAlign: 'right' }}>{m.pts}</div>
              <div className="mt-1 text-[0.72rem] leading-tight">{m.lbl}</div>
            </li>
          );
        })}
      </ol>
      </>)}

      {directConns.length > 0 && <CompetitionCard mode={daily ? 'daily' : 'classic'} />}

      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-14">
        {record && record.newSecrets.length > 0 && (
          <motion.section {...inView()} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 border p-5" style={{ borderColor: levelColor('s', 0.5) }}>
            <div>
              <p className="label-mono" style={{ color: levelColor('s') }}>אוסף הסודות</p>
              <div className="mt-2 text-2xl font-extralight">
                {record.newSecrets.length === 1 ? 'גיליתם סוד חדש' : `גיליתם ${record.newSecrets.length} סודות חדשים`}
              </div>
              <Link to="/secrets" className="label-mono link-draw mt-3 inline-block">לאוסף המלא</Link>
            </div>
            <div className="display-num text-5xl" dir="ltr">{stats.secrets.length}<span className="text-muted-foreground">/{SECRET_KEYS.length}</span></div>
          </motion.section>
        )}

        <Section n={next()} kicker="פרופיל עומק" title="איך התפלגו הקשרים שלך">
          <div className="grid grid-cols-[minmax(0,1fr)]">
            {LEVEL_ORDER.map((lv, i) => (
              <div key={lv} className="grid grid-cols-[4.5rem_minmax(0,1fr)_2.5rem_3rem] items-center gap-4 border-b border-border py-3">
                <span className="text-lg font-light" style={{ color: levelColor(lv) }}>{LEVEL_NAMES[lv]}</span>
                <div className="relative h-[3px] bg-surface-3">
                  <motion.div
                    className="absolute inset-y-0 right-0"
                    style={{ background: levelColor(lv) }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(cnt[lv] / maxCnt) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 1, ease: EASE }}
                  />
                </div>
                <span className="num-mono text-sm text-muted-foreground" dir="ltr">×{cnt[lv]}</span>
                <span className="num-mono text-left text-base" dir="ltr">{pts[lv]}</span>
              </div>
            ))}
          </div>
        </Section>

        {personality && (
          <Section n={next()} kicker="סגנון החשיבה שלך" title={personality.type}>
            <p className="max-w-[60ch] text-lg font-light leading-relaxed text-foreground/85"><Rich text={markLead(personality.desc)} /></p>
            <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2">
              {[
                { title: 'חוזקה', body: personality.strength },
                { title: 'שאיפה', body: personality.growth },
              ].map(row => (
                <div key={row.title} className="border-t border-border pt-3">
                  <div className="label-mono mb-2">{row.title}</div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{row.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-baseline gap-3">
              <span className="display-num text-5xl" dir="ltr">{Math.round(personality.deepRatio * 100)}%</span>
              <span className="text-sm text-muted-foreground">מהקשרים בשכבות העמוקות, דרש וסוד</span>
            </div>

            {personality.best && (
              <figure className="panel mt-8 p-5">
                <figcaption className="label-mono mb-3">הקשר הטוב ביותר שמצאתם</figcaption>
                <div className="mb-3 flex items-center gap-3" aria-hidden="true">
                  <Glyph i={personality.best.a} size={36} />
                  <span className="h-px w-8" style={{ background: levelColor(personality.best.ev.lv) }} />
                  <Glyph i={personality.best.b} size={36} />
                </div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-xl font-light">{ITEMS[personality.best.a].l} <span className="text-muted-foreground">·</span> {ITEMS[personality.best.b].l}</span>
                  <span className="text-sm" style={{ color: levelColor(personality.best.ev.lv) }}>{personality.best.ev.sub}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><Rich text={personality.best.ev.exp} /></p>
              </figure>
            )}
          </Section>
        )}

        {directConns.length > 0 && (
          <Section n={next()} kicker="מפה" title="מפת הקשרים שלך">
            <ConnectionMap directConns={directConns} chainConns={chainConns} />
          </Section>
        )}

        {allConns.length > 0 && (
          <Section n={next()} kicker={`${directConns.length} ישירים · ${chainConns.length} שרשרת`} title="יומן הקשרים">
            <ul className="max-h-[28rem] overflow-y-auto">
              {allConns.map((c, i) => {
                const color = c.isChain ? 'hsl(var(--chain))' : levelColor(c.ev.lv);
                return (
                  <li key={i} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setOpenLog(openLog === i ? null : i)}
                      aria-expanded={openLog === i}
                      className="grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 py-3 text-right transition-colors hover:bg-surface-1"
                    >
                      <span className="num-mono text-[0.7rem] text-muted-foreground" dir="ltr" style={{ textAlign: 'right' }}>{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-baseline gap-2">
                          <span className="whitespace-nowrap text-sm">{ITEMS[c.a].l} · {ITEMS[c.b].l}</span>
                          <span className="truncate text-xs" style={{ color }}>{c.isChain ? 'שרשרת · ' : ''}{c.ev.sub}</span>
                        </div>
                        <div className={`mt-0.5 text-xs text-muted-foreground ${openLog === i ? 'leading-relaxed' : 'truncate'}`}><Rich text={c.ev.exp} /></div>
                        {meantSub(c) && <div className="mt-1 text-xs"><span className="label-mono">התכוונתם · </span>{meantSub(c)}</div>}
                        {c.note && <div className="mt-1 text-xs"><span className="label-mono">הקשר שלכם · </span>{c.note}</div>}
                      </div>
                      <span dir="ltr" className="num-mono text-xs" style={{ color }}>+{c.isChain ? c.bonus : c.ev.sc}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {!daily && stats.history.length > 1 && (
          <Section n={next()} kicker="גרף למידה" title="לאן אתם מתקדמים">
            <p className="-mt-3 mb-6 text-lg font-light"><Rich text={trendLine([...stats.history].reverse().map(h => h.total))} /></p>
            <LearningChart history={stats.history} compact />
            <Link to="/scores" className="label-mono link-draw mt-4 inline-block">הגרף המלא והטבלה</Link>
          </Section>
        )}
      </div>
    </main>
  );
}

function ChainRow({ path, levels }: { path: number[]; levels: Level[] }) {
  return (
    <ol className="flex items-start" aria-label={path.map(i => ITEMS[i].l).join(', ')}>
      {path.map((card, k) => (
        <li key={k} className="flex flex-1 items-start last:flex-none">
          <span className="flex w-12 flex-col items-center gap-1 sm:w-14">
            <Glyph i={card} size={36} />
            <span className="truncate text-[0.7rem] text-muted-foreground">{ITEMS[card].l}</span>
          </span>
          {k < path.length - 1 && (
            <span className="mt-[18px] h-[2px] flex-1" style={{ background: levels[k] ? levelColor(levels[k]) : 'hsl(var(--border))' }} />
          )}
        </li>
      ))}
    </ol>
  );
}

function DailyHeadline({ daily, path, directConns, onPlayAgain, onMenu }: {
  daily: DailyConfig; path: number[]; directConns: Connection[]; onPlayAgain: () => void; onMenu: () => void;
}) {
  const [share, setShare] = useState<ShareOutcome | null>(null);
  const score = directConns.reduce((s, c) => s + c.ev.sc, 0);
  const pct = daily.best > 0 ? Math.round((score / daily.best) * 100) : 0;
  const reached = path[path.length - 1] === daily.target;
  const bestLevels = daily.bestPath.slice(1).map((b, i) => evaluate(daily.bestPath[i], b).lv);
  const { dailyResults } = useGame();
  const run = streak(Object.keys(dailyResults));
  const onShare = async () => {
    setShare(await shareText(buildDailyShareText({ number: daily.number, score, best: daily.best, levels: directConns.map(c => c.ev.lv) })));
    setTimeout(() => setShare(null), 2500);
  };
  return (
    <section>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="label-mono flex items-center gap-3">
        <span className="h-px w-8 bg-foreground/40" />
        סיום! · אתגר יומי <span className="num-mono">#{daily.number}</span>
      </motion.h1>
      <div className="mt-4 flex items-end gap-4">
        <AnimatedNumber value={score} duration={1.4} className="display-num text-[7rem] font-thin sm:text-[9rem]" />
        <span className="display-num mb-3 text-4xl text-muted-foreground" dir="ltr">/{daily.best}</span>
      </div>
      <p className="mt-2 text-2xl font-extralight">
        <mark className="hl">{pct}% מהמקסימום</mark> {reached ? 'של היום' : 'לפני שהגעתם ליעד'}
      </p>
      {run > 0 && <p className="label-mono mt-3">רצף · <span className="num-mono text-foreground">{run}</span> {run === 1 ? 'יום' : 'ימים'} · מחר אתגר חדש</p>}

      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8">
        <div>
          <p className="label-mono mb-3">השרשרת שלכם</p>
          <ChainRow path={path} levels={directConns.map(c => c.ev.lv)} />
        </div>
        <div>
          <p className="label-mono mb-3">השרשרת העמוקה ביותר היום · <span className="num-mono">{daily.best}</span></p>
          <ChainRow path={daily.bestPath} levels={bestLevels} />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button onClick={onShare} className="btn btn-primary h-12 px-8 text-base">
          {share === 'copied' ? 'התוצאה הועתקה' : share === 'shared' ? 'שותף' : 'שיתוף התוצאה'}
        </button>
        <button onClick={onPlayAgain} className="btn btn-ghost h-12 px-6 text-sm">לנסות שוב</button>
        <button onClick={onMenu} className="btn btn-text h-12 px-3 text-sm">לדף הבית</button>
      </div>
    </section>
  );
}
