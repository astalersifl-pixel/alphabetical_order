import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function cardImagesPlugin(): Plugin {
  return {
    name: 'card-images-handler',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        const match = url.match(/^\/(?:cards\/)?([a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))$/i);
        if (match) {
          const filename = match[1];
          const candidates = [
            path.resolve(__dirname, 'public/cards', filename),
            path.resolve(__dirname, 'public', filename),
            path.resolve(__dirname, 'cards', filename),
            path.resolve(__dirname, filename),
          ];
          for (const cand of candidates) {
            if (fs.existsSync(cand)) {
              const ext = path.extname(cand).toLowerCase();
              const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
              res.setHeader('Content-Type', contentType);
              fs.createReadStream(cand).pipe(res);
              return;
            }
          }
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const distCardsDir = path.resolve(distDir, 'cards');
      if (!fs.existsSync(distDir)) return;
      if (!fs.existsSync(distCardsDir)) {
        try {
          fs.mkdirSync(distCardsDir, { recursive: true });
        } catch (_) {}
      }

      const searchDirs = [
        path.resolve(__dirname, 'public/cards'),
        path.resolve(__dirname, 'public'),
        path.resolve(__dirname, 'cards'),
        path.resolve(__dirname),
      ];

      for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            if (/\.(jpe?g|png|webp)$/i.test(file)) {
              const srcFile = path.resolve(dir, file);
              const destRoot = path.resolve(distDir, file);
              const destCards = path.resolve(distCardsDir, file);
              if (!fs.existsSync(destRoot)) {
                try {
                  fs.copyFileSync(srcFile, destRoot);
                } catch (_) {}
              }
              if (!fs.existsSync(destCards)) {
                try {
                  fs.copyFileSync(srcFile, destCards);
                } catch (_) {}
              }
            }
          }
        } catch (_) {}
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cardImagesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
