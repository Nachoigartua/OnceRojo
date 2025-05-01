import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/OnceRojo/', // Reemplaza "OnceRojo" con el nombre de tu repositorio
  plugins: [vue()]
})