export interface GameItem {
  e: string;   // emoji
  l: string;   // label (Hebrew)
  p: string;   // primary category
  s: string;   // sub-category
  arch: string; // archetype
  proc: string; // process
  par: string;  // paradox
  t: string[];  // tags
}

export const ITEMS: GameItem[] = [
  {e:'🌱',l:'נבט',   p:'nature', s:'plant',  arch:'innocent', proc:'growth',   par:'death gives life',  t:['growth','life','potential','beginning','small','green','fragile','earth']},
  {e:'🌹',l:'ורד',   p:'nature', s:'plant',  arch:'lover',    proc:'blooming', par:'beauty hides pain',  t:['beauty','love','ephemeral','fragile','red','thorns','passion','flower']},
  {e:'🦋',l:'פרפר',  p:'animal', s:'air',    arch:'self',     proc:'transform',par:'death reborn as beauty',t:['transformation','beauty','flight','ephemeral','freedom','colorful','delicate']},
  {e:'🌀',l:'מערבולת',p:'nature',s:'water',  arch:'shadow',   proc:'spiral',   par:'chaos has order',    t:['spiral','chaos','force','motion','fibonacci','depth','pattern','vortex']},
  {e:'🌊',l:'גל',    p:'nature', s:'water',  arch:'self',     proc:'wave',     par:'destroys and creates',t:['power','motion','cyclic','rhythm','flow','wave','destruction','creation']},
  {e:'🐟',l:'דג',    p:'animal', s:'water',  arch:'self',     proc:'flow',     par:'silent world beneath',t:['silent','freedom','depth','hidden','nature','water','survival','ancient']},
  {e:'🗝️',l:'מפתח',  p:'object', s:'tool',   arch:'hero',     proc:'unlock',   par:'access denied is access revealed',t:['access','mystery','unlock','solution','metal','precision','control']},
  {e:'💎',l:'יהלום', p:'object', s:'gem',    arch:'self',     proc:'compress', par:'beauty from pressure',t:['beauty','rare','value','light','hard','crystal','pressure','clarity','carbon']},
  {e:'☀️',l:'שמש',   p:'nature', s:'sky',    arch:'hero',     proc:'radiate',  par:'creator and destroyer',t:['light','energy','warmth','life','power','fire','nuclear','cyclic','gold']},
  {e:'🔥',l:'אש',    p:'nature', s:'fire',   arch:'trickster',proc:'consume',  par:'creates by destroying',t:['energy','danger','transformation','power','light','heat','consume','purify']},
  {e:'⚡',l:'ברק',   p:'nature', s:'sky',    arch:'hero',     proc:'discharge',par:'silence before the roar',t:['energy','power','danger','speed','light','force','electric','sudden']},
  {e:'🏔️',l:'הר',    p:'nature', s:'earth',  arch:'sage',     proc:'endure',   par:'reaches heaven stays earth',t:['solid','eternal','silence','power','majesty','tall','ancient','witness']},
  {e:'🌙',l:'ירח',   p:'nature', s:'sky',    arch:'anima',    proc:'reflect',  par:'shines with borrowed light',t:['night','mystery','cyclic','light','silence','reflection','feminine','tides']},
  {e:'🔭',l:'טלסקופ',p:'object', s:'science',arch:'hero',     proc:'extend',   par:'sees far misses near',t:['vision','discovery','precision','exploration','distance','extend','reveal']},
  {e:'🌐',l:'עולם',  p:'abstract',s:'global', arch:'self',    proc:'connect',  par:'together we are alone',t:['complexity','connection','whole','unity','diversity','map','infinite']},
  {e:'🧩',l:'פאזל',  p:'abstract',s:'logic',  arch:'sage',    proc:'complete', par:'confusion is pre-completion',t:['complexity','parts','solution','pattern','fit','missing','order','chaos']},
  {e:'🎯',l:'מטרה',  p:'abstract',s:'goal',   arch:'hero',    proc:'focus',    par:'hitting the target misses the journey',t:['focus','precision','achievement','direction','clarity','purpose']},
  {e:'⚖️',l:'מאזניים',p:'abstract',s:'justice',arch:'sage',   proc:'balance',  par:'justice is always incomplete',t:['balance','decision','equality','truth','measurement','weight','judgment']},
  {e:'🎭',l:'מסכה',  p:'art',    s:'theater', arch:'trickster',proc:'conceal', par:'the mask reveals more than it hides',t:['identity','illusion','emotion','role','duality','hide','reveal','theater']},
  {e:'📖',l:'ספר',   p:'art',    s:'knowledge',arch:'sage',   proc:'record',   par:'written words are living thoughts',t:['wisdom','story','language','time','record','knowledge','portal','memory']},
  {e:'🎵',l:'תו',    p:'art',    s:'music',   arch:'anima',   proc:'vibrate',  par:'silence makes music possible',t:['emotion','pattern','beauty','language','rhythm','wave','vibration','time']},
  {e:'💡',l:'רעיון', p:'abstract',s:'mind',   arch:'hero',    proc:'illuminate',par:'appears from nothing',t:['creativity','insight','light','discovery','innovation','electricity','sudden','potential']},
  {e:'🔮',l:'בדולח', p:'object', s:'mystery', arch:'anima',   proc:'predict',  par:'reveals future by reflecting present',t:['mystery','future','vision','prediction','crystal','sphere','light','illusion']},
  {e:'🕰️',l:'שעון',  p:'object', s:'time',    arch:'sage',    proc:'measure',  par:'counts what cannot be stopped',t:['time','precision','cycle','order','measurement','past','mortality','motion']},
  {e:'🦁',l:'אריה',  p:'animal', s:'land',    arch:'ruler',   proc:'dominate', par:'king who fears nothing fears death',t:['power','leadership','danger','wild','majesty','pride','king','strength','gold']}
];

export const SCORE_VALUES = { p: 5, r: 10, d: 18, s: 30 } as const;
export const CHAIN_RATIO = 0.4;

export type Level = 'p' | 'r' | 'd' | 's';

export const LEVEL_COLORS: Record<Level, string> = {
  p: 'hsl(var(--level-pshat))',
  r: 'hsl(var(--level-remez))',
  d: 'hsl(var(--level-drash))',
  s: 'hsl(var(--level-sod))',
};

const LEVEL_VARS: Record<Level, string> = {
  p: '--level-pshat',
  r: '--level-remez',
  d: '--level-drash',
  s: '--level-sod',
};

/** Theme-aware level colour with optional alpha, usable in inline styles and SVG `style`. */
export function levelColor(lv: Level, alpha = 1): string {
  return alpha >= 1 ? `hsl(var(${LEVEL_VARS[lv]}))` : `hsl(var(${LEVEL_VARS[lv]}) / ${alpha})`;
}

export const LEVEL_ORDER: readonly Level[] = ['p', 'r', 'd', 's'];

export const LEVEL_NAMES: Record<Level, string> = {
  p: 'פָּשָׁט',
  r: 'רֶמֶז',
  d: 'דְּרָשׁ',
  s: 'סוֹד',
};

export const LEVEL_CSS_CLASSES: Record<Level, string> = {
  p: 'text-level-pshat',
  r: 'text-level-remez',
  d: 'text-level-drash',
  s: 'text-level-sod',
};

export const LEVEL_BG_CLASSES: Record<Level, string> = {
  p: 'bg-level-pshat',
  r: 'bg-level-remez',
  d: 'bg-level-drash',
  s: 'bg-level-sod',
};

export interface Milestone {
  pts: number;
  lbl: string;
}

export const MILESTONES: Milestone[] = [
  { pts: 50, lbl: 'מתחיל לראות' },
  { pts: 100, lbl: 'מגלה קשרים' },
  { pts: 200, lbl: 'חושב עמוק' },
  { pts: 300, lbl: 'יצירתיות גבוהה' },
  { pts: 500, lbl: 'ראיית הנסתר' },
  { pts: 800, lbl: 'מאסטר' },
];
