export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  modules: ['@nuxt/ui'],
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  app: {
    head: {
      title: 'Barcode Analytics Dashboard',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        {
          name: 'description',
          content: 'Интерфейс для добавления и настройки нескольких типов баркодов в аналитическом дашборде.'
        }
      ]
    }
  }
})
