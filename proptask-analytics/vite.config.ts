import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite automatically exposes env vars prefixed with VITE_ via import.meta.env
// No custom define is needed for API keys in client code.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
