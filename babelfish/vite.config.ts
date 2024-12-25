import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './', // This ensures the root is `babelfish`
  plugins: [react()],
  build: {
    outDir: 'dist', // Output directory for production build
    rollupOptions: {
      input: 'index.html', // Entry file for Vite
    },
  },
});
