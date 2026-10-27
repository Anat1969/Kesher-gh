/** Marks the lead clause of a long text (up to the first dash, comma or period). */
export const markLead = (text: string) => {
  if (text.includes('**')) return text;
  const m = text.match(/^(.{12,90}?)([—,.;:])/);
  return m ? `**${m[1].trim()}**${text.slice(m[1].length)}` : text;
};

/** The same text without markers, for share text and screen-reader labels. */
export const plain = (text: string) => text.replace(/\*\*(.+?)\*\*/g, '$1');
