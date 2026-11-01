import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // three.js sozinho passa de 500 kB; o aviso padrão não ajuda aqui.
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        // Bibliotecas 3D mudam pouco: chunk próprio aproveita o cache entre deploys.
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/](three|three-stdlib|postprocessing)[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/](@react-three|camera-controls|maath|troika)/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
