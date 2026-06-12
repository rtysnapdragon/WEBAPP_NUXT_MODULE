<script setup lang="ts">
// RTimeInput — SARIKA
// NuxtUI v4 UInputTime + custom clock-face popover picker
// Modes: single (default) | range (prop)
// Picker: click-only clock grid — no scroll drums, no text select
// v-model: Time | { start: Time; end: Time }

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Time } from '@internationalized/date'
import { useI18n } from 'vue-i18n'

// ── Types ──────────────────────────────────────────────────────────────────
export interface RangeTime { start: Time; end: Time }
// import type { TimeRange } from '@internationalized/date'
export type TimeVal = Time | RangeTime | null

// ── Props ──────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue?:   TimeVal
  range?:        boolean
  granularity?:  'hour' | 'minute' | 'second'
  hourCycle?:    12 | 24
  label?:        string
  labelKm?:      string
  hint?:         string
  error?:        string
  required?:     boolean
  disabled?:     boolean
  readonly?:     boolean
  clearable?:    boolean
  size?:         'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ui?:           Record<string, unknown>
}>(), {
  granularity: 'minute',
  size:        'md',
  clearable:   true,
})

const emit = defineEmits<{
  'update:modelValue': [v: TimeVal]
  change:              [v: TimeVal]
  clear:               []
  blur:                []
}>()

const { locale } = useI18n()

// ── Internal model ─────────────────────────────────────────────────────────
const internal = ref<TimeVal>(props.modelValue ?? null)
// watch(() => props.modelValue, v => { internal.value = v ?? null })
watch(internal, v => { emit('update:modelValue', v); emit('change', v) })

watch(
  () => props.modelValue,
  (v) => {
    console.log('modelValue', v)
    console.log('instanceof Time', v instanceof Time)
  },
  { immediate: true }
)
watch(
  () => props.modelValue,
  (v) => {
    if (!v) {
      internal.value = null
      return
    }

    if (props.range) {
      const r = v as any

      internal.value = {
        start:
          r.start instanceof Time
            ? r.start
            : new Time(r.start.hour, r.start.minute, r.start.second ?? 0),

        end:
          r.end instanceof Time
            ? r.end
            : new Time(r.end.hour, r.end.minute, r.end.second ?? 0),
      }
    } else {
      internal.value =
        v instanceof Time
          ? v
          : new Time(
              (v as any).hour,
              (v as any).minute,
              (v as any).second ?? 0
            )
    }
  },
  { immediate: true }
)
// ── Popover state ──────────────────────────────────────────────────────────
const open      = ref(false)
// const popRef    = ref<HTMLElement | null>(null)
// const triggerRef = ref<HTMLElement | null>(null)

const inputRef  = ref<HTMLInputElement | null>(null)
const popRef    = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
// Range picking step: 'start' → pick start, 'end' → pick end
const rangeStep = ref<'start' | 'end'>('start')

function openPicker() {
  if (props.disabled || props.readonly) return
  if (props.range) rangeStep.value = 'start'
  open.value = !open.value
}
function closePicker() { open.value = false; emit('blur') }

function onOutside(e: MouseEvent) {
  const t = e.target as Node
  if (popRef.value?.contains(t) || triggerRef.value?.contains(t)) return
  closePicker()
}
onMounted(() => document.addEventListener('mousedown', onOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutside))

// ── Clear ──────────────────────────────────────────────────────────────────
function clearValue() {
  internal.value = null
  emit('clear')
  closePicker()
}

// ── Has value ─────────────────────────────────────────────────────────────
const hasValue = computed(() => {
  if (!internal.value) return false
  return true
})

// ── Clock grid data ───────────────────────────────────────────────────────
// Hours 0-23, minutes 0-59 in steps of 5, or seconds
const HOUR_ITEMS = Array.from({ length: 24 }, (_, i) => i)        // 0-23
const MIN_ITEMS  = Array.from({ length: 12 }, (_, i) => i * 5)   // 0,5,10...55
const SEC_ITEMS  = Array.from({ length: 12 }, (_, i) => i * 5)

type Col = 'h' | 'm' | 's'
const activeCol = ref<Col>('h')

// ── Current editing time (extracted from model) ────────────────────────────
const editingTime = computed<Time>(() => {
  if (!internal.value) return new Time(0, 0, 0)
  if (props.range) {
    const r = internal.value as RangeTime
    return rangeStep.value === 'start' ? (r.start ?? new Time(0, 0, 0)) : (r.end ?? new Time(0, 0, 0))
  }
  return (internal.value as Time) ?? new Time(0, 0, 0)
})

// ── Click on clock value ───────────────────────────────────────────────────
function pickValue(val: number) {
  let t = editingTime.value
  if (activeCol.value === 'h') t = new Time(val, t.minute, t.second)
  if (activeCol.value === 'm') t = new Time(t.hour, val,   t.second)
  if (activeCol.value === 's') t = new Time(t.hour, t.minute, val)

  if (!props.range) {
    internal.value = t
    // Auto advance column
    if (activeCol.value === 'h') activeCol.value = 'm'
    else if (activeCol.value === 'm' && props.granularity === 'second') activeCol.value = 's'
    else if (activeCol.value === 'm') closePicker()
    else closePicker()
    return
  }

  // Range mode
  const prev = (internal.value as RangeTime) ?? { start: new Time(0, 0, 0), end: new Time(0, 0, 0) }
  if (rangeStep.value === 'start') {
    internal.value = { start: t, end: prev.end ?? t }
    // Auto-advance col within start picking
    if (activeCol.value === 'h') activeCol.value = 'm'
    else if (activeCol.value === 'm' && props.granularity === 'second') activeCol.value = 's'
    else {
      // Done with start → move to end
      rangeStep.value = 'end'
      activeCol.value = 'h'
    }
  } else {
    internal.value = { start: prev.start, end: t }
    if (activeCol.value === 'h') activeCol.value = 'm'
    else if (activeCol.value === 'm' && props.granularity === 'second') activeCol.value = 's'
    else closePicker()
  }
}

// ── Active check helpers ───────────────────────────────────────────────────
function isActive(val: number): boolean {
  const t = editingTime.value
  if (activeCol.value === 'h') return t.hour === val
  if (activeCol.value === 'm') return t.minute === val
  return t.second === val
}

// ── Summary ────────────────────────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')

function fmtTime(t: Time | null | undefined) {
  if (!t) return '—'
  if (props.granularity === 'second') return `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`
  if (props.granularity === 'hour')   return `${pad(t.hour)}:00`
  return `${pad(t.hour)}:${pad(t.minute)}`
}

const summaryText = computed(() => {
  if (!internal.value) return null
  if (props.range) {
    const r = internal.value as RangeTime
    return `${fmtTime(r.start)}  →  ${fmtTime(r.end)}`
  }
  return fmtTime(internal.value as Time)
})

const duration = computed(() => {
  if (!props.range || !internal.value) return null
  const r = internal.value as RangeTime
  if (!r.start || !r.end) return null
  const diff = (r.end.hour * 60 + r.end.minute) - (r.start.hour * 60 + r.start.minute)
  if (diff <= 0) return null
  const h = Math.floor(diff / 60), m = diff % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
})

// ── NuxtUI ui merge ────────────────────────────────────────────────────────
const mergedUi = computed(() => ({
  root: 'rti__ui-root',
  base: 'rti__ui-base',
  ...(props.ui ?? {}),
}))

// ── Label ─────────────────────────────────────────────────────────────────
const displayLabel = computed(() =>
  locale.value === 'km' && props.labelKm ? props.labelKm : props.label
)

// ── Column labels ──────────────────────────────────────────────────────────
const colLabel = computed(() => {
  const labels = {
    en: { h: 'Hour', m: 'Min', s: 'Sec' },
    km: { h: 'ម៉ោង', m: 'នាទី', s: 'វិ' },
  }
  return locale.value === 'km' ? labels.km : labels.en
})

// ── Active items list ──────────────────────────────────────────────────────
const activeItems = computed(() => {
  if (activeCol.value === 'h') return HOUR_ITEMS
  if (activeCol.value === 'm') return MIN_ITEMS
  return SEC_ITEMS
})

// ── Range step label ───────────────────────────────────────────────────────
const stepLabel = computed(() => {
  if (!props.range) return null
  if (rangeStep.value === 'start')
    return locale.value === 'km' ? 'ជ្រើស ✦ ចាប់ផ្ដើម' : 'Pick start time'
  return locale.value === 'km' ? 'ជ្រើស ✦ បញ្ចប់' : 'Pick end time'
})
type SingleValue = InstanceType<typeof Time>
type RangeValue = { start: InstanceType<typeof Time>; end: InstanceType<typeof Time> }
  // ─── Model ───────────────────────────────────────────────────────────────────
const modelValue = defineModel<SingleValue | RangeValue>()
  const singleValue = computed({
  get: () => (props.range ? new Time(0, 0, 0) : (modelValue.value as SingleValue)),
  set: (v: SingleValue) => {
    if (!props.range) modelValue.value = v
  },
})
const rangeValue = computed({
  get: () =>
    props.range
      ? (modelValue.value as RangeValue)
      : { start: new Time(0, 0, 0), end: new Time(23, 59, 0) },
  set: (v: RangeValue) => {
    if (props.range) modelValue.value = v
  },
})

// Individual range bindings
const startValue = computed({
  get: () => rangeValue.value?.start,
  set: (v: SingleValue) => {
    rangeValue.value = { ...rangeValue.value, start: v }
  },
})
// Individual range bindings
const endValue = computed({
  get: () => rangeValue.value.end,
  set: (v: SingleValue) => {
    rangeValue.value = { ...rangeValue.value, end: v }
  },
})


const startTime = ref(new Time(12, 30))
</script>

<template>
  <div
    :class="[
      'rti',
      `rti--${size}`,
      {
        'rti--range':    range,
        'rti--disabled': disabled,
        'rti--readonly': readonly,
        'rti--error':    !!error,
        'rti--filled':   hasValue,
        'rti--open':     open,
      },
    ]"
  >
    <!-- ── Label ──────────────────────────────────────────── -->
    <div v-if="displayLabel || hint" class="rti__label-row">
      <label class="rti__label">
        {{ displayLabel }}
        <span v-if="required" class="rti__req">*</span>
      </label>
      <span v-if="hint && !error" class="rti__hint">{{ hint }}</span>
    </div>

    <!-- ── Field ──────────────────────────────────────────── -->
    <div class="rti__field">

      <!-- NuxtUI UInputTime (single) -->
      <UInputTime
        v-if="!range"
        v-model="singleValue"
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="rti__input"
        @blur="emit('blur')"
      />
        <!-- v-model="(internal as Time)" -->

      <!-- NuxtUI UInputTime (range) -->
      <UInputTime
        v-else
        v-model="startTime"
        range
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="rti__input"
        @blur="emit('blur')"
      />

      <!-- Trailing: clear + clock trigger -->
      <div class="rti__trail">
        <Transition name="rti-fade">
          <button
            v-if="clearable && hasValue && !disabled && !readonly"
            type="button"
            class="rti__clear"
            tabindex="-1"
            aria-label="Clear"
            @click.stop="clearValue"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </Transition>

        <button
          ref="triggerRef"
          type="button"
          :disabled="disabled || readonly"
          :class="['rti__trigger', { 'rti__trigger--active': open }]"
          aria-label="Open clock picker"
          @click.stop="openPicker"
        >
          <UIcon name="i-lucide-clock" />
        </button>
      </div>
    </div>

    <!-- ── Error ──────────────────────────────────────────── -->
    <Transition name="rti-fade">
      <p v-if="error" class="rti__error" role="alert">
        <UIcon name="i-lucide-alert-circle" />{{ error }}
      </p>
    </Transition>

    <!-- ── Summary chip ───────────────────────────────────── -->
    <Transition name="rti-fade">
      <div v-if="summaryText && !error" class="rti__summary">
        <UIcon name="i-lucide-clock-check" />
        <span class="rti__summary-val">{{ summaryText }}</span>
        <span v-if="duration" class="rti__summary-dur">· {{ duration }}</span>
      </div>
    </Transition>

    <!-- ════════════════════════════════════════════════════
         CLOCK PICKER POPOVER
    ════════════════════════════════════════════════════ -->
    
    <Transition name="rti-pop">
      <div v-if="open" ref="popRef" class="rti__pop">

        <!-- Header -->
        <div class="rti__pop-head">
          <!-- Range step badge -->
          <div class="rti__pop-step" v-if="range">
            <span :class="['rti__step-dot', rangeStep === 'start' ? 'rti__step-dot--start' : 'rti__step-dot--end']" />
            {{ stepLabel }}
          </div>

          <!-- Current time display -->
          <div class="rti__pop-clock-display">
            <button
              :class="['rti__col-tab', { 'rti__col-tab--active': activeCol === 'h' }]"
              type="button"
              @click="activeCol = 'h'"
            >
              {{ pad(editingTime.hour) }}
            </button>
            <span class="rti__colon">:</span>
            <button
              :class="['rti__col-tab', { 'rti__col-tab--active': activeCol === 'm' }]"
              type="button"
              @click="activeCol = 'm'"
            >
              {{ pad(editingTime.minute) }}
            </button>
            <template v-if="granularity === 'second'">
              <span class="rti__colon">:</span>
              <button
                :class="['rti__col-tab', { 'rti__col-tab--active': activeCol === 's' }]"
                type="button"
                @click="activeCol = 's'"
              >
                {{ pad(editingTime.second) }}
              </button>
            </template>
          </div>

          <!-- Column label pill -->
          <div class="rti__col-label-pill">
            {{ activeCol === 'h' ? colLabel.h : activeCol === 'm' ? colLabel.m : colLabel.s }}
          </div>
        </div>

        <!-- Column tabs strip -->
        <div class="rti__col-strip">
          <button
            :class="['rti__strip-btn', { 'rti__strip-btn--active': activeCol === 'h' }]"
            type="button"
            @click="activeCol = 'h'"
          >
            <UIcon name="i-lucide-timer" />
            {{ colLabel.h }}
          </button>
          <span class="rti__strip-sep" />
          <button
            :class="['rti__strip-btn', { 'rti__strip-btn--active': activeCol === 'm' }]"
            type="button"
            @click="activeCol = 'm'"
          >
            <UIcon name="i-lucide-clock-2" />
            {{ colLabel.m }}
          </button>
          <template v-if="granularity === 'second'">
            <span class="rti__strip-sep" />
            <button
              :class="['rti__strip-btn', { 'rti__strip-btn--active': activeCol === 's' }]"
              type="button"
              @click="activeCol = 's'"
            >
              <UIcon name="i-lucide-clock-4" />
              {{ colLabel.s }}
            </button>
          </template>
        </div>

        <!-- Grid of clickable values -->
        <div class="rti__grid" :class="activeCol === 'h' ? 'rti__grid--6' : 'rti__grid--4'">
          <button
            v-for="val in activeItems"
            :key="val"
            type="button"
            :class="['rti__grid-item', { 'rti__grid-item--active': isActive(val) }]"
            @click="pickValue(val)"
          >
            {{ pad(val) }}
          </button>
        </div>

        <!-- Range progress bar -->
        <div v-if="range" class="rti__range-bar">
          <div :class="['rti__range-seg', { 'rti__range-seg--done': !!(internal as RangeTime)?.start }]">
            <UIcon :name="(internal as RangeTime)?.start ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" />
            <span>{{ locale === 'km' ? 'ចាប់ផ្ដើម' : 'Start' }}</span>
            <code v-if="(internal as RangeTime)?.start">{{ fmtTime((internal as RangeTime).start) }}</code>
          </div>
          <div class="rti__range-arrow">→</div>
          <div :class="['rti__range-seg', { 'rti__range-seg--done': !!(internal as RangeTime)?.end }]">
            <UIcon :name="(internal as RangeTime)?.end ? 'i-lucide-check-circle-2' : 'i-lucide-circle'" />
            <span>{{ locale === 'km' ? 'បញ្ចប់' : 'End' }}</span>
            <code v-if="(internal as RangeTime)?.end">{{ fmtTime((internal as RangeTime).end) }}</code>
          </div>
        </div>

        <!-- Footer -->
        <div class="rti__pop-footer">
          <button type="button" class="rti__foot-ghost" @click="closePicker">
            {{ locale === 'km' ? 'បិទ' : 'Close' }}
          </button>
          <button
            v-if="range && rangeStep === 'end'"
            type="button"
            class="rti__foot-solid"
            @click="closePicker"
          >
            <UIcon name="i-lucide-check" />
            {{ locale === 'km' ? 'យល់ព្រម' : 'Done' }}
          </button>
        </div>

      </div>
    </Transition>

  </div>
</template>

<style lang="scss" scoped>

// ─────────────────────────────────────────────
// HOST
// ─────────────────────────────────────────────
.rti {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);
  font-family:    var(--font-fallback);
  position:       relative;

  &--xs  { font-size: 0.72rem; }
  &--sm  { font-size: 0.8rem;  }
  &--md  { font-size: 0.875rem;}
  &--lg  { font-size: 0.95rem; }
  &--xl  { font-size: 1rem;    }

  &--disabled { opacity: 0.5; pointer-events: none; }
  &--readonly { pointer-events: none; }

  &--error .rti__input :deep([role="group"]) {
    border-color: var(--c-danger) !important;
  }
}

// ─────────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────────
.rti__label-row {
  display:         flex;
  align-items:     baseline;
  justify-content: space-between;
  gap:             var(--space-2);
}
.rti__label  { font-size: 0.82rem; font-weight: 500; color: var(--c-text); display: flex; gap: 4px; }
.rti__req    { color: var(--c-danger); font-size: 0.9em; }
.rti__hint   { font-size: 0.72rem; color: var(--c-muted); }
.rti__error  { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--c-danger); margin: 0; }

// ─────────────────────────────────────────────
// FIELD + NUXTUI OVERRIDE
// ─────────────────────────────────────────────
.rti__field {
  position:    relative;
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
}

.rti__input {
  flex: 1;

  :deep([role="group"]) {
    width:         100%;
    font-family:   var(--font-fallback) !important;
    background:    var(--c-surface) !important;
    border:        1px solid var(--c-border) !important;
    border-radius: var(--radius-md) !important;
    @include transition(fast);

    &:focus-within {
      border-color: var(--c-accent) !important;
      box-shadow:   0 0 0 3px rgba(255, 140, 66, 0.12) !important;
    }
  }

  :deep([data-type]:not([data-type="literal"])) {
    font-family:           var(--font-fallback) !important;
    font-variant-numeric:  tabular-nums;
    color:                 var(--c-muted) !important;
    border-radius:         var(--radius-sm) !important;
    @include transition(fast);

    &[data-focused], &:focus {
      background: rgba(255, 140, 66, 0.12) !important;
      color:      var(--c-accent) !important;
      outline:    none !important;
    }
  }

  .rti--filled & :deep([data-type]:not([data-type="literal"])) {
    color: var(--c-text) !important;
  }

  :deep([data-type="literal"]) {
    color:       var(--c-muted) !important;
    user-select: none;
  }

  // Height by size
  .rti--xs & :deep([role="group"]) { min-height: 30px; padding: 0 8px; }
  .rti--sm & :deep([role="group"]) { min-height: 34px; padding: 0 10px; }
  .rti--md & :deep([role="group"]) { min-height: 38px; padding: 0 12px; }
  .rti--lg & :deep([role="group"]) { min-height: 42px; padding: 0 14px; }
  .rti--xl & :deep([role="group"]) { min-height: 46px; padding: 0 16px; }
}

// ─────────────────────────────────────────────
// TRAILING
// ─────────────────────────────────────────────
.rti__trail {
  display:     flex;
  align-items: center;
  gap:         4px;
  flex-shrink: 0;
}

.rti__clear {
  width:         24px; height: 24px;
  border:        none; border-radius: 50%;
  background:    rgba(248,113,113,0.1);
  color:         var(--c-danger);
  cursor:        pointer;
  @include flex-center; @include transition(fast);
  font-size:     0.72rem; padding: 0;
  &:hover { background: rgba(248,113,113,0.22); }
}

.rti__trigger {
  width:         32px; height: 32px;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    transparent;
  color:         var(--c-muted);
  cursor:        pointer;
  @include flex-center; @include transition(fast);
  padding:       0; font-size: 0.95rem;

  &:hover, &--active {
    border-color: var(--c-accent);
    color:        var(--c-accent);
    background:   rgba(255,140,66,0.07);
    box-shadow:   var(--glow-accent-sm);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

// ─────────────────────────────────────────────
// SUMMARY CHIP
// ─────────────────────────────────────────────
.rti__summary {
  display:       inline-flex;
  align-items:   center;
  gap:           var(--space-2);
  padding:       3px 10px;
  background:    rgba(255,140,66,0.07);
  border:        1px solid rgba(255,140,66,0.18);
  border-radius: var(--radius-full);
  width:         fit-content;
  font-size:     0.75rem;

  svg           { color: var(--c-accent); font-size: 0.82rem; flex-shrink: 0; }
  &-val         { font-weight: 600; color: var(--c-text); font-variant-numeric: tabular-nums; letter-spacing: 0.03em; }
  &-dur         { color: var(--c-muted); }
}

// ─────────────────────────────────────────────
// POPOVER
// ─────────────────────────────────────────────
.rti__pop {
  position:      absolute;
  top:           calc(100% + 8px);
  left:          0;
  z-index:       300;
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-xl);
  box-shadow:    var(--glass-shadow);
  overflow:      hidden;
  width:         288px;

  @include mobile-only {
    width:     calc(100vw - 2rem);
    left:      50%;
    transform: translateX(-50%);
  }
}

// ── Header ────────────────────────────────────
.rti__pop-head {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  gap:            var(--space-2);
  padding:        var(--space-4) var(--space-4) var(--space-2);
  background:     var(--bg-tertiary);
  border-bottom:  1px solid var(--c-border);
}

.rti__pop-step {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
  font-size:   0.72rem;
  font-weight: 600;
  color:       var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  align-self:  flex-start;
}

.rti__step-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  &--start { background: var(--c-accent); box-shadow: var(--glow-accent-sm); }
  &--end   { background: var(--c-info); }
}

// Big time display — clickable segments to switch col
.rti__pop-clock-display {
  display:     flex;
  align-items: center;
  gap:         2px;
}

.rti__col-tab {
  font-size:   2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color:       var(--c-muted);
  background:  transparent;
  border:      2px solid transparent;
  border-radius: var(--radius-md);
  padding:     2px 8px;
  cursor:      pointer;
  @include transition(fast);
  line-height: 1;

  &--active {
    color:        var(--c-accent);
    border-color: rgba(255,140,66,0.3);
    background:   rgba(255,140,66,0.08);
    text-shadow:  var(--glow-text);
  }

  &:hover:not(&--active) {
    color:      var(--c-text);
    background: rgba(255,255,255,0.05);
  }
}

.rti__colon {
  font-size:   1.8rem;
  font-weight: 700;
  color:       var(--c-accent);
  opacity:     0.6;
  line-height: 1;
  margin:      0 1px;
}

.rti__col-label-pill {
  font-size:     0.65rem;
  font-weight:   700;
  color:         var(--c-accent);
  background:    rgba(255,140,66,0.1);
  border-radius: var(--radius-full);
  padding:       2px 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

// ── Column strip ────────────────────────────
.rti__col-strip {
  display:         flex;
  align-items:     stretch;
  background:      var(--bg-tertiary);
  border-bottom:   1px solid var(--c-border);
}

.rti__strip-btn {
  flex:            1;
  display:         flex;
  align-items:     center;
  justify-content: center;
  gap:             var(--space-1);
  padding:         var(--space-2) 0;
  border:          none;
  background:      transparent;
  color:           var(--c-muted);
  font-size:       0.75rem;
  font-weight:     500;
  font-family:     var(--font-fallback);
  cursor:          pointer;
  @include transition(fast);
  border-bottom:   2px solid transparent;

  svg { font-size: 0.85rem; }

  &:hover { color: var(--c-text); background: rgba(255,255,255,0.04); }

  &--active {
    color:         var(--c-accent);
    border-color:  var(--c-accent);
    background:    rgba(255,140,66,0.05);
  }
}

.rti__strip-sep {
  width: 1px;
  background: var(--c-border);
  margin: var(--space-2) 0;
}

// ── Click grid ──────────────────────────────
.rti__grid {
  display: grid;
  gap:     var(--space-1);
  padding: var(--space-3) var(--space-3) var(--space-2);

  &--6 { grid-template-columns: repeat(6, 1fr); }  // hours: 0-23 → 6 cols × 4 rows
  &--4 { grid-template-columns: repeat(4, 1fr); }  // mins/secs: 12 items → 4 cols × 3 rows
}

.rti__grid-item {
  aspect-ratio:    1;
  display:         flex;
  align-items:     center;
  justify-content: center;
  border:          1px solid transparent;
  border-radius:   var(--radius-md);
  background:      transparent;
  color:           var(--c-text);
  font-size:       0.8rem;
  font-weight:     500;
  font-variant-numeric: tabular-nums;
  font-family:     var(--font-fallback);
  cursor:          pointer;
  @include transition(fast);

  &:hover:not(&--active) {
    background:   rgba(255,140,66,0.08);
    border-color: rgba(255,140,66,0.2);
    color:        var(--c-accent);
  }

  &--active {
    background:   var(--c-accent);
    border-color: var(--c-accent);
    color:        #fff;
    font-weight:  700;
    box-shadow:   var(--glow-accent-sm);
  }
}

// ── Range progress bar ───────────────────────
.rti__range-bar {
  display:       flex;
  align-items:   center;
  gap:           var(--space-2);
  padding:       var(--space-2) var(--space-3);
  background:    var(--bg-tertiary);
  border-top:    1px solid var(--c-border);
  font-size:     0.75rem;
}

.rti__range-seg {
  display:     flex;
  align-items: center;
  gap:         var(--space-1);
  flex:        1;
  color:       var(--c-muted);
  @include transition(fast);

  svg  { font-size: 0.85rem; }
  code {
    font-size:     0.7rem;
    padding:       1px 6px;
    background:    rgba(255,140,66,0.1);
    border-radius: var(--radius-sm);
    color:         var(--c-accent);
  }

  &--done {
    color: var(--c-accent);
    svg { filter: drop-shadow(0 0 4px rgba(255,140,66,0.4)); }
  }
}

.rti__range-arrow {
  color:       var(--c-accent);
  font-weight: 700;
  flex-shrink: 0;
}

// ── Footer ──────────────────────────────────
.rti__pop-footer {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             var(--space-2);
  padding:         var(--space-2) var(--space-3);
  border-top:      1px solid var(--c-border);
  background:      var(--bg-tertiary);
}

.rti__foot-ghost {
  padding:       5px 14px;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    transparent;
  color:         var(--c-muted);
  font-size:     0.78rem;
  font-family:   var(--font-fallback);
  cursor:        pointer;
  @include transition(fast);
  &:hover { border-color: var(--c-accent); color: var(--c-accent); }
}

.rti__foot-solid {
  display:       flex;
  align-items:   center;
  gap:           var(--space-1);
  padding:       5px 14px;
  border:        1px solid var(--c-accent);
  border-radius: var(--radius-md);
  background:    var(--c-accent);
  color:         #fff;
  font-size:     0.78rem;
  font-family:   var(--font-fallback);
  font-weight:   600;
  cursor:        pointer;
  @include transition(fast);
  box-shadow:    var(--glow-accent-sm);
  &:hover { background: var(--c-accent-2); border-color: var(--c-accent-2); }
}

// ─────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────
.rti-fade-enter-active, .rti-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rti-fade-enter-from,   .rti-fade-leave-to     { opacity: 0; transform: translateY(-2px); }

.rti-pop-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rti-pop-leave-active { transition: all 0.15s ease; }
.rti-pop-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.96); }
.rti-pop-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>

<!-- Global dark mode -->
<style lang="scss">
.dark .rti__input :deep([role="group"]) {
  background: rgba(19, 19, 26, 0.8) !important;
}
.dark .rti__pop {
  background: rgba(19, 19, 26, 0.97);
}
</style>