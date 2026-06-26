// composables/useBreadcrumb.js
// No TypeScript — plain JS composable

const defaultState = () => ({
  // Header
  title: undefined,
  subtitle: undefined,
  icon: undefined,

  // Back
  hasBack: false,
  backTooltip: undefined,
  fnBack: undefined,

  // Breadcrumb
  items: [],
  separatorIcon: 'i-lucide-chevron-right',

  // Actions key — pages set this so RPageHeader can render
  // the right named slot via <template #actions>
  actionsKey: undefined,
  actionRight: undefined
})

export const useBreadcrumb = () => {
  const data = useState('breadcrumb', defaultState)

  // ── Set any subset of state ──────────────────────────────
  const set = (payload) => {
    data.value = { ...data.value, ...payload }
  }

  // ── Reset to defaults ─────────────────────────────────────
  const clear = () => {
    data.value = defaultState()
  }

  // ── Helpers ───────────────────────────────────────────────
  const setTitle = (title, subtitle, icon) => {
    data.value.title    = title
    data.value.subtitle = subtitle
    data.value.icon     = icon
  }

  const setBreadcrumbs = (items) => {
    data.value.items = items ?? []
  }

  /**
   * Enable back button.
   * @param {() => void} [action]  - callback; falls back to router.back()
   * @param {string}     [tooltip]
   */
  const setBack = (action, tooltip) => {
    data.value.hasBack      = true
    data.value.fnBack       = action ?? undefined   // keep undefined so we can fall back to router.back()
    data.value.backTooltip  = tooltip
  }

  const clearBack = () => {
    data.value.hasBack     = false
    data.value.fnBack      = undefined
    data.value.backTooltip = undefined
  }

  return {
    data,
    set,
    clear,
    setTitle,
    setBreadcrumbs,
    setBack,
    clearBack,
  }
}
