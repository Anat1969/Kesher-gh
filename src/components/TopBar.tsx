import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import AIMenu from './AIMenu';

const NAV = [
  { to: '/', label: 'משחק', short: 'משחק', end: true },
  { to: '/guide', label: 'מדריך', short: 'מדריך', end: false },
  { to: '/secrets', label: 'אוסף הסודות', short: 'סודות', end: false },
  { to: '/did-you-know', label: 'הידעת', short: 'הידעת', end: false },
  { to: '/scores', label: 'הלמידה שלי', short: 'למידה', end: false },
  { to: '/board', label: 'טבלה', short: 'טבלה', end: false },
] as const;

/** Fixed top bar on every page: app name (home), content navigation, and the A&I button. */
export default function TopBar() {
  const { settings, updateSettings, state } = useGame();
  const inGame = state.screen === 'game';

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-border backdrop-blur-md"
      style={{
        background: 'hsl(var(--background) / 0.86)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <div className="mx-auto max-w-[1080px] px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link to="/" className="group flex items-baseline gap-2.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="קשר, דף הבית">
            <span className="text-[1.6rem] font-thin leading-none tracking-wide text-foreground">קֶשֶׁר</span>
            <span className="label-mono hidden min-[380px]:inline transition-colors group-hover:text-foreground">KESHER</span>
            {inGame && <span className="label-mono hidden sm:inline">· משחק פעיל</span>}
          </Link>

          <nav aria-label="ניווט ראשי" className="hidden md:flex items-center gap-1">
            {NAV.map(n => <NavItem key={n.to} {...n} />)}
          </nav>

          <AIMenu settings={settings} onSettings={updateSettings} />
        </div>

        <nav aria-label="ניווט ראשי" className="md:hidden -mt-1 flex h-10 items-stretch gap-0.5 -mx-2">
          {NAV.map(n => <NavItem key={n.to} {...n} />)}
        </nav>
      </div>
    </header>
  );
}

function NavItem({ to, label, short, end }: { to: string; label: string; short: string; end: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex flex-1 md:flex-none items-center justify-center whitespace-nowrap px-1 text-[0.8125rem] md:px-3 md:text-sm transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9 ${
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="md:hidden">{short}</span>
          <span className="hidden md:inline">{label}</span>
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute inset-x-2 bottom-0 h-px bg-foreground"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
