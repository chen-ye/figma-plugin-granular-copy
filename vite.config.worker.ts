import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/mocks/worker-entry.ts'),
      name: 'Worker',
      fileName: 'worker',
      formats: ['es'],
    },
    outDir: 'dist/e2e',
    emptyOutDir: true,
  },
});
