import type { ReactNode } from 'react';
import Rich from './Rich';
import { TOPICS, type ArticleTopic } from '../lib/articleTopics';

export interface ArticleProps {
  no: number;
  of: number;
  topic: ArticleTopic;
  title: string;
  /** One line, up to about eight words, with **highlight**. */
  insight: string;
  quote: { text: string; who: string; where: string };
  /** Paragraphs; each sentence is set on its own line. */
  body: string[];
  figure: ReactNode;
  figureCaption: string;
  /** Three short lines that close the sheet. */
  lines: [string, string, string];
  /** Printing this sheet only. */
  onPrint: () => void;
}

const sentences = (p: string) => p.split(/(?<=[.?!])\s+(?=\S)/);
const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * One article as a sheet from a drawing set: A4 proportion, a hairline frame, a figure drawn
 * in the game's own glyphs, and a title block in the corner, as on an architect's sheet.
 */
export default function ArticleSheet(p: ArticleProps) {
  const topic = TOPICS.find(t => t.id === p.topic)!;
  return (
    <article className="article-sheet" data-sheet={p.no} aria-label={p.title}>
      <div className="flex h-full flex-col border border-foreground/70 p-5 sm:p-8">
        <header className="flex items-baseline justify-between gap-4 border-b border-foreground/70 pb-3">
          <p className="label-mono">{topic.label} · גיליון <span className="num-mono">{pad2(p.no)}</span></p>
          <p className="label-mono hidden sm:block">קֶשֶׁר · KESHER</p>
        </header>

        <h2 className="mt-5 text-[2rem] font-thin leading-[1.1] sm:text-[2.6rem]">{p.title}</h2>
        <p className="mt-3 text-xl font-light"><Rich text={p.insight} /></p>

        <figure className="mt-6">
          <div className="well p-4 sm:p-5">{p.figure}</div>
          <figcaption className="label-mono mt-2">{p.figureCaption}</figcaption>
        </figure>

        <blockquote className="mt-6 border-r-2 border-foreground/70 pr-4">
          <p className="text-xl font-extralight leading-snug">"{p.quote.text}"</p>
          <footer className="mt-1 text-xs text-muted-foreground">{p.quote.who} · {p.quote.where}</footer>
        </blockquote>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-4 text-[0.95rem] leading-relaxed md:grid-cols-2">
          {p.body.map((para, i) => (
            <p key={i}>
              {sentences(para).map((s, k) => <span key={k} className="block"><Rich text={s} /></span>)}
            </p>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="grid grid-cols-[minmax(0,1fr)] items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <p className="text-lg font-extralight leading-snug">
              {p.lines.map((l, i) => <span key={i} className="block">{l}</span>)}
            </p>
            {/* Title block, as in the corner of a drawing sheet */}
            <dl className="grid w-full grid-cols-[auto_minmax(0,1fr)] border border-foreground/70 text-xs sm:w-[260px]">
              <dt className="label-mono border-b border-l border-foreground/30 px-2 py-1">כתבה</dt>
              <dd className="truncate border-b border-foreground/30 px-2 py-1">{p.title}</dd>
              <dt className="label-mono border-b border-l border-foreground/30 px-2 py-1">נושא</dt>
              <dd className="border-b border-foreground/30 px-2 py-1">{topic.label}</dd>
              <dt className="label-mono border-l border-foreground/30 px-2 py-1">גיליון</dt>
              <dd className="num-mono px-2 py-1" dir="ltr" style={{ textAlign: 'right' }}>{pad2(p.no)}/{pad2(p.of)}</dd>
            </dl>
          </div>
          <div className="no-print mt-4 flex gap-2">
            <button type="button" onClick={p.onPrint} className="btn btn-ghost h-10 px-4 text-sm">הדפסה או שמירה כ-PDF</button>
          </div>
        </div>
      </div>
    </article>
  );
}
