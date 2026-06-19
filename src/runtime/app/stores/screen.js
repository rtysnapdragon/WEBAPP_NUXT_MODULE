import { defineStore } from '#imports'

export const useScreenStore = defineStore('ScreenStore', {
  state: () => ({
    width: 0,
    height: 0,
    device:    'desktop',
    isMobile:  false,
    isTablet:  false,
    isDesktop: true,
    sm:        false,
    md:        false,
    lg:        false,
    xl:        false,
    xxl:       false,
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

    // Drawer direction auto-resolved from device
    defaultDrawerDirection: (state) => {
      return state.isMobile ? 'bottom' : 'right'
    },
 
    // Drawer width for lateral directions
    drawerWidth: (state) => {
      if (state.isMobile)  return '100%'
      if (state.isTablet)  return '400px'
      return '520px'
    },
 
    // Drawer height for top/bottom directions (mobile)
    drawerHeight: (state) => {
      if (state.isMobile) return '85dvh'
      return '50dvh'
    },

  },

  actions: {
    setSize(w, h) {
      this.width = w
      this.height = h
    },
  },

  _update() {
      if (typeof window === 'undefined') return
      const w = window.innerWidth
      const h = window.innerHeight
 
      this.width  = w
      this.height = h
 
      // Device
      if (w < 768) {
        this.device    = 'mobile'
        this.isMobile  = true
        this.isTablet  = false
        this.isDesktop = false
      } else if (w < 1024) {
        this.device    = 'tablet'
        this.isMobile  = false
        this.isTablet  = true
        this.isDesktop = false
      } else {
        this.device    = 'desktop'
        this.isMobile  = false
        this.isTablet  = false
        this.isDesktop = true
      }
 
      // Breakpoints
      this.sm  = w >= 640
      this.md  = w >= 768
      this.lg  = w >= 1024
      this.xl  = w >= 1280
      this.xxl = w >= 1536
    },
 
    init() {
      if (typeof window === 'undefined') return
      this._update()
      window.addEventListener('resize', this._update.bind(this), { passive: true })
    },
 
    destroy() {
      if (typeof window === 'undefined') return
      window.removeEventListener('resize', this._update.bind(this))
    },
})
