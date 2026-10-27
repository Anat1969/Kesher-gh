import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { playerCode } from '../lib/remote';
import { JoinForm } from './Competition';

type Restore = { state: 'idle' } | { state: 'checking' } | { state: 'bad' } | { state: 'ok'; name: string; added: number };

async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/**
 * Moving between devices without an account: the player code carries the id and private key.
 * A link with #player=CODE opened on another device continues as the same player and pulls the
 * games sent from the first device into the learning graph.
 */
export default function PlayerCode() {
  const { player, restorePlayer } = useGame();
  const [input, setInput] = useState('');
  const [restore, setRestore] = useState<Restore>({ state: 'idle' });
  const [copied, setCopied] = useState<'link' | 'code' | 'fail' | null>(null);
  const boxRef = useRef<HTMLElement>(null);

  const run = async (code: string) => {
    setRestore({ state: 'checking' });
    const res = await restorePlayer(code);
    if (!res) { setRestore({ state: 'bad' }); return; }
    setRestore({ state: 'ok', ...res });
    setInput('');
  };

  // A link from another device: continue right away if this device has no player yet.
  useEffect(() => {
    const m = window.location.hash.match(/player=([A-Za-z0-9_-]+)/);
    if (!m) return;
    history.replaceState(null, '', window.location.pathname);
    boxRef.current?.scrollIntoView({ block: 'center' });
    if (player) setInput(m[1]);
    else void run(m[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  const code = player ? playerCode(player) : '';
  const link = `${window.location.origin}/scores#player=${code}`;
  const onCopy = async (what: 'link' | 'code') => {
    setCopied((await copy(what === 'link' ? link : code)) ? what : 'fail');
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <section ref={boxRef} className="border-t border-foreground/80 pt-5" aria-live="polite">
      <p className="label-mono"><span className="num-mono">02</span> · מעבר בין מכשירים</p>
      <h2 className="mb-3 mt-2 text-3xl font-extralight">אותו שחקן, <mark className="hl">בטלפון ובמחשב</mark></h2>

      {restore.state === 'ok' && (
        <p className="mb-6 border border-foreground/30 p-3 text-base font-light">
          ממשיכים בתור <mark className="hl">{restore.name}</mark>.{' '}
          {restore.added === 1 ? 'משחק אחד נוסף לגרף.' : restore.added > 1 ? `${restore.added} משחקים נוספו לגרף.` : 'הגרף מעודכן.'}
        </p>
      )}

      {player ? (
        <>
          <p className="mb-4 text-muted-foreground">פתחו את הקישור במכשיר השני. <mark className="hl">הציונים והגרף ממשיכים</mark> משם.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onCopy('link')} className="btn btn-primary h-12 px-6 text-base">
              {copied === 'link' ? 'הקישור הועתק' : 'העתקת קישור למכשיר אחר'}
            </button>
            <button onClick={() => onCopy('code')} className="btn btn-ghost h-12 px-5 text-sm">
              {copied === 'code' ? 'הקוד הועתק' : 'העתקת הקוד'}
            </button>
          </div>
          {copied === 'fail' && <p className="label-mono mt-2">ההעתקה נחסמה. סמנו את הקוד והעתיקו ידנית.</p>}
          <p className="num-mono mt-4 select-all break-all border border-dashed border-border p-2 text-[0.7rem] text-muted-foreground" dir="ltr" aria-label="קוד שחקן">{code}</p>
          <p className="label-mono mt-2">מי שמחזיק בקוד משחק בשמכם. שלחו אותו רק לעצמכם.</p>
        </>
      ) : (
        <>
          <p className="mb-3 text-muted-foreground">עוד אין לכם שחקן. בחרו כינוי, או הדביקו קוד ממכשיר אחר.</p>
          <JoinForm />
        </>
      )}

      <form
        className="mt-8"
        onSubmit={e => { e.preventDefault(); if (input.trim()) void run(input); }}
      >
        <label className="label-mono mb-2 block" htmlFor="player-code">יש לכם קוד ממכשיר אחר?</label>
        <div className="flex flex-wrap gap-2">
          <input
            id="player-code"
            value={input}
            onChange={e => { setInput(e.target.value); if (restore.state === 'bad') setRestore({ state: 'idle' }); }}
            placeholder="הדביקו קוד או קישור"
            dir="ltr"
            autoComplete="off"
            className="num-mono h-12 min-w-0 flex-1 basis-48 rounded-[var(--radius)] border border-foreground/25 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />
          <button type="submit" disabled={!input.trim() || restore.state === 'checking'} className="btn btn-ghost h-12 px-5 text-sm disabled:opacity-40">
            {restore.state === 'checking' ? 'בודק…' : 'המשך כשחקן הזה'}
          </button>
        </div>
        {restore.state === 'bad' && <p className="mt-2 text-sm">הקוד <mark className="hl">לא נמצא</mark>, או שאין חיבור כרגע.</p>}
        {player && <p className="label-mono mt-2">הקוד יחליף את השחקן הנוכחי במכשיר הזה.</p>}
      </form>
    </section>
  );
}
