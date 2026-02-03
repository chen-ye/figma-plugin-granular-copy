import * as path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    minify: false,
    target: 'es2018',
    outDir: 'dist/main',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main/main.ts'),
      name: 'main',
      fileName: () => 'main.js',
      formats: ['es'],
    },
  },
});
