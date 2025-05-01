import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: '/OnceRojo/', // Reemplaza "RojoOnce" con el nombre de tu repositorio
  plugins: [vue()],
});