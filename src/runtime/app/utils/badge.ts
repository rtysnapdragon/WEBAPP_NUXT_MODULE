// Shared by RBadge / RBadgeUi. Palette + tokens live in scss/_badge.scss.
export type BadgeVariant = 'solid' | 'outline' | 'soft' | 'subtle'
export type LegacyBadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted'
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type BadgeMode = 'auto' | 'light' | 'dark'
export type BadgeColor =
  | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  | 'red' | 'orange' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan'
  | 'sky' | 'blue' | 'violet' | 'purple' | 'pink' | 'rose' | 'gray'
  | (string & {}) // any CSS color: '#ff00aa', 'oklch(...)', 'var(--x)'

// Previous RBadge API: variant="success" → soft + semantic color
const LEGACY: Record<string, BadgeColor> = {
  default: 'neutral', muted: 'neutral', success: 'success', danger: 'error', warning: 'warning', info: 'info',
}

export const resolveBadge = (color: BadgeColor, variant: BadgeVariant | LegacyBadgeVariant) =>
  variant in LEGACY
    ? { color: LEGACY[variant], variant: 'soft' as BadgeVariant }
    : { color, variant: variant as BadgeVariant }

const CSS_COLOR = /^(#|rgb|hsl|hwb|lab|lch|oklab|oklch|color\(|var\()/i

// Maps a color name (+ forced mode) to the CSS vars consumed by .r-badge--{variant}
export const badgeColorVars = (color: BadgeColor, mode: BadgeMode = 'auto') => {
  if (CSS_COLOR.test(color)) return { '--b-fill': color, '--b-on': '#fff', '--b-fg': color }

  const key = (part: 'fill' | 'on' | 'fg') =>
    mode === 'auto' ? (part === 'fill' ? '' : `-${part}`) : `-${part}-${mode}`
  const v = (part: 'fill' | 'on' | 'fg') =>
    `var(--r-badge-${color}${key(part)}, var(--r-badge-neutral${key(part)}))`

  return { '--b-fill': v('fill'), '--b-on': v('on'), '--b-fg': v('fg') }
}
