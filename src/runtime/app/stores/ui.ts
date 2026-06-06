// stores/ui.ts
import { defineStore } from 'pinia'

/*
FULL PRODUCTION VERSION

Features:
- realtime notifications
- route on click
- Django PascalCase API support
- token auth
- unread count
- optimistic updates
- polling fallback
- websocket ready
*/
// ============================================================
// SARIKA — UI Store  (stores/ui.ts)
// ============================================================
export type ThemeMode  = 'light' | 'dark' | 'system'
export type LocaleCode = 'en' | 'km'
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
 
interface Toast {
  id:       string
  type:     'success' | 'error' | 'info' | 'warning'
  title:    string
  message?: string
  duration: number
}

export interface NotificationItem {
  Id: number
  Type: 'like' | 'comment' | 'follow' | 'save' | 'system'
  Message: string
  From?: string
  FromAvatar?: string
  IsRead: boolean
  CreatedAt: string

  /*
  Route when clicked
  Example:
  /gallery/mekong-memories
  /artists/sophea-khun
  /dashboard/notifications
  */
  Href?: string

  /*
  optional image
  */
  Cover?: string
}

type ReportStatus = 'idle' | 'generating' | 'success' | 'error'


type TrackStage = 'pending' | 'picking' | 'packed' | 'in_transit' | 'delivered' | 'canceled'


interface UIState {
  isDark: boolean
  isCollapse: boolean
  isSidebarCollapsed: boolean
  notifPanelOpen: boolean
  aiAssistantOpen: boolean
  searchOpen: boolean
  isMobileOpen : boolean

  notifSocket: WebSocket | null
  notifLoading: boolean
  notifToken: string | null

  searching: Boolean
  reportStatus: ReportStatus
  trackStage: TrackStage
  lastScanValue: string

  theme:          ThemeMode
  locale:         LocaleCode
  sidebarOpen:    boolean
  sidebarCollapsed: boolean
  device:         DeviceType
  toasts:         Toast[]
  loadingKeys:    Set<string>
  slideoverStack: string[]
  modalStack:     string[]

}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    isDark: false,
    isCollapse: false,
    isSidebarCollapsed: false,
    notifPanelOpen: false,
    aiAssistantOpen: false,
    searchOpen: false,
    isMobileOpen : false,

    notifSocket: null,
    notifLoading: false,
    notifToken: null,

    searching: false,
    reportStatus: 'idle' as ReportStatus,
    trackStage: 'pending' as TrackStage,
    lastScanValue: '' as string,

    theme: 'system' as ThemeMode,
    locale: 'km' as LocaleCode,
    sidebarOpen: false,
    sidebarCollapsed: false,
    device: 'desktop' as DeviceType,
    toasts: [] as Toast[],
    loadingKeys: new Set<string>(),
    slideoverStack: [] as string[],
    modalStack: [] as string[],
  }),

  getters: {
    isDark(state): boolean {
      if (state.theme === 'system') {
        return typeof window !== 'undefined'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false
      }
      return state.theme === 'dark'
    },
 
    isMobile:  (state) => state.device === 'mobile',
    isTablet:  (state) => state.device === 'tablet',
    isDesktop: (state) => state.device === 'desktop',
 
    isLoading: (state) => (key: string) => state.loadingKeys.has(key),
    anyLoading:(state) => state.loadingKeys.size > 0,
  },

  actions: {
    /* =======================
       THEME
    ======================= */
    setTheme(mode: ThemeMode) {
      this.theme = mode
      if (typeof document !== 'undefined') {
        const isDark = mode === 'dark' ||
          (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.classList.toggle('dark', isDark)
      }
    },
 
    toggleTheme() {
      this.setTheme(this.isDark ? 'light' : 'dark')
      localStorage.setItem( 'sarika_theme', this.isDark ? 'dark' : 'light' )
    },

    toggleTheme1() {
      this.isDark = !this.isDark
      this.applyTheme()

      localStorage.setItem(
        'rama_theme',
        this.isDark ? 'dark' : 'light'
      )
    },

    initTheme() {
      if (!import.meta.client) return

      const saved = localStorage.getItem('rama_theme')
      const prefersDark =
        window.matchMedia('(prefers-color-scheme: dark)').matches

      this.isDark = saved
        ? saved === 'dark'
        : prefersDark

      this.applyTheme()
    },

    applyTheme() {
      if (!import.meta.client) return

      document.documentElement.classList.toggle(
        'dark',
        this.isDark
      )
    },
    /* ── Locale ── */
    setLocale(locale: LocaleCode) {
      this.locale = locale
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', locale)
        document.documentElement.setAttribute('dir', 'ltr')
      }
    },
 
    openSearch() { this.searchOpen = true },
    closeSearch() { this.searchOpen = false },
    setReportStatus(s: ReportStatus) { this.reportStatus = s },
    
    setTrackStage(s: TrackStage) { this.trackStage = s },
    setLastScan(v: string) { this.lastScanValue = v },

    /* =======================
       PANELS
    ======================= */
    /* ── Sidebar ── */
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    collapseSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    setSidebarOpen(open: boolean) {
      this.sidebarOpen = open
    },

    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },

    toggleNotifPanel() {
      this.notifPanelOpen = !this.notifPanelOpen
      this.aiAssistantOpen = false
      this.searchOpen = false
    },

    toggleAIAssistant() {
      this.aiAssistantOpen = !this.aiAssistantOpen
      this.notifPanelOpen = false
    },

    toggleSearch() {
      this.searchOpen = !this.searchOpen
    },

    toggleMobile() {
      this.isMobileOpen  = !this.isMobileOpen 
    },


    closeAll() {
      this.notifPanelOpen = false
      this.aiAssistantOpen = false
      this.searchOpen = false
      this.isMobileOpen  = false
    },

     /* ── Device Detection ── */
    detectDevice() {
      if (typeof window === 'undefined') return
      const w = window.innerWidth
      if (w < 768)       this.device = 'mobile'
      else if (w < 1024) this.device = 'tablet'
      else               this.device = 'desktop'
    },
 
    initDeviceListener() {
      if (typeof window === 'undefined') return
      this.detectDevice()
      window.addEventListener('resize', () => this.detectDevice())
    },
 
    /* ── Loading ── */
    startLoading(key: string) {
      this.loadingKeys.add(key)
    },
    stopLoading(key: string) {
      this.loadingKeys.delete(key)
    },
    async withLoading<T>(key: string, fn: () => Promise<T>): Promise<T> {
      this.startLoading(key)
      try {
        return await fn()
      } finally {
        this.stopLoading(key)
      }
    },
    
    /* ── Toasts ── */
    addToast(toast: Omit<Toast, 'id'>) {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      this.toasts.push({ ...toast, id })
      setTimeout(() => this.removeToast(id), toast.duration ?? 4000)
    },
    removeToast(id: string) {
      const idx = this.toasts.findIndex(t => t.id === id)
      if (idx !== -1) this.toasts.splice(idx, 1)
    },
    success(title: string, message?: string) {
      this.addToast({ type: 'success', title, message, duration: 3500 })
    },
    error(title: string, message?: string) {
      this.addToast({ type: 'error', title, message, duration: 5000 })
    },
    info(title: string, message?: string) {
      this.addToast({ type: 'info', title, message, duration: 4000 })
    },
    warn(title: string, message?: string) {
      this.addToast({ type: 'warning', title, message, duration: 4000 })
    },
 
    /* ── Slideover stack ── */
    openSlideover(id: string) {
      if (!this.slideoverStack.includes(id))
        this.slideoverStack.push(id)
    },
    closeSlideover(id: string) {
      this.slideoverStack = this.slideoverStack.filter(s => s !== id)
    },
    closeAllSlideovers() {
      this.slideoverStack = []
    },
 
    /* ── Modal stack ── */
    openModal(id: string) {
      if (!this.modalStack.includes(id))
        this.modalStack.push(id)
    },
    closeModal(id: string) {
      this.modalStack = this.modalStack.filter(m => m !== id)
    },
  }
})