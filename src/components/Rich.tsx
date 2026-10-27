import { Fragment } from 'react';

/** Renders text where **phrase** marks the words that carry the meaning, as a highlighter. */
export default function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <span className={className}>
      {parts.map((p, i) => (i % 2 ? <mark key={i} className="hl">{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </span>
  );
}
