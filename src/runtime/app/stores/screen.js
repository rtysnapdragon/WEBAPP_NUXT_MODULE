import { defineStore } from '#imports'

export const useScreenStore = defineStore('ScreenStore', {
  state: () => ({
    width: 0,
    height: 0,
  }),

  getters: {
    isMobile: (state) => state.width < 768,
    isTablet: (state) => state.width >= 768 && state.width < 1024,
    isDesktop: (state) => state.width >= 1024,
    breakpoint: (state) => {
      if (state.width < 768) return 'mobile'
      if (state.width < 1024) return 'tablet'
      return 'desktop'
    },
  },

  actions: {
    setSize(w, h) {
      this.width = w
      this.height = h
    },
  },
})
