import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        geography: resolve(process.cwd(), 'geography/index.html'),
        forInternetShops: resolve(process.cwd(), 'for-internet-shops/index.html'),
        vacancies: resolve(process.cwd(), 'vacancies/index.html'),
        contacts: resolve(process.cwd(), 'contacts/index.html'),
        form: resolve(process.cwd(), 'form/index.html'),
        formDone: resolve(process.cwd(), 'form-done/index.html'),
      },
    },
  },
})

