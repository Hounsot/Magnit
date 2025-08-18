import { defineConfig } from 'vite'
import { resolve } from 'path'
import handlebars from 'vite-plugin-handlebars'

export default defineConfig({
  base: './',
  plugins: [
    handlebars({
      partialDirectory: resolve(process.cwd(), 'src/partials'),
      helpers: {
        eq: (a, b) => a === b,
      },
    }),
  ],
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
        contactsDone: resolve(process.cwd(), 'contacts-done/index.html'),
      },
    },
  },
})

