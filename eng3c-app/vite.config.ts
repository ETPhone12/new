import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` makes a normal multi-file PWA build in dist/.
// `npm run build:single` inlines everything into one HTML file (dist-single/)
// so the whole app can be shared as a single page.
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [react(), viteSingleFile()] : [react()],
    build: {
      outDir: single ? 'dist-single' : 'dist',
      emptyOutDir: true,
      copyPublicDir: !single,
      chunkSizeWarningLimit: 900,
    },
    define: {
      __SINGLE_FILE__: JSON.stringify(single),
    },
  };
});
