import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: false,
      registerType: 'autoUpdate',
      manifest: {
        id: '/events',
        name: 'Switch Commerce Trade Show Hub',
        short_name: 'Trade Shows',
        description: 'Internal Switch Commerce trade show schedules, team details, maps, expenses, and updates.',
        start_url: '/events',
        scope: '/',
        display: 'standalone',
        background_color: '#030712',
        theme_color: '#0951fa',
        orientation: 'portrait-primary',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      injectManifest: {
        // Precache the app shell ONLY (~500 KB). The service worker registers
        // site-wide, so anything listed here is downloaded by every user on
        // every page — a blanket 'assets/**/*.{js,css}' plus the venue maps
        // meant someone who only opens Wallpapers still pulled a 1.5 MB trade
        // show map and the 382 KB rich-text editor. Route chunks and images are
        // cached on demand instead; see the runtime routes in src/sw.js.
        // Note `index-*.css` not `index-*` — the `index-*.js` files are lazy
        // route chunks and must not land in the precache.
        globPatterns: [
          'index.html',
          'manifest.webmanifest',
          'assets/main-*.js',
          'assets/index-*.css',
          'favicon*.png',
          'apple-touch-icon.png',
          'pwa-*.png',
          'fonts/*.woff2',
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: {
    port: 3000
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      // No `manualChunks` here — every prior attempt at custom chunking
      // produced a runtime regression:
      //   • Per-package split (react / router / vendor / tiptap / motion) →
      //     circular imports between named chunks, React undefined at
      //     top-level eval, white screen.
      //   • Single tiptap chunk + undefined for the rest → Vite merged
      //     React into the tiptap chunk so it loaded eagerly (527 KB).
      //   • Single tiptap chunk + everything-else → "vendor" chunk had
      //     CommonJS init-order issues.
      // Vite's default per-route splitting via React.lazy() already gives
      // us everything we need: each lazy route is its own chunk, the entry
      // bundle pulls in only what's eagerly imported, and Rollup figures
      // out the init order without us.
    },
    // Do NOT force CommonJS processing on all node_modules. The
    // `include: [/node_modules/]` setting we used to have wrapped every
    // dep in Rollup's CJS interop, which produces a `_interopDefault`
    // path that calls ES classes without `new` — manifests as
    // `TypeError: Class constructor X cannot be invoked without 'new'`
    // in React's internal hook machinery on the home page.
    // Vite's CJS plugin auto-detects which files are actually CommonJS,
    // so leave its defaults alone.
  },
  esbuild: {
    legalComments: 'none',
  },
  // Root-relative assets keep direct loads of nested SPA routes working.
  base: '/'
})
