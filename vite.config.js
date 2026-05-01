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
      output: {
        // Conservative split: only carve out chunks that are big AND only used
        // by lazy routes. Splitting React/router/etc. into separate chunks
        // creates circular imports between the resulting chunks (vendor needs
        // react, react chunk needs vendor) which can produce runtime
        // `Cannot read properties of undefined` errors at top-level eval.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // tiptap + prosemirror: ~340 KB, only loaded on admin form pages.
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'tiptap';
          // dompurify: ~24 KB, only used by RichText render path.
          if (id.includes('dompurify')) return 'dompurify';
          // fuse.js: ~16 KB, lazy-loaded on first search interaction.
          if (id.includes('fuse.js')) return 'fuse';
          // Everything else (react, react-dom, react-router, headlessui,
          // heroicons, framer-motion, etc.) goes into the default vendor
          // chunk so Vite can resolve init order without us creating cycles.
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  esbuild: {
    legalComments: 'none',
  },
  // Use relative paths for local file access
  base: './'
})
