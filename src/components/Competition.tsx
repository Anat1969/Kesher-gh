import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { fetchBoard, type BoardRow, type Mode } from '../lib/remote';
import { dateKey } from '../game/daily';
import { sonReached, sonResults } from '../game/sons';
import { levelColor, LEVEL_ORDER, type Level } from '../game/gameItems';

/** Nickname field: the only thing besides the score that leaves the device. */
export function JoinForm({ cta = 'הצטרפות לתחרות', initial = '', onDone }: { cta?: string; initial?: string; onDone?: () => void }) {
  const { joinBoard } = useGame();
  const [name, setName] = useState(initial);
  const valid = name.trim().length > 0;
  return (
    <form
      className="flex flex-wrap items-stretch gap-2"
      onSubmit={e => { e.preventDefault(); if (valid) { joinBoard(name); onDone?.(); } }}
    >
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={24}
        aria-label="כינוי לטבלה"
        placeholder="כינוי לטבלה"
        autoComplete="nickname"
        className="h-12 min-w-0 flex-1 basis-40 rounded-[var(--radius)] border border-foreground/25 bg-transparent px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
      />
      <button type="submit" disabled={!valid} className="btn btn-primary h-12 px-6 text-base disabled:opacity-40">{cta}</button>
    </form>
  );
}

/** Results screen: where this game stands among all players. */
export function CompetitionCard({ mode }: { mode: Mode }) {
  const { player, remote } = useGame();
  const board = mode === 'daily' ? 'בטבלת האתגר היומי' : 'בטבלה הכללית';

  return (
    <section className="mt-12 border-t border-foreground/80 pt-5" aria-live="polite">
      <p className="label-mono">תחרות</p>
      {!player ? (
        <>
          <p className="mt-2 text-2xl font-extralight">הציון הגבוה של כל משתתף, <mark className="hl">בטבלה אחת משותפת</mark>.</p>
          <p className="label-mono mt-2">נשמרים רק הכינוי והציון. בלי הרשמה.</p>
          <div className="mt-5 max-w-[520px]"><JoinForm /></div>
        </>
      ) : remote.status === 'done' ? (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6">
          <div>
            <p className="text-2xl font-extralight">
              <mark className="hl">מקום {remote.rank}</mark> {board}
            </p>
            <p className="label-mono mt-2">{player.name} · השיא שלכם <span className="num-mono" dir="ltr">{remote.best}</span></p>
            {mode === 'classic' && <SonLine score={remote.best} />}
            <Link to="/board" className="label-mono link-draw mt-3 inline-block">לטבלה המלאה</Link>
          </div>
          <div className="display-num text-6xl" dir="ltr">#{remote.rank}</div>
        </div>
      ) : remote.status === 'sending' ? (
        <p className="mt-2 text-2xl font-extralight text-muted-foreground">שולח את הציון לטבלה…</p>
      ) : remote.status === 'error' ? (
        <>
          <p className="mt-2 text-2xl font-extralight">הציון <mark className="hl">נשמר במכשיר</mark>, אבל לא הגיע לטבלה.</p>
          <p className="label-mono mt-2">אין חיבור כרגע. המשחק הבא יישלח כרגיל.</p>
        </>
      ) : (
        <p className="mt-2 text-2xl font-extralight">משחקים בשם <mark className="hl">{player.name}</mark>.</p>
      )}
    </section>
  );
}

const sonThe = (name: string) => (name.startsWith('שאינו') ? `בן ${name}` : name);

/** Which of the four sons a score reaches. */
export function SonLine({ score }: { score: number }) {
  const son = sonReached(score);
  const sons = sonResults();
  const next = son ? sons[sons.indexOf(son) - 1] : sons[sons.length - 1];
  return (
    <p className="mt-2 text-base font-light">
      {son ? <>ברמת <mark className="hl">{sonThe(son.name)}</mark></> : <>עוד לפני <mark className="hl">{sonThe(sons[sons.length - 1].name)}</mark></>}
      {next && <span className="text-muted-foreground"> · עוד <span className="num-mono" dir="ltr">{next.best - score}</span> נקודות ל{sonThe(next.name)}</span>}
    </p>
  );
}

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ok'; rows: BoardRow[] };

type Row =
  | { kind: 'player'; id: string; name: string; best: number; games: number }
  | { kind: 'son'; id: string; name: string; best: number; deepest: Level };

/**
 * One leaderboard: each player's best, the viewer's row marked. The all-time board always holds
 * the four sons as standing rows, so every score can be read against a level of thinking.
 */
export function Leaderboard({ mode }: { mode: Mode }) {
  const { player, remote } = useGame();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const day = dateKey();
  // Refetch after the viewer's own score lands, so their row is current.
  const sent = remote.status === 'done' ? remote.best : 0;
  const withSons = mode === 'classic';

  useEffect(() => {
    let live = true;
    setLoad({ state: 'loading' });
    fetchBoard(mode, mode === 'daily' ? day : null).then(rows => {
      if (live) setLoad(rows ? { state: 'ok', rows } : { state: 'error' });
    });
    return () => { live = false; };
  }, [mode, day, sent, player?.name]);

  const players: Row[] = load.state === 'ok' ? load.rows.map(r => ({ kind: 'player', id: r.player_id, name: r.name, best: r.best, games: r.games })) : [];
  const sons: Row[] = withSons
    ? sonResults().map(s => ({ kind: 'son', id: s.id, name: s.name, best: s.best, deepest: LEVEL_ORDER.filter(l => s.sees.includes(l)).pop()! }))
    : [];
  const rows = [...players, ...sons].sort((a, b) => b.best - a.best || (a.kind === 'son' ? 1 : -1));
  const mine = players.some(r => r.id === player?.id);

  return (
    <>
      {load.state === 'loading' && <p className="py-4 text-muted-foreground">טוען את הטבלה…</p>}
      {load.state === 'error' && <p className="py-4 text-muted-foreground">אין חיבור לטבלה כרגע. {withSons ? 'ארבעת הבנים מוצגים בינתיים.' : 'נסו שוב בעוד רגע.'}</p>}
      {load.state === 'ok' && players.length === 0 && (
        <p className="py-4 text-lg font-extralight">
          {mode === 'daily' ? <>עוד אין תוצאות לאתגר של היום. <mark className="hl">המקום הראשון פנוי</mark>.</> : <>עוד אין משתתפים. <mark className="hl">המקום הראשון פנוי</mark>.</>}
        </p>
      )}
      {rows.length > 0 && (
        <ol className="grid grid-cols-[minmax(0,1fr)]" aria-label={mode === 'daily' ? 'טבלת האתגר היומי' : 'טבלה כללית'}>
          {rows.map((r, i) => {
            const me = r.kind === 'player' && r.id === player?.id;
            const son = r.kind === 'son';
            return (
              <li
                key={r.id}
                className={`grid grid-cols-[2.5rem_minmax(0,1fr)_auto_3.5rem] items-baseline gap-3 border-b px-2 py-3 ${me ? 'bg-surface-3' : ''} ${son ? 'border-dashed border-foreground/30' : 'border-border'}`}
              >
                <span className={`num-mono text-sm ${i < 3 ? 'text-foreground' : 'text-muted-foreground'}`} dir="ltr" style={{ textAlign: 'right' }}>{String(i + 1).padStart(2, '0')}</span>
                <span className={`truncate text-lg ${i === 0 ? 'font-normal' : 'font-light'}`}>
                  {son ? (
                    <>
                      <span className="ml-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: levelColor(r.deepest) }} aria-hidden="true" />
                      <span style={{ color: levelColor(r.deepest) }}>{r.name}</span>
                      <span className="label-mono mr-2">דמות</span>
                    </>
                  ) : me ? <mark className="hl">{r.name}</mark> : r.name}
                  {me && <span className="label-mono mr-2">אתם</span>}
                </span>
                <span className="num-mono text-lg" dir="ltr">{r.best}</span>
                <span className="label-mono text-left">{r.kind === 'player' ? `${r.games} מש׳` : ''}</span>
              </li>
            );
          })}
        </ol>
      )}
      {player && load.state === 'ok' && !mine && <p className="label-mono mt-3">הכינוי שלכם לא בעשרים הראשונים, או שעוד לא שיחקתם כאן.</p>}
    </>
  );
}
