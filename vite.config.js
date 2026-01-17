import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: /\.(jsx|js|tsx|ts)$/,
  })],
  publicDir: 'public',
  build: {
    outDir: 'build',
  },
  preview: {
    host: 'localhost',
    port: 4173,
  },
});

