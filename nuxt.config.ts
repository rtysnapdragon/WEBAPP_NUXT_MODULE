// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "@nuxtjs/prismic",
    "@pinia/nuxt",
    "@vueuse/nuxt"
  ],
  
  // ── NuxtUI v4 ──
  ui: {
    colorMode: true,
  },
 
  // ── Global SCSS ──
  css: ['./runtime/app/assets/styles/global.scss','./runtime/app/assets/styles/tailwind.css'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Make mixins available in every component <style lang="scss">
          additionalData: `@use '@/assets/scss/_mixin' as *;`,
        },
      },
    },
  },
  // // / ── Auto-import composables ──
  // imports: {
  //   dirs: ['composables/**', 'stores/**','utils/**'],
  // },
})