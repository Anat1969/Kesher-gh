import { Link } from "react-router-dom";

const NotFound = () => (
  <div dir="rtl" className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 text-center px-6">
    <div className="text-6xl" aria-hidden="true">🧩</div>
    <h1 className="font-display text-5xl font-black text-foreground">404</h1>
    <p className="text-muted-foreground">הקשר הזה עדיין לא קיים — העמוד לא נמצא.</p>
    <Link to="/" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-display font-bold hover:opacity-90 transition">
      חזרה למשחק
    </Link>
  </div>
);

export default NotFound;
