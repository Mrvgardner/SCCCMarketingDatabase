import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
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
  // Use relative paths for local file access
  base: './'
})
