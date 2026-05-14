import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()]
  },
  modules: ['@nuxtjs/sitemap', 'nuxt-security'],
  site: {
    name: 'Finjoy Finance Tracker'
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  compatibilityDate: '2024-04-03',
  nitro: {
    storage: {
      cache: {
        driver: 'memory'
      }
    }
  },
  security: {
    rateLimiter: {
      tokensPerInterval: 50, // Jumlah request maksimal
      interval: 'hour',      // Jangka waktu (ms, 'second', 'minute', 'hour', 'day')
    },
    csrf: true, // Mengaktifkan perlindungan CSRF
  },
  future: {
    compatibilityVersion: 4,
  },
})