interface SplashScreenProps {
  onStart: () => void;
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 25%, hsl(var(--gold) / 0.07), transparent 65%)' }}
    >
      <h1 className="font-display text-[6rem] font-black text-gold-light tracking-wider mb-1 leading-none">קֶשֶׁר</h1>
      <p className="text-sm text-muted-foreground tracking-wide mb-9">מצא קשרים – המערכת מגלה את עומקם</p>

      {/* Level cards */}
      <div className="grid grid-cols-2 gap-2.5 max-w-[500px] w-full mb-6">
        {/* Pshat */}
        <div className="bg-surface-1 border border-border rounded-xl p-3.5 text-right">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-level-pshat" />
            <span className="font-display text-base font-bold text-level-pshat">פָּשָׁט</span>
            <span className="text-[0.68rem] text-muted-foreground mr-auto">נק' 5</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">קשר גלוי</strong> – מה שכולם רואים מיד</div>
          <div className="text-[0.67rem] text-muted-foreground/60 mt-1 italic">שניהם מהטבע · שניהם עגולים · שניהם מאירים</div>
        </div>
        {/* Remez */}
        <div className="bg-surface-1 border border-border rounded-xl p-3.5 text-right">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-level-remez" />
            <span className="font-display text-base font-bold text-level-remez">רֶמֶז</span>
            <span className="text-[0.68rem] text-muted-foreground mr-auto">נק' 10</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">קשר סמלי</strong> – מטאפורה, ייצוג תרבותי</div>
          <div className="text-[0.67rem] text-muted-foreground/60 mt-1 italic">אחד מסמל את השני · קשר מיתולוגי · הפכים</div>
        </div>
        {/* Drash */}
        <div className="bg-surface-1 border border-border rounded-xl p-3.5 text-right">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-level-drash" />
            <span className="font-display text-base font-bold text-level-drash">דְּרָשׁ</span>
            <span className="text-[0.68rem] text-muted-foreground mr-auto">נק' 18</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">קשר מופשט</strong> – מושג, תהליך, עיקרון</div>
          <div className="text-[0.67rem] text-muted-foreground/60 mt-1 italic">שניהם עוסקים ב"שינוי" · עקרונות פנימיים משותפים</div>
        </div>
        {/* Sod */}
        <div className="bg-surface-1 border border-border rounded-xl p-3.5 text-right">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-level-sod" />
            <span className="font-display text-base font-bold text-level-sod">סוֹד</span>
            <span className="text-[0.68rem] text-muted-foreground mr-auto">נק' 30</span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed"><strong className="text-foreground">קשר נסתר</strong> – פרדוקס, קפיצה יצירתית</div>
          <div className="text-[0.67rem] text-muted-foreground/60 mt-1 italic">סתירה שהיא אמת · חיבור בין-תחומי עמוק</div>
        </div>
      </div>

      {/* Chain card */}
      <div className="bg-surface-1 border border-chain/25 rounded-xl p-3.5 max-w-[500px] w-full mb-6 text-right">
        <div className="flex items-center gap-2 mb-1.5 text-chain">
          <span>⛓</span>
          <span className="font-display text-sm font-bold">חיבורי שרשרת</span>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          כשאתה מחבר A ל-B וגם B ל-C, המערכת מגלה אוטומטית גם את הקשר שבין A ל-C — חיבור שרשרת שמוסיף ניקוד בונוס.
        </div>
      </div>

      {/* Instructions */}
      <div className="text-sm text-muted-foreground leading-7 max-w-[400px] text-center mb-8">
        לחץ על <strong className="text-gold-light">שני כרטיסים</strong> — המערכת מזהה ומסבירה את הקשר ביניהם.<br />
        ככל שהקשר עמוק יותר, כך הניקוד גבוה יותר.<br />
        <strong className="text-gold-light">5 דקות · מטרה: 300 נקודות</strong>
      </div>

      <button
        onClick={onStart}
        className="bg-primary text-primary-foreground px-10 py-3.5 rounded-full font-display text-lg font-bold hover:opacity-90 transition-all hover:scale-[1.04] tracking-wide"
      >
        התחל לשחק
      </button>
    </div>
  );
}
