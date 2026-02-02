import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    minify: false,
    target: 'esnext',
    outDir: 'dist',
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
