import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lifeos/core': path.resolve(__dirname, '../../packages/core/src'),
      '@lifeos/database': path.resolve(__dirname, '../../packages/database/src/adapters/index.web.ts'),
      '@lifeos/shared-types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@lifeos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@lifeos/alfred': path.resolve(__dirname, '../../packages/alfred/src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
