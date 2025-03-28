export default {
  // Global page headers
  head: {
    titleTemplate: '%s - Flax ERP',
    title: 'Flax ERP',
    htmlAttrs: {
      lang: 'tr'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Flax ERP - Modüler Kurumsal Kaynak Planlama Sistemi' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS
  css: [
    '~/assets/css/main.css'
  ],

  // Plugins to run before rendering page
  plugins: [
    { src: '~/plugins/axios' }
  ],

  // Auto import components
  components: true,

  // Modules for dev and build
  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/eslint-module'
  ],

  // Modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration
  axios: {
    baseURL: process.env.API_URL || 'http://localhost:3001/api',
    credentials: true
  },

  // Auth module configuration
  auth: {
    strategies: {
      local: {
        token: {
          property: 'access_token',
          required: true,
          type: 'Bearer'
        },
        user: {
          property: 'user',
          autoFetch: true
        },
        endpoints: {
          login: { url: '/auth/login', method: 'post' },
          logout: { url: '/auth/logout', method: 'post' },
          user: { url: '/auth/me', method: 'get' }
        }
      }
    },
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/dashboard'
    }
  },

  // Vuetify module configuration
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      }
    }
  },

  // Build Configuration
  build: {
    extend(config, ctx) {}
  }
}
