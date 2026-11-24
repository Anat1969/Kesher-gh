import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

/** One build stamp for the bundle and for version.json, so an open app can tell it is old. */
const BUILD = new Date().toISOString();

/** Writes version.json next to the build, never cached, so an open page can tell it is old. */
const versionFile: Plugin = {
  name: "kesher-version-file",
  apply: "build",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: BUILD }) });
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    __BUILD__: JSON.stringify(BUILD),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    versionFile,
    mode === "development" && componentTagger(),
    VitePWA({
      // The app registers the worker itself (src/components/UpdateNotice.tsx): it checks for a new
      // version on every return to the app and reloads into it as soon as it is installed.
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["icon.svg", "apple-touch-icon.png", "favicon-48.png"],
      manifest: {
        name: "קֶשֶׁר — משחק הקשרים",
        short_name: "קשר",
        description: "משחק קשרים בעברית: פשט, רמז, דרש וסוד.",
        lang: "he",
        dir: "rtl",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        categories: ["games", "education"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        globIgnores: ["**/og-image.png"],
        // Pages are never served from the cache while online (24.11.2026: a desktop browser kept showing an
        // old build). Navigations go to the network first; the cached page is used only offline, and the
        // precached index.html is the last fallback.
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 20 },
              precacheFallback: { fallbackURL: "/index.html" },
            },
          },
          {
            // Google Fonts stylesheets and font files — cache so the game works offline.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
