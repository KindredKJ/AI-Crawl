import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // Capacitor needs assets inlined or at predictable paths
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Single chunk for Capacitor WebView compatibility
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    host: '0.0.0.0',
    port: 3000,
  },
});
