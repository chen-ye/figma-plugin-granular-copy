import * as path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    minify: false,
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: 'inline',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/ui/index.html'),
    },
  },
});
