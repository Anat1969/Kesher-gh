import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { useThemeColorMeta } from "./hooks/useThemeColorMeta";
import { GameProvider } from "./context/GameContext";
import TopBar from "./components/TopBar";
import Index from "./pages/Index.tsx";
import Guide from "./pages/Guide.tsx";
import Secrets from "./pages/Secrets.tsx";
import DidYouKnow from "./pages/DidYouKnow.tsx";
import NotFound from "./pages/NotFound.tsx";

const ThemeColorSync = () => {
  useThemeColorMeta();
  return null;
};

const Page = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Index /></Page>} />
        <Route path="/guide" element={<Page><Guide /></Page>} />
        <Route path="/secrets" element={<Page><Secrets /></Page>} />
        <Route path="/did-you-know" element={<Page><DidYouKnow /></Page>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="kesher:theme" disableTransitionOnChange>
    <ThemeColorSync />
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <GameProvider>
          <TopBar />
          <div dir="rtl" style={{ paddingTop: 'calc(var(--bar-h) + env(safe-area-inset-top))' }}>
            <AppRoutes />
          </div>
        </GameProvider>
      </BrowserRouter>
    </MotionConfig>
  </ThemeProvider>
);

export default App;
