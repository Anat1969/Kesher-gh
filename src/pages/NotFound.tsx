import { Link } from "react-router-dom";

const NotFound = () => (
  <main
    className="flex flex-col items-center justify-center gap-4 px-6 text-center"
    style={{ minHeight: 'calc(100dvh - var(--bar-h))' }}
  >
    <p className="label-mono">404</p>
    <h1 className="text-5xl font-thin">הקשר הזה עדיין לא קיים</h1>
    <p className="text-muted-foreground">העמוד שחיפשתם לא נמצא.</p>
    <Link to="/" className="btn btn-primary mt-2 h-12 px-8">לדף הבית</Link>
  </main>
);

export default NotFound;
