import { resolve } from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import injectHTML from 'vite-plugin-html-inject'

export default defineConfig({
  plugins: [
    tailwindcss(),
    injectHTML(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        register: resolve(import.meta.dirname, 'register.html'),
        workouts: resolve(import.meta.dirname, 'workouts/workouts.html'),
        createWorkout: resolve(import.meta.dirname, 'workouts/create.html'),
        editWorkout: resolve(import.meta.dirname, 'workouts/edit.html'),
        saveWorkout: resolve(import.meta.dirname, 'workouts/saveR.html'),
        history: resolve(import.meta.dirname, 'history/history.html'),
        profile: resolve(import.meta.dirname, 'profile/profile.html'),
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

