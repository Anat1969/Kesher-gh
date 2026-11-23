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
  {e:'🦁',l:'אריה',  p:'animal', s:'land',    arch:'ruler',   proc:'dominate', par:'king who fears nothing fears death',t:['power','leadership','danger','wild','majesty','pride','king','strength','gold']},
  // ── Second set (25–49): more concepts, the human body and the built world ──
  {e:'🌳',l:'עץ',    p:'nature', s:'plant',   arch:'sage',    proc:'root',     par:'the deeper the roots the higher the crown',t:['growth','life','ancient','earth','green','time','connection','witness']},
  {e:'⭐',l:'כוכב',  p:'nature', s:'sky',     arch:'innocent',proc:'shine',    par:'its light may outlive it',t:['light','distance','past','night','nuclear','infinite','direction','sky']},
  {e:'🌈',l:'קשת',   p:'nature', s:'sky',     arch:'innocent',proc:'refract',  par:'exists only where you stand',t:['colorful','light','ephemeral','beauty','reflection','water','sky']},
  {e:'👁️',l:'עין',   p:'human',  s:'body',    arch:'sage',    proc:'see',      par:'sees everything but itself',t:['vision','light','reflection','clarity','identity','emotion','focus','precision']},
  {e:'❤️',l:'לב',    p:'human',  s:'body',    arch:'lover',   proc:'beat',     par:'the strongest muscle is the symbol of softness',t:['love','emotion','rhythm','life','passion','red','cyclic','strength']},
  {e:'👤',l:'צל',    p:'abstract',s:'light',  arch:'shadow',  proc:'follow',   par:'made of the absence of light',t:['night','hide','duality','illusion','light','silent','identity','motion']},
  {e:'💭',l:'חלום',  p:'abstract',s:'mind',   arch:'anima',   proc:'imagine',  par:'most real while it is not',t:['illusion','future','story','memory','night','creativity','hidden','emotion']},
  {e:'♾️',l:'אינסוף',p:'abstract',s:'math',   arch:'self',    proc:'extend',   par:'endless fits between zero and one',t:['infinite','cyclic','mystery','pattern','time','eternal','distance']},
  {e:'🌀',l:'מבוך',  p:'built',  s:'path',    arch:'trickster',proc:'wind',    par:'the way to the centre leads away from it',t:['complexity','solution','mystery','direction','pattern','spiral','ancient','story']},
  {e:'🪞',l:'מראה',  p:'object', s:'glass',   arch:'trickster',proc:'reflect', par:'shows you as no one else sees you',t:['reflection','illusion','identity','light','clarity','duality','vision','truth']},
  {e:'🌉',l:'גשר',   p:'built',  s:'span',    arch:'hero',    proc:'span',     par:'connects by standing over the gap',t:['connection','access','direction','balance','unity','portal','solid','distance']},
  {e:'🕯️',l:'נר',    p:'object', s:'light',   arch:'innocent',proc:'burn',     par:'gives light by consuming itself',t:['light','fire','consume','ephemeral','warmth','time','memory','silence']},
  {e:'🪶',l:'נוצה',  p:'animal', s:'air',     arch:'innocent',proc:'float',    par:'the lightest thing weighs the heart',t:['flight','delicate','freedom','weight','truth','judgment','language','small']},
  {e:'🐝',l:'דבורה', p:'animal', s:'air',     arch:'ruler',   proc:'gather',   par:'the smallest one feeds the world',t:['order','pattern','language','small','gold','survival','connection','precision']},
  {e:'🪨',l:'אבן',   p:'nature', s:'earth',   arch:'sage',    proc:'endure',   par:'the hardest is shaped by the softest',t:['solid','hard','ancient','witness','record','silence','weight','time']},
  {e:'☁️',l:'ענן',   p:'nature', s:'sky',     arch:'trickster',proc:'drift',   par:'tons of water that float',t:['water','motion','ephemeral','flow','illusion','cyclic','sky','hide']},
  {e:'🧠',l:'זיכרון',p:'abstract',s:'mind',   arch:'sage',    proc:'recall',   par:'every recall rewrites it',t:['memory','past','story','record','identity','time','emotion','hidden']},
  {e:'🤫',l:'שתיקה', p:'abstract',s:'sound',  arch:'sage',    proc:'pause',    par:'music is made of it',t:['silence','silent','depth','rhythm','mystery','truth','emotion']},
  {e:'🕊️',l:'חופש',  p:'abstract',s:'value',  arch:'hero',    proc:'release',  par:'needs a limit to exist',t:['freedom','flight','decision','direction','identity','potential','unlock','wild']},
  {e:'🔤',l:'מילה',  p:'art',    s:'language',arch:'sage',    proc:'name',     par:'is not the thing and yet makes it',t:['language','record','story','identity','creation','connection','knowledge','power']},
  {e:'0️⃣',l:'אפס',   p:'abstract',s:'math',   arch:'trickster',proc:'hold place',par:'nothing that makes every number possible',t:['missing','pattern','measurement','beginning','order','mystery','precision','infinite']},
  {e:'🗼',l:'מגדלור',p:'built',  s:'tower',   arch:'hero',    proc:'signal',   par:'warns away from where it stands',t:['light','direction','danger','solid','tall','vision','cyclic','silence']},
  {e:'🏠',l:'בית',   p:'built',  s:'home',    arch:'self',    proc:'shelter',  par:'four walls hold a whole world',t:['identity','memory','solid','unity','life','order','earth','whole']},
  {e:'💃',l:'מחול',  p:'art',    s:'dance',   arch:'lover',   proc:'move',     par:'goes nowhere and arrives',t:['rhythm','motion','emotion','language','pattern','beauty','cyclic','passion']},
  {e:'🐚',l:'צדף',   p:'nature', s:'water',   arch:'self',    proc:'coil',     par:'an empty shell holds the sound of the sea',t:['spiral','fibonacci','pattern','water','hidden','ancient','beauty','record']}
];

/** Cards on one board. The pool holds more; each game deals a board from it. */
export const BOARD_SIZE = 25;
/** The original board, and the second set. */
export const CLASSIC_DECK: readonly number[] = Array.from({ length: 25 }, (_, i) => i);
export const NEW_DECK: readonly number[] = Array.from({ length: ITEMS.length - 25 }, (_, i) => 25 + i);

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
