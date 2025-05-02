import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/OnceRojo/' : '/', // Usa '/OnceRojo/' en producción y '/' en desarrollo
  plugins: [vue()],
});