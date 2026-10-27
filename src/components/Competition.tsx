import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { fetchBoard, type BoardRow, type Mode } from '../lib/remote';
import { dateKey } from '../game/daily';

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
            <Link to="/scores" className="label-mono link-draw mt-3 inline-block">לטבלה ולגרף הלמידה</Link>
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

type Load = { state: 'loading' } | { state: 'error' } | { state: 'ok'; rows: BoardRow[] };

/** One leaderboard: each player's best, the viewer's row marked. */
export function Leaderboard({ mode }: { mode: Mode }) {
  const { player, remote } = useGame();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const day = dateKey();
  // Refetch after the viewer's own score lands, so their row is current.
  const sent = remote.status === 'done' ? remote.best : 0;

  useEffect(() => {
    let live = true;
    setLoad({ state: 'loading' });
    fetchBoard(mode, mode === 'daily' ? day : null).then(rows => {
      if (live) setLoad(rows ? { state: 'ok', rows } : { state: 'error' });
    });
    return () => { live = false; };
  }, [mode, day, sent, player?.name]);

  if (load.state === 'loading') return <p className="py-8 text-muted-foreground">טוען את הטבלה…</p>;
  if (load.state === 'error') return <p className="py-8 text-muted-foreground">אין חיבור לטבלה כרגע. נסו שוב בעוד רגע.</p>;
  if (load.rows.length === 0) {
    return (
      <p className="py-8 text-lg font-extralight">
        {mode === 'daily' ? <>עוד אין תוצאות לאתגר של היום. <mark className="hl">המקום הראשון פנוי</mark>.</> : <>הטבלה ריקה. <mark className="hl">המקום הראשון פנוי</mark>.</>}
      </p>
    );
  }

  const mine = load.rows.some(r => r.player_id === player?.id);
  return (
    <>
      <ol className="grid grid-cols-[minmax(0,1fr)]" aria-label={mode === 'daily' ? 'טבלת האתגר היומי' : 'טבלה כללית'}>
        {load.rows.map(r => {
          const me = r.player_id === player?.id;
          return (
            <li
              key={r.player_id}
              className={`grid grid-cols-[2.5rem_minmax(0,1fr)_auto_3.5rem] items-baseline gap-3 border-b border-border px-2 py-3 ${me ? 'bg-surface-3' : ''}`}
            >
              <span className={`num-mono text-sm ${r.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`} dir="ltr" style={{ textAlign: 'right' }}>{String(r.rank).padStart(2, '0')}</span>
              <span className={`truncate text-lg ${r.rank === 1 ? 'font-normal' : 'font-light'}`}>
                {me ? <mark className="hl">{r.name}</mark> : r.name}
                {me && <span className="label-mono mr-2">אתם</span>}
              </span>
              <span className="num-mono text-lg" dir="ltr">{r.best}</span>
              <span className="label-mono text-left" title="משחקים">{r.games} מש׳</span>
            </li>
          );
        })}
      </ol>
      {player && !mine && <p className="label-mono mt-3">הכינוי שלכם לא בעשרים הראשונים, או שעוד לא שיחקתם כאן.</p>}
    </>
  );
}
