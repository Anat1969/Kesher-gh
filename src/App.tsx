import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useThemeColorMeta } from "./hooks/useThemeColorMeta";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const ThemeColorSync = () => {
  useThemeColorMeta();
  return null;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="kesher:theme" disableTransitionOnChange>
    <ThemeColorSync />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
