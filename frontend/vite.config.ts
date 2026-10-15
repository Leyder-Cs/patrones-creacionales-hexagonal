import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  build: {
    rolldownOptions: {
      input: {
        menu: fileURLToPath(new URL('./index.html', import.meta.url)),
        builder: fileURLToPath(new URL('./builder.html', import.meta.url)),
        factoryMethod: fileURLToPath(new URL('./factory-method.html', import.meta.url)),
        abstractFactory: fileURLToPath(new URL('./abstract-factory.html', import.meta.url)),
        visualizador: fileURLToPath(new URL('./visualizador.html', import.meta.url)),
      },
    },
  },
})
