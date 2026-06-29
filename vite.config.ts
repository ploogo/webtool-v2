import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    // esbuild >=0.28 errors instead of silently passing through when asked to
    // lower modern syntax (e.g. destructuring) to Vite's default browser
    // target during dependency pre-bundling. Match the esnext target used for
    // app source and the production build so dependencies are bundled as-is.
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
        },
      },
    },
  },
  esbuild: {
    target: 'esnext'
  }
});