import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { levelColor } from '../game/gameItems';
import type { Connection } from '../game/personality';
import { buildStory, storyText } from '../lib/story';
import { fetchLiteraryStory, type LiteraryStory } from '../lib/remote';
import { plain } from '../lib/marker';
import Glyph from './Glyph';
import Rich from './Rich';

const EASE = [0.23, 1, 0.32, 1] as const;

type Lit = { state: 'idle' } | { state: 'loading' } | { state: 'error' } | { state: 'ok'; story: LiteraryStory };

/**
 * The player's chain told as one story, picture to picture. The written story is built from
 * the game's own readings (always there, offline too); a literary retelling can be asked for,
 * written by a language model from the same facts only.
 */
export default function StoryCard({ path, directConns }: { path: number[]; directConns: Connection[] }) {
  const story = useMemo(() => buildStory(path, directConns), [path, directConns]);
  const [view, setView] = useState<'mine' | 'lit'>('mine');
  const [lit, setLit] = useState<Lit>({ state: 'idle' });
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => () => { if (canSpeak) window.speechSynthesis.cancel(); }, [canSpeak]);
  if (!story) return null;

  const text = view === 'lit' && lit.state === 'ok'
    ? [lit.story.title, ...lit.story.paragraphs, lit.story.closing].map(plain).join('\n\n')
    : storyText(story);

  const speak = () => {
    if (!canSpeak) return;
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'he-IL';
    u.rate = 0.95;
    const he = synth.getVoices().find(v => v.lang?.startsWith('he'));
    if (he) u.voice = he;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  };

  const literary = async () => {
    if (lit.state === 'ok') { setView(view === 'lit' ? 'mine' : 'lit'); return; }
    setLit({ state: 'loading' });
    const res = await fetchLiteraryStory(story.facts);
    if (res) { setLit({ state: 'ok', story: res }); setView('lit'); } else setLit({ state: 'error' });
  };

  return (
    <section className="mt-12 border-t border-foreground/80 pt-5" aria-label="סיפור השרשרת">
      <p className="label-mono">סיפור השרשרת</p>
      <h2 className="mt-2 text-3xl font-extralight sm:text-4xl">
        {view === 'lit' && lit.state === 'ok' ? <Rich text={lit.story.title} /> : story.title}
      </h2>

      {/* The chain itself, picture after picture, coloured by the depth of each step */}
      <ol className="scrollbar-none mt-5 flex items-center gap-1 overflow-x-auto pb-1" aria-label="המילים לפי סדר הבחירה">
        {path.map((card, i) => {
          const c = i > 0 ? directConns[i - 1] : undefined;
          return (
            <li key={`${card}-${i}`} className="flex flex-shrink-0 items-center gap-1">
              {c && <span className="h-[2px] w-4" style={{ background: levelColor(c.meantLv ?? c.ev.lv) }} aria-hidden="true" />}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.2, ease: EASE }}
              >
                <Glyph i={card} size={30} />
              </motion.span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-4 text-[1.08rem] font-light leading-[1.85]">
        {view === 'lit' && lit.state === 'ok' ? (
          <>
            {lit.story.paragraphs.map((p, i) => <p key={i}><Rich text={p} /></p>)}
            <p className="border-r-2 border-foreground/70 pr-3"><Rich text={lit.story.closing} /></p>
            <p className="label-mono">גרסה ספרותית, נכתבה במודל שפה ({lit.story.by === 'claude' ? 'Claude' : 'Gemini'}) מתוך העובדות של השרשרת בלבד.</p>
          </>
        ) : (
          <>
            {story.paragraphs.map((para, i) => (
              <p key={i}>
                {para.map((b, k) => (
                  <span key={k} className="ml-1">
                    {b.level && <span className="mx-1 inline-block h-[0.55em] w-[0.55em] rounded-full align-middle" style={{ background: levelColor(b.level) }} aria-hidden="true" />}
                    <Rich text={b.text} />
                  </span>
                ))}
              </p>
            ))}
            <p className="border-r-2 border-foreground/70 pr-3"><Rich text={story.closing} /></p>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {canSpeak && (
          <button type="button" onClick={speak} aria-pressed={speaking} className={`btn h-11 px-5 text-sm ${speaking ? 'btn-primary' : 'btn-ghost'}`}>
            {speaking ? 'עצירת ההקראה' : 'הקראת הסיפור'}
          </button>
        )}
        <button type="button" onClick={literary} disabled={lit.state === 'loading'} className="btn btn-ghost h-11 px-5 text-sm disabled:opacity-50">
          {lit.state === 'loading' ? 'כותב…' : lit.state === 'ok' ? (view === 'lit' ? 'הסיפור מהקריאות' : 'הגרסה הספרותית') : 'כתיבה ספרותית'}
        </button>
        <button type="button" onClick={copy} className="btn btn-ghost h-11 px-5 text-sm">{copied ? 'הסיפור הועתק' : 'העתקת הסיפור'}</button>
      </div>
      {lit.state === 'error' && <p className="label-mono mt-2">הכתיבה הספרותית לא זמינה כרגע. הסיפור מהקריאות נשאר כאן.</p>}
    </section>
  );
}
