import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
import { cpSync, createReadStream, existsSync, statSync } from 'fs';
import { dirname, extname, join, normalize, resolve } from 'path';

// pdf.js fetches its CMaps, standard fonts, ICC profiles and wasm decoders at
// runtime. They are not importable modules, so serve them from node_modules in
// dev and copy them into the bundle on build. Without them, PDFs that rely on
// non-embedded standard fonts render without any text.
const PDFJS_ASSET_DIRS = ['cmaps', 'standard_fonts', 'iccs', 'wasm'];
const PDFJS_ASSET_PREFIX = '/pdfjs';

const MIME_TYPES: Record<string, string> = {
  '.bcmap': 'application/octet-stream',
  '.pfb': 'application/octet-stream',
  '.icc': 'application/vnd.iccprofile',
  '.wasm': 'application/wasm',
  '.js': 'text/javascript',
};

function pdfjsAssets(): Plugin {
  const require = createRequire(import.meta.url);
  const pdfjsDir = dirname(require.resolve('pdfjs-dist/package.json'));
  let outDir = 'dist';

  return {
    name: 'pdfjs-assets',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use(PDFJS_ASSET_PREFIX, (req, res, next) => {
        const requestPath = decodeURIComponent((req.url || '').split('?')[0]);
        const filePath = resolve(pdfjsDir, `.${normalize(requestPath)}`);

        // Only ever serve the asset directories, never anything else the
        // package (or the filesystem above it) happens to contain.
        const allowed = PDFJS_ASSET_DIRS.some(dir => filePath.startsWith(join(pdfjsDir, dir) + '/'));
        if (!allowed || !existsSync(filePath) || !statSync(filePath).isFile()) {
          return next();
        }

        res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] || 'application/octet-stream');
        createReadStream(filePath).pipe(res);
      });
    },
    closeBundle() {
      for (const dir of PDFJS_ASSET_DIRS) {
        cpSync(join(pdfjsDir, dir), join(outDir, 'pdfjs', dir), { recursive: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), pdfjsAssets()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    // Dependency pre-bundling does not inherit `esbuild.target`, and the
    // default target rejected syntax in some dependencies, which broke
    // `npm run dev` outright.
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
