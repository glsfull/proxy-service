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
      title: 'Генератор этикеток маркетплейсов',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        {
          name: 'description',
          content: 'Интерфейс генерации этикеток маркетплейсов с вкладками Wildberries, Ozon и Яндекс Маркет.'
        }
      ]
    }
  }
})
