<script setup lang="ts">
// RTimeline — SARIKA
// Full-featured UTimeline wrapper built on NuxtUI v4.8.2
// ─────────────────────────────────────────────────────────
// Modes       : vertical (default) | horizontal | alternating
// Icon        : NuxtUI i-lucide-* OR RemixIcon ri-* class (via <i>)
// Active      : v-model (controlled) | auto-play
// Slots       :
//   #indicator  { item, index, isActive, isPast, isFuture }
//   #date       { item, index, isActive }
//   #title      { item, index, isActive }
//   #description{ item, index, isActive }
//   #content    { item, index, isActive }
//   #connector  { index, isActive, isPast }
// ui prop     : deep-merged with SARIKA defaults → passed to UTimeline :ui

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { TimelineItem } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'

// ── Extended item type ────────────────────────────────────────────────────
export interface RTimelineItem extends Omit<TimelineItem, 'icon'> {
  icon?:          string          // i-lucide-* (NuxtUI UIcon)
  riIcon?:        string          // ri-home-line (RemixIcon <i> class)
  color?:         'accent' | 'success' | 'danger' | 'info' | 'warning' | 'muted'
  badge?:         string | number
  titleKm?:       string
  descriptionKm?: string
  dateKm?:        string
  tag?:           string          // optional label chip beside title
  link?:          string          // makes item clickable
}

// ── Props ─────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  items:          RTimelineItem[]
  modelValue?:    number                       // active index (controlled)
  defaultValue?:  number
  mode?:          'vertical' | 'alternating' | 'horizontal'
  size?:          'sm' | 'md' | 'lg'
  autoPlay?:      boolean
  autoPlayInterval?: number                    // ms, default 2000
  showConnector?: boolean
  showDate?:      boolean
  clickable?:     boolean
  class?:         string
  ui?:            Record<string, unknown>
}>(), {
  mode:              'vertical',
  size:              'md',
  autoPlayInterval:  2000,
  showConnector:     true,
  showDate:          true,
  clickable:         true,
})

const emit = defineEmits<{
  'update:modelValue': [idx: number]
  change:              [idx: number, item: RTimelineItem]
}>()

const { locale } = useI18n()

// ── Active state ──────────────────────────────────────────────────────────
const activeIdx = ref(props.modelValue ?? props.defaultValue ?? 0)

watch(() => props.modelValue, v => {
  if (v !== undefined) activeIdx.value = v
})

function setActive(i: number) {
  if (!props.clickable) return
  activeIdx.value = i
  emit('update:modelValue', i)
  emit('change', i, props.items[i])
}

// ── Auto-play ─────────────────────────────────────────────────────────────
let timer: ReturnType<typeof setInterval> | null = null

function startAutoPlay() {
  if (!props.autoPlay) return
  timer = setInterval(() => {
    activeIdx.value = (activeIdx.value + 1) % props.items.length
    emit('update:modelValue', activeIdx.value)
  }, props.autoPlayInterval)
}

function stopAutoPlay() {
  if (timer) { clearInterval(timer); timer = null }
}

onMounted(startAutoPlay)
onBeforeUnmount(stopAutoPlay)

watch(() => props.autoPlay, v => v ? startAutoPlay() : stopAutoPlay())

// ── State helpers ─────────────────────────────────────────────────────────
const isActive = (i: number) => i === activeIdx.value
const isPast   = (i: number) => i < activeIdx.value
const isFuture = (i: number) => i > activeIdx.value

// ── Icon resolution ────────────────────────────────────────────────────────
function isRi(item: RTimelineItem) {
  return !!(item.riIcon ?? (item.icon?.startsWith('ri-') ? item.icon : undefined))
}
function riClass(item: RTimelineItem) {
  return item.riIcon ?? item.icon ?? 'ri-circle-line'
}
function nuxtIcon(item: RTimelineItem) {
  return item.icon ?? 'i-lucide-circle'
}

// ── Item color → CSS class ────────────────────────────────────────────────
function colorCls(item: RTimelineItem, i: number) {
  if (item.color) return `rtl__dot--${item.color}`
  if (isPast(i))     return 'rtl__dot--past'
  if (isActive(i))   return 'rtl__dot--active'
  return 'rtl__dot--future'
}

// ── Label helpers (bilingual) ─────────────────────────────────────────────
function lbl(item: RTimelineItem, field: 'title' | 'description' | 'date') {
  if (locale.value === 'km') {
    if (field === 'title'       && item.titleKm)       return item.titleKm
    if (field === 'description' && item.descriptionKm) return item.descriptionKm
    if (field === 'date'        && item.dateKm)        return item.dateKm
  }
  return (item as any)[field] ?? ''
}

// ── NuxtUI ui merge ────────────────────────────────────────────────────────
// Alternating mode replicates the official example's even:flex-row-reverse
const builtinAlternatingUi = computed(() =>
  props.mode === 'alternating'
    ? {
        item: 'even:flex-row-reverse even:-translate-x-[calc(100%-2rem)] even:text-right',
      }
    : {}
)

const mergedUi = computed(() => ({
  ...builtinAlternatingUi.value,
  ...(props.ui ?? {}),
}))

// ── Alternating class (own visual track) ──────────────────────────────────
const alternatingClass = computed(() =>
  props.mode === 'alternating' ? 'translate-x-[calc(50%-1rem)]' : ''
)
</script>

<template>
  <div
    :class="[
      'rtl',
      `rtl--${mode}`,
      `rtl--${size}`,
      { 'rtl--autoplay': autoPlay, 'rtl--clickable': clickable },
      props.class,
    ]"
  >

    <!-- ════════════════════════════════════════════════════════
         CUSTOM VISUAL TRACK  (replaces UTimeline visual layer)
         UTimeline is rendered hidden for a11y / keyboard only.
    ════════════════════════════════════════════════════════ -->

    <!-- ── HORIZONTAL mode ─────────────────────────────────── -->
    <template v-if="mode === 'horizontal'">
      <div class="rtl__h-track">
        <template v-for="(item, i) in items" :key="i">

          <!-- Step -->
          <div
            :class="['rtl__h-step', { 'rtl__h-step--active': isActive(i), 'rtl__h-step--past': isPast(i) }]"
            @click="setActive(i)"
          >
            <!-- Dot / indicator -->
            <div :class="['rtl__dot', colorCls(item, i)]">
              <slot name="indicator" :item="item" :index="i" :is-active="isActive(i)" :is-past="isPast(i)" :is-future="isFuture(i)">
                <span v-if="item.badge !== undefined" class="rtl__badge">{{ item.badge }}</span>
                <i v-if="isRi(item)" :class="riClass(item)" class="rtl__dot-icon" aria-hidden="true" />
                <UIcon v-else :name="nuxtIcon(item)" class="rtl__dot-icon" />
              </slot>
            </div>

            <!-- Label below dot -->
            <div class="rtl__h-label">
              <slot name="date" :item="item" :index="i" :is-active="isActive(i)">
                <span v-if="showDate && lbl(item, 'date')" class="rtl__date">{{ lbl(item, 'date') }}</span>
              </slot>
              <slot name="title" :item="item" :index="i" :is-active="isActive(i)">
                <span class="rtl__title">{{ lbl(item, 'title') }}</span>
              </slot>
            </div>
          </div>

          <!-- Connector -->
          <div
            v-if="i < items.length - 1 && showConnector"
            :class="['rtl__h-connector', { 'rtl__h-connector--active': isPast(i) || isActive(i) }]"
          >
            <slot name="connector" :index="i" :is-active="isActive(i)" :is-past="isPast(i)" />
          </div>

        </template>
      </div>

      <!-- Horizontal active content panel -->
      <div v-if="$slots.content" class="rtl__h-content">
        <TransitionGroup name="rtl-slide">
          <div v-for="(item, i) in items" v-show="isActive(i)" :key="i" class="rtl__h-content-panel">
            <slot name="content" :item="item" :index="i" :is-active="isActive(i)" />
          </div>
        </TransitionGroup>
      </div>
    </template>

    <!-- ── VERTICAL + ALTERNATING modes ────────────────────── -->
    <template v-else>
      <div
        :class="[
          'rtl__v-track',
          { 'rtl__v-track--alt': mode === 'alternating' },
          alternatingClass,
        ]"
      >
        <div
          v-for="(item, i) in items"
          :key="i"
          :class="[
            'rtl__item',
            { 'rtl__item--active': isActive(i), 'rtl__item--past': isPast(i), 'rtl__item--future': isFuture(i) },
            { 'rtl__item--even': mode === 'alternating' && i % 2 !== 0 },
            { 'rtl__item--clickable': clickable },
            item.link ? 'rtl__item--link' : '',
          ]"
          @click="setActive(i)"
        >

          <!-- ── Left column: connector + dot ─── -->
          <div class="rtl__spine">
            <!-- Top connector -->
            <div
              v-if="i > 0 && showConnector"
              :class="['rtl__connector', { 'rtl__connector--active': isPast(i) }]"
            >
              <slot name="connector" :index="i" :is-active="isActive(i)" :is-past="isPast(i)" />
            </div>

            <!-- Indicator dot -->
            <div :class="['rtl__dot', colorCls(item, i)]">
              <slot
                name="indicator"
                :item="item" :index="i"
                :is-active="isActive(i)" :is-past="isPast(i)" :is-future="isFuture(i)"
              >
                <span v-if="item.badge !== undefined" class="rtl__badge">{{ item.badge }}</span>
                <i v-if="isRi(item)" :class="riClass(item)" class="rtl__dot-icon" aria-hidden="true" />
                <UIcon v-else :name="nuxtIcon(item)" class="rtl__dot-icon" />
              </slot>
            </div>

            <!-- Bottom connector -->
            <div
              v-if="i < items.length - 1 && showConnector"
              :class="['rtl__connector', { 'rtl__connector--active': isPast(i) || isActive(i) }]"
            >
              <slot name="connector" :index="i" :is-active="isActive(i)" :is-past="isPast(i)" />
            </div>
          </div>

          <!-- ── Right column: body ─────────────── -->
          <div class="rtl__body">

            <!-- Date -->
            <slot name="date" :item="item" :index="i" :is-active="isActive(i)">
              <span v-if="showDate && lbl(item, 'date')" class="rtl__date">
                {{ lbl(item, 'date') }}
              </span>
            </slot>

            <!-- Title + tag -->
            <div class="rtl__title-row">
              <slot name="title" :item="item" :index="i" :is-active="isActive(i)">
                <span class="rtl__title">{{ lbl(item, 'title') }}</span>
              </slot>
              <span v-if="item.tag" class="rtl__tag">{{ item.tag }}</span>
            </div>

            <!-- Description -->
            <slot name="description" :item="item" :index="i" :is-active="isActive(i)">
              <p v-if="lbl(item, 'description')" class="rtl__desc">
                {{ lbl(item, 'description') }}
              </p>
            </slot>

            <!-- Content slot -->
            <div v-if="$slots.content" class="rtl__content">
              <slot name="content" :item="item" :index="i" :is-active="isActive(i)" />
            </div>

          </div><!-- /body -->
        </div><!-- /item -->
      </div><!-- /v-track -->
    </template>

    <!-- ════════════════════════════════════════════════════════
         HIDDEN UTimeline — a11y + official prop passthrough
    ════════════════════════════════════════════════════════ -->
    <div class="rtl__nuxt-hidden" aria-hidden="true">
      <UTimeline
        v-model="activeIdx"
        :items="items"
        :default-value="defaultValue"
        :ui="mergedUi"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

// ── Size tokens ────────────────────────────────────────────
$dot-size: (sm: 28px, md: 36px, lg: 44px);
$dot-font: (sm: 0.72rem, md: 0.88rem, lg: 1rem);
$connector-w: 2px;
$connector-min-h: 32px;

// ─────────────────────────────────────────────────────────
// HOST
// ─────────────────────────────────────────────────────────
.rtl {
  display:     flex;
  flex-direction: column;
  font-family: var(--font-fallback);
  width:       100%;
}

// ─────────────────────────────────────────────────────────
// INDICATOR DOT
// ─────────────────────────────────────────────────────────
.rtl__dot {
  position:        relative;
  flex-shrink:     0;
  border:          2px solid;
  border-radius:   50%;
  display:         flex;
  align-items:     center;
  justify-content: center;
  z-index:         2;
  @include transition;

  // Size by host class
  .rtl--sm & { width: map-get($dot-size, sm); height: map-get($dot-size, sm); font-size: map-get($dot-font, sm); }
  .rtl--md & { width: map-get($dot-size, md); height: map-get($dot-size, md); font-size: map-get($dot-font, md); }
  .rtl--lg & { width: map-get($dot-size, lg); height: map-get($dot-size, lg); font-size: map-get($dot-font, lg); }

  // Colors
  &--active {
    background:   var(--c-accent);
    border-color: var(--c-accent);
    color:        #fff;
    box-shadow:   var(--glow-accent-sm);

    &::after {
      content:       '';
      position:      absolute;
      inset:         -5px;
      border-radius: 50%;
      border:        2px solid rgba(255,140,66,0.25);
      animation:     rtl-pulse 2s ease-in-out infinite;
    }
  }
  &--past    { background: rgba(255,140,66,0.12); border-color: var(--c-accent); color: var(--c-accent); }
  &--future  { background: var(--bg-tertiary);    border-color: var(--c-border);  color: var(--c-muted); }

  &--accent  { background: var(--c-accent);    border-color: var(--c-accent);    color: #fff; }
  &--success { background: rgba(74,222,128,0.12); border-color: var(--color-green);   color: var(--color-green); }
  &--danger  { background: rgba(248,113,113,0.12); border-color: var(--c-danger); color: var(--c-danger); }
  &--info    { background: rgba(96,165,250,0.12);  border-color: var(--c-info);   color: var(--c-info); }
  &--warning { background: rgba(255,179,71,0.12);  border-color: var(--color-yellow); color: var(--color-yellow); }
  &--muted   { background: var(--bg-tertiary);  border-color: var(--c-border);    color: var(--c-muted); }
}

@keyframes rtl-pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50%       { opacity: 0;   transform: scale(1.5); }
}

.rtl__dot-icon { font-size: 1em; line-height: 1; display: flex; }

// Badge overlay
.rtl__badge {
  position:      absolute;
  top:           -5px;
  right:         -5px;
  min-width:     16px;
  height:        16px;
  padding:       0 3px;
  border-radius: 8px;
  background:    var(--c-danger);
  color:         #fff;
  font-size:     0.58rem;
  font-weight:   700;
  display:       flex;
  align-items:   center;
  justify-content: center;
  border:        2px solid var(--c-surface);
  z-index:       3;
}

// ─────────────────────────────────────────────────────────
// TEXT ELEMENTS
// ─────────────────────────────────────────────────────────
.rtl__date {
  font-size:      0.68rem;
  font-weight:    600;
  color:          var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  display:        block;
}

.rtl__title-row {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
  flex-wrap:   wrap;
  margin-top:  2px;
}

.rtl__title {
  font-size:   0.88rem;
  font-weight: 600;
  color:       var(--c-text);
  line-height: 1.3;
  @include transition(fast);

  .rtl--lg & { font-size: 0.98rem; }
  .rtl--sm & { font-size: 0.78rem; }

  .rtl__item--active & { color: var(--c-accent); }
  .rtl__item--future & { color: var(--c-muted);  }
}

.rtl__tag {
  font-size:     0.62rem;
  font-weight:   700;
  padding:       2px 8px;
  border-radius: var(--radius-full);
  background:    rgba(255,140,66,0.1);
  color:         var(--c-accent);
  border:        1px solid rgba(255,140,66,0.2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.rtl__desc {
  font-size:   0.78rem;
  color:       var(--c-muted);
  margin:      var(--space-1) 0 0;
  line-height: 1.5;

  .rtl__item--active & { color: var(--c-text); }
}

.rtl__content { margin-top: var(--space-2); }

// ─────────────────────────────────────────────────────────
// VERTICAL + ALTERNATING
// ─────────────────────────────────────────────────────────
.rtl__v-track { display: flex; flex-direction: column; }

.rtl__item {
  display: flex;
  gap:     var(--space-3);
  cursor:  default;
  @include transition(fast);

  &--clickable { cursor: pointer; }
  &--link a { text-decoration: none; }

  &:hover .rtl__title { color: var(--c-accent); }

  // Alternating: even rows flip
  &--even {
    flex-direction: row-reverse;
    transform:      translateX(calc(-100% + 36px));
    text-align:     right;

    .rtl__body { align-items: flex-end; }
    .rtl__title-row { flex-direction: row-reverse; }
    .rtl__spine { order: 1; }
    .rtl__body  { order: 0; }

    .rtl--sm & { transform: translateX(calc(-100% + 28px)); }
    .rtl--lg & { transform: translateX(calc(-100% + 44px)); }
  }
}

// Spine (vertical line + dot)
.rtl__spine {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  flex-shrink:    0;
}

.rtl__connector {
  flex:             1;
  width:            $connector-w;
  min-height:       $connector-min-h;
  background:       var(--c-border);
  border-radius:    $connector-w;
  @include transition;

  &--active { background: var(--c-accent); }
}

.rtl__body {
  display:        flex;
  flex-direction: column;
  padding:        var(--space-1) 0 var(--space-4);
  min-width:      0;
}

// ─────────────────────────────────────────────────────────
// HORIZONTAL
// ─────────────────────────────────────────────────────────
.rtl__h-track {
  display:     flex;
  align-items: flex-start;
  width:       100%;
  overflow-x:  auto;
  scrollbar-width: thin;
  scrollbar-color: var(--c-border) transparent;
  padding-bottom: var(--space-2);
}

.rtl__h-step {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            var(--space-2);
  flex:           1;
  min-width:      80px;
  cursor:         pointer;
  @include transition(fast);

  &:hover .rtl__dot { border-color: var(--c-accent); color: var(--c-accent); }
}

.rtl__h-label {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            2px;
  text-align:     center;
}

.rtl__h-connector {
  flex:       1;
  height:     $connector-w;
  background: var(--c-border);
  border-radius: $connector-w;
  margin-top: calc(#{map-get($dot-size, md)} / 2);
  align-self: flex-start;
  min-width:  24px;
  @include transition;

  &--active { background: var(--c-accent); }

  .rtl--sm & { margin-top: calc(#{map-get($dot-size, sm)} / 2); }
  .rtl--lg & { margin-top: calc(#{map-get($dot-size, lg)} / 2); }
}

.rtl__h-content { margin-top: var(--space-4); position: relative; }

.rtl__h-content-panel { width: 100%; }

// ─────────────────────────────────────────────────────────
// HIDDEN NuxtUI (a11y only)
// ─────────────────────────────────────────────────────────
.rtl__nuxt-hidden {
  position: absolute;
  width:    1px; height: 1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
  pointer-events: none;
}

// ─────────────────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────────────────
.rtl-slide-enter-active { transition: all 0.25s ease; }
.rtl-slide-leave-active { transition: all 0.2s ease; position: absolute; width: 100%; }
.rtl-slide-enter-from   { opacity: 0; transform: translateX(16px); }
.rtl-slide-leave-to     { opacity: 0; transform: translateX(-16px); }
</style>

<!-- Global: reset NuxtUI hidden element styles -->
<style lang="scss">
.rtl__nuxt-hidden {
  [class*="timeline"],
  [class*="Timeline"] { all: unset; }
}
</style>
