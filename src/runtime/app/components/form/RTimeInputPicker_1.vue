
<script setup>
// RTimeInput — SARIKA
// NuxtUI v4 UInputTime + drum-scroll popover picker
// Modes  : single (default) | range (prop)
// Picker : vertical drum columns — click OR scroll to select
// Range  : picking happens in two phases: start → end
// v-model: Time | { start: Time; end: Time } | null

import { shallowRef , ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Time } from '@internationalized/date'
import { useI18n } from 'vue-i18n'

// ── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  modelValue: {
    type: [Object, Time, null],
    default: null
  },
  range: Boolean,
  granularity: {
    type: String,
    default: 'minute',
    values: ['hour', 'minute', 'second']
  },
  hourCycle: {
    type: Number,
    default: 12,
    values: [12, 24]
  },
  minuteStep: {
    type: Number,
    default: 1,
    values: [1, 5, 10, 15, 30]
  },
  secondStep: {
    type: Number,
    default: 1,
    values: [1, 5, 10, 15, 30]
  },
  label: String,
  labelKm: String,
  hint: String,
  error: String,
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  clearable: Boolean,
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  ui: { type: Object, default: {} },
})

// (), {
//   granularity: 'minute',
//   minuteStep:  1,
//   secondStep:  1,
//   size:        'md',
//   clearable:   true,
// })

const emit = defineEmits({
  'update:modelValue': [],
  'change': [],
  'clear': [],
  'blur': [],
})

const { locale, t } = useI18n()
// const internal = ref(props.modelValue ?? null)
const internal = shallowRef(props.modelValue ?? null)
console.log("Internal ----------------> ",internal.value)
watch(() => props.modelValue, v => { internal.value = v ?? null })
watch(internal, v => { emit('update:modelValue', v); emit('change', v) })
console.log("Test Time Instance ------> ",internal.value instanceof Time)
console.log("Test Time Typeof ------> ",typeof internal.value?.copy)
watch(internal, (v) => {
  console.log('MODEL', v)
  console.log('IS RANGE', props.range)

  if (v?.start) {
    console.log('START COPY', typeof v.start.copy)
    console.log('END COPY', typeof v.end.copy)
  }
})
// ── Internal model ─────────────────────────────────────────────────────────


// const startTime = { start: new Time(0, 0, 0), end: new Time(23, 59, 0) }
const startTime = ref(new Time(0, 0, 0))
const endTime = { start: new Time(0, 0, 0), end: new Time(23, 59, 0) }
const rangeValue = computed(() => props.range ? internal.value : startTime)
console.log("Range Value---------------------------> " , rangeValue.value)
// const rangeValue = computed({
//   get() {
//     return internal.value ?? {
//       start: new Time(0, 0, 0),
//       end: new Time(23, 59, 0)
//     }
//   },
//   set(value) {
//     internal.value = value
//   }
// })
const singleValue = computed({
  get() {
    return internal.value ?? new Time(0, 0, 0)
  },
  set(v) {
    internal.value = v
  }
})
// const rangeValue = computed({
//   get: () =>
//     props.range
//       ? (modelValue.value as RangeValue)
//       : { start: new Time(0, 0, 0), end: new Time(23, 59, 0) },
//   set: (v: RangeValue) => {
//     if (props.range) modelValue.value = v
//   },
// })

// // Individual range bindings
// const startValue = computed({
//   get: () => rangeValue.value.start,
//   set: (v: SingleValue) => {
//     rangeValue.value = { ...rangeValue.value, start: v }
//   },
// })


// ── Popover state ──────────────────────────────────────────────────────────
const open       = ref(false)
const popRef     = ref(null)
const triggerRef = ref(null)

// Range: two-phase picking
const rangeStep = ref('start')

function openPicker() {
  if (props.disabled || props.readonly) return
  if (props.range) rangeStep.value = 'start'
  open.value = !open.value
  if (open.value) nextTick(scrollAllDrums)
}
function closePicker() { open.value = false; emit('blur') }

function onOutside(e) {
  const t = e.target
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

const hasValue = computed(() => !!internal.value)

// ── Drum item lists ────────────────────────────────────────────────────────
const ITEM_H = 44   // px — must match CSS

const hourItems = computed(() =>
  props.hourCycle === 12
    ? Array.from({ length: 12 }, (_, i) => i + 1)      // 1-12
    : Array.from({ length: 24 }, (_, i) => i)           // 0-23
)
const minuteItems = computed(() =>
  Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, i) => i * props.minuteStep)
)
const secondItems = computed(() =>
  Array.from({ length: Math.ceil(60 / props.secondStep) }, (_, i) => i * props.secondStep)
)

// ── Editing time (current phase in range mode) ─────────────────────────────
const editingTime = computed(() => {
  if (!internal.value) return new Time(0, 0, 0)
  if (props.range) {
    const r = internal.value 
    return (rangeStep.value === 'start' ? r.start : r.end) ?? new Time(0, 0, 0)
  }
  return (internal.value) ?? new Time(0, 0, 0)
})

// Convert 24h → 12h display
function to12h(h) { return h === 0 ? 12 : h > 12 ? h - 12 : h }

// ── Drum refs ──────────────────────────────────────────────────────────────
const hourDrum   = ref(null)
const minuteDrum = ref(null)
const secondDrum = ref(null)
const ampmDrum   = ref(null)

function scrollDrumTo(el, idx, instant = false) {
  if (!el) return
  el.scrollTo({ top: idx * ITEM_H, behavior: instant ? 'instant' : 'smooth' })
}

function scrollAllDrums(instant = true) {
  const t = editingTime.value
  const hDisplay = props.hourCycle === 12 ? to12h(t.hour) : t.hour

  scrollDrumTo(hourDrum.value,
    hourItems.value.indexOf(hDisplay), instant)
  scrollDrumTo(minuteDrum.value,
    minuteItems.value.findIndex(m => m >= t.minute) ?? 0, instant)
  if (props.granularity === 'second')
    scrollDrumTo(secondDrum.value,
      secondItems.value.findIndex(s => s >= t.second) ?? 0, instant)
  if (props.hourCycle === 12)
    scrollDrumTo(ampmDrum.value, t.hour >= 12 ? 1 : 0, instant)
}

// ── Click on drum item ─────────────────────────────────────────────────────
function pickHour(h) {
  let realH = h
  if (props.hourCycle === 12) {
    const isPm = editingTime.value.hour >= 12
    realH = isPm ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h)
  }
  applyTime(new Time(realH, editingTime.value.minute, editingTime.value.second))
  scrollDrumTo(hourDrum.value, hourItems.value.indexOf(h))
}

function pickMinute(m) {
  applyTime(new Time(editingTime.value.hour, m, editingTime.value.second))
  scrollDrumTo(minuteDrum.value, minuteItems.value.indexOf(m))
}

function pickSecond(s) {
  applyTime(new Time(editingTime.value.hour, editingTime.value.minute, s))
  scrollDrumTo(secondDrum.value, secondItems.value.indexOf(s))
}

function pickAmPm(pm) {
  const h = editingTime.value.hour
  let newH = h
  if (pm && h < 12) newH = h + 12
  if (!pm && h >= 12) newH = h - 12
  applyTime(new Time(newH, editingTime.value.minute, editingTime.value.second))
  scrollDrumTo(ampmDrum.value, pm ? 1 : 0)
}

function applyTime2(t) {
  if (!props.range) {
    internal.value = t
    return
  }
  const prev = (internal.value) ?? { start: new Time(0,0,0), end: new Time(0,0,0) }
  if (rangeStep.value === 'start') {
    internal.value = { start: t, end: prev.end }
  } else {
    internal.value = { start: prev.start, end: t }
  }
}
function applyTime(t) {
  if (!props.range) {
    internal.value = t
    return
  }

  const prev = internal.value ?? {
    start: new Time(0,0,0),
    end: new Time(0,0,0)
  }

  if (rangeStep.value === 'start') {
    internal.value = {
      start: t,
      end: prev.end
    }
  } else {
    internal.value = {
      start: prev.start,
      end: t
    }
  }
}
// Advance range phase
function advancePhase() {
  if (!props.range) { closePicker(); return }
  if (rangeStep.value === 'start') {
    rangeStep.value = 'end'
    nextTick(scrollAllDrums)
  } else {
    closePicker()
  }
}

// ── Keyboard on drums ──────────────────────────────────────────────────────
function onDrumKey(e, col) {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
  e.preventDefault()
  const dir = e.key === 'ArrowUp' ? -1 : 1
  if (col === 'h') {
    const list = hourItems.value
    const cur  = list.indexOf(props.hourCycle === 12 ? to12h(editingTime.value.hour) : editingTime.value.hour)
    pickHour(list[(cur + dir + list.length) % list.length])
  } else if (col === 'm') {
    const list = minuteItems.value
    const cur  = list.indexOf(editingTime.value.minute)
    pickMinute(list[(cur + dir + list.length) % list.length])
  } else {
    const list = secondItems.value
    const cur  = list.indexOf(editingTime.value.second)
    pickSecond(list[(cur + dir + list.length) % list.length])
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0')

function fmtTime(t) {
  if (!t) return '—'
  if (props.granularity === 'second') return `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`
  if (props.granularity === 'hour')   return `${pad(t.hour)}:00`
  return `${pad(t.hour)}:${pad(t.minute)}`
}

const summaryText = computed(() => {
  if (!internal.value) return null
  if (props.range) {
    const r = internal.value
    return `${fmtTime(r.start)}  →  ${fmtTime(r.end)}`
  }
  return fmtTime(internal.value)
})

const duration = computed(() => {
  if (!props.range || !internal.value) return null
  const r = internal.value
  if (!r.start || !r.end) return null
  const diff = (r.end.hour * 60 + r.end.minute) - (r.start.hour * 60 + r.start.minute)
  if (diff <= 0) return null
  const h = Math.floor(diff / 60), m = diff % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
})

// ── Active checks ──────────────────────────────────────────────────────────
function isHourActive(h) {
  const t = editingTime.value
  return (props.hourCycle === 12 ? to12h(t.hour) : t.hour) === h
}
function isMinActive(m) { return editingTime.value.minute === m }
function isSecActive(s) { return editingTime.value.second === s }
function isAmPmActive(pm) { return pm ? editingTime.value.hour >= 12 : editingTime.value.hour < 12 }

// ── NuxtUI ui merge ────────────────────────────────────────────────────────
const mergedUi = computed(() => ({
  root: 'rti__ui-root',
  base: 'rti__ui-base',
  ...(props.ui ?? {}),
}))

const displayLabel = computed(() =>
  locale.value === 'km' && props.labelKm ? props.labelKm : props.label
)

const lbl = computed(() =>
  locale.value === 'km'
    ? { h: 'ម៉ោង', m: 'នាទី', s: 'វិ', am: 'ព្រឹក', pm: 'ល្ងាច' }
    : { h: 'Hour',  m: 'Min',  s: 'Sec', am: 'AM',   pm: 'PM' }
)

const stepLabel = computed(() =>
  props.range
    ? (rangeStep.value === 'start'
        ? (locale.value === 'km' ? '✦ ចាប់ផ្ដើម' : '✦ Start')
        : (locale.value === 'km' ? '✦ បញ្ចប់'    : '✦ End'))
    : null
)
</script>

<template>
  <div
    :class="[
      'rti', `rti--${size}`,
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

      <!-- NuxtUI single -->
      <UInputTime
        v-if="!range"
        v-model="startTime"
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="rti__input"
        @blur="emit('blur')"
      <!-- NuxtUI range -->
      <!-- <UInputTime
        v-else
        v-model="endTime"
        range
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="rti__input"
        @blur="emit('blur')"
      /> -->

      <!-- Trailing -->
      <div class="rti__trail">
        <Transition name="rti-fade">
          <button
            v-if="clearable && hasValue && !disabled && !readonly"
            type="button" class="rti__clear" tabindex="-1"
            aria-label="Clear" @click.stop="clearValue"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </Transition>
        <button
          ref="triggerRef" type="button"
          :disabled="disabled || readonly"
          :class="['rti__trigger', { 'rti__trigger--active': open }]"
          aria-label="Open time drum picker"
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

    <!-- ══════════════════════════════════════════════════════
         DRUM PICKER POPOVER
    ══════════════════════════════════════════════════════ -->
    <Transition name="rti-pop">
      <div v-if="open" ref="popRef" class="rti__pop" role="dialog" aria-label="Time drum picker">

        <!-- Header: live time display + range step badge -->
        <div class="rti__pop-head">
          <div class="rti__pop-live">
            <span class="rti__pop-live-time">
              {{ hourCycle === 12
                ? `${pad(to12h(editingTime.hour))}:${pad(editingTime.minute)}${granularity === 'second' ? ':' + pad(editingTime.second) : ''}`
                : fmtTime(editingTime) }}
            </span>
            <span v-if="hourCycle === 12" class="rti__pop-live-ampm">
              {{ editingTime.hour >= 12 ? lbl.pm : lbl.am }}
            </span>
            <span v-if="range" :class="['rti__step-badge', `rti__step-badge--${rangeStep}`]">
              {{ stepLabel }}
            </span>
          </div>
        </div>

        <!-- Column header labels -->
        <div class="rti__drum-labels" :class="{
          'rti__drum-labels--sec':  granularity === 'second',
          'rti__drum-labels--ampm': hourCycle === 12,
        }">
          <span>{{ lbl.h }}</span>
          <span v-if="granularity !== 'hour'">{{ lbl.m }}</span>
          <span v-if="granularity === 'second'">{{ lbl.s }}</span>
          <span v-if="hourCycle === 12">AM/PM</span>
        </div>

        <!-- ══ Drum columns ══ -->
        <div class="rti__drums" :class="{
          'rti__drums--sec':  granularity === 'second',
          'rti__drums--ampm': hourCycle === 12,
        }">

          <!-- Selection highlight bar -->
          <div class="rti__selector" aria-hidden="true" />

          <!-- Hour drum -->
          <div
            ref="hourDrum"
            class="rti__drum"
            tabindex="0"
            role="listbox" :aria-label="lbl.h"
            @keydown="onDrumKey($event, 'h')"
          >
            <div class="rti__drum-pad" />
            <div
              v-for="h in hourItems" :key="h"
              :class="['rti__drum-item', { 'rti__drum-item--active': isHourActive(h) }]"
              role="option" :aria-selected="isHourActive(h)"
              @click="pickHour(h)"
            >{{ pad(h) }}</div>
            <div class="rti__drum-pad" />
          </div>

          <!-- Colon -->
          <div v-if="granularity !== 'hour'" class="rti__colon" aria-hidden="true">:</div>

          <!-- Minute drum -->
          <div
            v-if="granularity !== 'hour'"
            ref="minuteDrum"
            class="rti__drum"
            tabindex="0"
            role="listbox" :aria-label="lbl.m"
            @keydown="onDrumKey($event, 'm')"
          >
            <div class="rti__drum-pad" />
            <div
              v-for="m in minuteItems" :key="m"
              :class="['rti__drum-item', { 'rti__drum-item--active': isMinActive(m) }]"
              role="option" :aria-selected="isMinActive(m)"
              @click="pickMinute(m)"
            >{{ pad(m) }}</div>
            <div class="rti__drum-pad" />
          </div>

          <!-- Colon (seconds) -->
          <div v-if="granularity === 'second'" class="rti__colon" aria-hidden="true">:</div>

          <!-- Second drum -->
          <div
            v-if="granularity === 'second'"
            ref="secondDrum"
            class="rti__drum"
            tabindex="0"
            role="listbox" :aria-label="lbl.s"
            @keydown="onDrumKey($event, 's')"
          >
            <div class="rti__drum-pad" />
            <div
              v-for="s in secondItems" :key="s"
              :class="['rti__drum-item', { 'rti__drum-item--active': isSecActive(s) }]"
              role="option" :aria-selected="isSecActive(s)"
              @click="pickSecond(s)"
            >{{ pad(s) }}</div>
            <div class="rti__drum-pad" />
          </div>

          <!-- AM/PM drum -->
          <div
            v-if="hourCycle === 12"
            ref="ampmDrum"
            class="rti__drum rti__drum--ampm"
            tabindex="0"
            role="listbox" aria-label="AM/PM"
          >
            <div class="rti__drum-pad" />
            <div
              :class="['rti__drum-item', 'rti__drum-item--ampm', { 'rti__drum-item--active': isAmPmActive(false) }]"
              role="option" @click="pickAmPm(false)"
            >{{ lbl.am }}</div>
            <div
              :class="['rti__drum-item', 'rti__drum-item--ampm', { 'rti__drum-item--active': isAmPmActive(true) }]"
              role="option" @click="pickAmPm(true)"
            >{{ lbl.pm }}</div>
            <div class="rti__drum-pad" />
          </div>

        </div><!-- /drums -->

        <!-- Range progress strip -->
        <div v-if="range" class="rti__range-strip">
          <div :class="['rti__range-seg', { 'rti__range-seg--done': !!(internal)?.start, 'rti__range-seg--active': rangeStep === 'start' }]">
            <UIcon :name="(internal)?.start ? 'i-lucide-check-circle-2' : 'i-lucide-circle-dashed'" />
            <span>{{ locale === 'km' ? 'ចាប់ផ្ដើម' : 'Start' }}</span>
            <code v-if="(internal)?.start">{{ fmtTime((internal)?.start) }}</code>
          </div>
          <UIcon name="i-lucide-arrow-right" class="rti__range-arrow" />
          <div :class="['rti__range-seg', { 'rti__range-seg--done': !!(internal)?.end, 'rti__range-seg--active': rangeStep === 'end' }]">
            <UIcon :name="(internal)?.end ? 'i-lucide-check-circle-2' : 'i-lucide-circle-dashed'" />
            <span>{{ locale === 'km' ? 'បញ្ចប់' : 'End' }}</span>
            <code v-if="(internal)?.end">{{ fmtTime((internal)?.end) }}</code>
          </div>
        </div>

        <!-- Footer -->
        <div class="rti__pop-footer">
          <button type="button" class="rti__btn rti__btn--ghost" @click="closePicker">
            {{ locale === 'km' ? 'បោះបង់' : 'Cancel' }}
          </button>
          <button type="button" class="rti__btn rti__btn--solid" @click="advancePhase">
            <UIcon :name="range && rangeStep === 'start' ? 'i-lucide-arrow-right' : 'i-lucide-check'" />
            {{ range && rangeStep === 'start'
               ? (locale === 'km' ? 'បន្ទាប់' : 'Next')
               : (locale === 'km' ? 'យល់ព្រម' : 'Done') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>

$item-h: 44px;   // must match ITEM_H in <script>
$vis:    3;       // visible items in viewport

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
  display: flex; align-items: baseline;
  justify-content: space-between; gap: var(--space-2);
}
.rti__label  { font-size: 0.82rem; font-weight: 500; color: var(--c-text); display: flex; gap: 4px; }
.rti__req    { color: var(--c-danger); font-size: 0.9em; }
.rti__hint   { font-size: 0.72rem; color: var(--c-muted); }
.rti__error  { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--c-danger); margin: 0; }

// ─────────────────────────────────────────────
// FIELD + NUXTUI OVERRIDES
// ─────────────────────────────────────────────
.rti__field { position: relative; display: flex; align-items: center; gap: var(--space-2); }

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
      box-shadow:   0 0 0 3px rgba(255,140,66,0.12) !important;
    }
  }

  :deep([data-type]:not([data-type="literal"])) {
    font-family: var(--font-fallback) !important;
    font-variant-numeric: tabular-nums;
    color: var(--c-muted) !important;
    border-radius: var(--radius-sm) !important;
    @include transition(fast);
    &[data-focused], &:focus {
      background: rgba(255,140,66,0.12) !important;
      color:      var(--c-accent) !important;
      outline:    none !important;
    }
  }

  .rti--filled & :deep([data-type]:not([data-type="literal"])) {
    color: var(--c-text) !important;
  }

  :deep([data-type="literal"]) { color: var(--c-muted) !important; user-select: none; }

  .rti--xs & :deep([role="group"]) { min-height: 30px; padding: 0 8px; }
  .rti--sm & :deep([role="group"]) { min-height: 34px; padding: 0 10px; }
  .rti--md & :deep([role="group"]) { min-height: 38px; padding: 0 12px; }
  .rti--lg & :deep([role="group"]) { min-height: 42px; padding: 0 14px; }
  .rti--xl & :deep([role="group"]) { min-height: 46px; padding: 0 16px; }
}

// ─────────────────────────────────────────────
// TRAILING
// ─────────────────────────────────────────────
.rti__trail { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

.rti__clear {
  width: 24px; height: 24px; border: none; border-radius: 50%;
  background: rgba(248,113,113,0.1); color: var(--c-danger);
  cursor: pointer; @include flex-center; @include transition(fast);
  font-size: 0.72rem; padding: 0;
  &:hover { background: rgba(248,113,113,0.22); }
}

.rti__trigger {
  width: 32px; height: 32px;
  border: 1px solid var(--c-border); border-radius: var(--radius-md);
  background: transparent; color: var(--c-muted);
  cursor: pointer; @include flex-center; @include transition(fast); padding: 0;
  &:hover, &--active {
    border-color: var(--c-accent); color: var(--c-accent);
    background: rgba(255,140,66,0.07); box-shadow: var(--glow-accent-sm);
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

// ─────────────────────────────────────────────
// SUMMARY CHIP
// ─────────────────────────────────────────────
.rti__summary {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: 3px 10px;
  background: rgba(255,140,66,0.07); border: 1px solid rgba(255,140,66,0.18);
  border-radius: var(--radius-full); width: fit-content; font-size: 0.75rem;
  svg           { color: var(--c-accent); font-size: 0.82rem; flex-shrink: 0; }
  &-val         { font-weight: 600; color: var(--c-text); font-variant-numeric: tabular-nums; }
  &-dur         { color: var(--c-muted); }
}

// ─────────────────────────────────────────────
// POPOVER SHELL
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
  width:         max-content;
  min-width:     220px;

  @include mobile-only {
    width: calc(100vw - 2rem);
    left:  50%;
    transform: translateX(-50%);
  }
}

// ── Header ────────────────────────────────────
.rti__pop-head {
  padding:       var(--space-3) var(--space-4);
  background:    var(--bg-tertiary);
  border-bottom: 1px solid var(--c-border);
}

.rti__pop-live {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
}

.rti__pop-live-time {
  font-size:   1.5rem;
  font-weight: 800;
  color:       var(--c-accent);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.03em;
  text-shadow: var(--glow-text);
  line-height: 1;
}

.rti__pop-live-ampm {
  font-size:   0.78rem;
  font-weight: 700;
  color:       var(--c-muted);
  align-self:  flex-end;
  margin-bottom: 3px;
}

.rti__step-badge {
  font-size:     0.65rem;
  font-weight:   700;
  padding:       2px 10px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.07em;

  &--start {
    background: rgba(255,140,66,0.12);
    color:      var(--c-accent);
    border:     1px solid rgba(255,140,66,0.25);
  }
  &--end {
    background: rgba(96,165,250,0.12);
    color:      var(--c-info);
    border:     1px solid rgba(96,165,250,0.25);
  }
}

// ── Column label strip ───────────────────────
.rti__drum-labels {
  display:        grid;
  grid-template-columns: 1fr;
  gap:            var(--space-1);
  padding:        var(--space-2) var(--space-4) var(--space-1);
  font-size:      0.62rem;
  font-weight:    700;
  color:          var(--c-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align:     center;

  // auto-grow columns to match drum layout
  grid-template-columns: 1fr auto 1fr;            // h : m  (default minute)
  &--sec  { grid-template-columns: 1fr auto 1fr auto 1fr; }
  &--ampm { grid-template-columns: 1fr auto 1fr 48px; }
}

// ── Drums container ──────────────────────────
.rti__drums {
  position: relative;
  display:  grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding:  0 var(--space-4);
  height:   ($item-h * $vis);
  gap:      0;

  &--sec  { grid-template-columns: 1fr auto 1fr auto 1fr; }
  &--ampm { grid-template-columns: 1fr auto 1fr 48px; }
}

// Highlight bar sitting behind the centre row
.rti__selector {
  position:      absolute;
  left:          var(--space-3);
  right:         var(--space-3);
  top:           50%;
  transform:     translateY(-50%);
  height:        $item-h;
  background:    rgba(255,140,66,0.09);
  border:        1px solid rgba(255,140,66,0.22);
  border-radius: var(--radius-md);
  pointer-events: none;
  z-index:       0;
}

// ── Single drum ──────────────────────────────
.rti__drum {
  height:     ($item-h * $vis);
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  outline:    none;
  position:   relative;
  z-index:    1;
  &::-webkit-scrollbar { display: none; }

  // top & bottom fade
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black #{$item-h},
    black #{$item-h * ($vis - 1)},
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black #{$item-h},
    black #{$item-h * ($vis - 1)},
    transparent 100%
  );

  &--ampm {
    height:     ($item-h * $vis);
    display:    flex;
    flex-direction: column;
    overflow-y: visible;
    mask-image: none;
    -webkit-mask-image: none;
    justify-content: center;
    gap:        var(--space-2);
    padding:    0 0 0 var(--space-2);
  }
}

.rti__drum-pad {
  height:      $item-h;
  flex-shrink: 0;
  scroll-snap-align: start;
}

.rti__drum-item {
  height:          $item-h;
  display:         flex;
  align-items:     center;
  justify-content: center;
  font-size:       0.98rem;
  font-weight:     500;
  font-variant-numeric: tabular-nums;
  color:           var(--c-muted);
  cursor:          pointer;
  scroll-snap-align: start;
  border-radius:   var(--radius-md);
  @include transition(fast);
  user-select:     none;
  letter-spacing:  0.03em;

  &:hover:not(&--active) {
    color:      var(--c-text);
    background: rgba(255,140,66,0.06);
  }

  &--active {
    color:       var(--c-accent);
    font-weight: 700;
    font-size:   1.08rem;
  }

  // AM/PM pill style
  &--ampm {
    height:        36px;
    width:         44px;
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    font-size:     0.72rem;
    font-weight:   600;
    scroll-snap-align: unset;

    &.rti__drum-item--active {
      background:   var(--c-accent);
      border-color: var(--c-accent);
      color:        #fff !important;
      box-shadow:   var(--glow-accent-sm);
      font-size:    0.72rem;
    }
  }
}

// Colon separator
.rti__colon {
  font-size:   1.2rem;
  font-weight: 700;
  color:       var(--c-accent);
  opacity:     0.55;
  padding:     0 2px;
  user-select: none;
  z-index:     2;
  position:    relative;
}

// ── Range strip ──────────────────────────────
.rti__range-strip {
  display:       flex;
  align-items:   center;
  gap:           var(--space-2);
  padding:       var(--space-2) var(--space-4);
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
  padding:     4px 6px;
  border-radius: var(--radius-sm);

  svg  { font-size: 0.88rem; flex-shrink: 0; }

  code {
    font-size:     0.7rem;
    padding:       1px 6px;
    background:    rgba(255,140,66,0.1);
    border-radius: var(--radius-sm);
    color:         var(--c-accent);
  }

  &--active {
    background: rgba(255,140,66,0.07);
    color:      var(--c-text);
  }

  &--done { color: var(--c-accent); }
}

.rti__range-arrow {
  color:      var(--c-accent);
  font-size:  0.82rem;
  flex-shrink: 0;
  opacity:    0.7;
}

// ── Footer ──────────────────────────────────
.rti__pop-footer {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             var(--space-2);
  padding:         var(--space-2) var(--space-4);
  border-top:      1px solid var(--c-border);
  background:      var(--bg-tertiary);
}

.rti__btn {
  display:       flex;
  align-items:   center;
  gap:           var(--space-1);
  padding:       5px 14px;
  border-radius: var(--radius-md);
  font-size:     0.8rem;
  font-family:   var(--font-fallback);
  font-weight:   500;
  cursor:        pointer;
  @include transition(fast);

  &--ghost {
    border:     1px solid var(--c-border);
    background: transparent;
    color:      var(--c-muted);
    &:hover { border-color: var(--c-accent); color: var(--c-accent); }
  }

  &--solid {
    border:     1px solid var(--c-accent);
    background: var(--c-accent);
    color:      #fff;
    box-shadow: var(--glow-accent-sm);
    &:hover { background: var(--c-accent-2); border-color: var(--c-accent-2); }
  }
}

// ─────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────
.rti-fade-enter-active, .rti-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rti-fade-enter-from,   .rti-fade-leave-to     { opacity: 0; transform: translateY(-2px); }

.rti-pop-enter-active { transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rti-pop-leave-active { transition: all 0.15s ease; }
.rti-pop-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.96); }
.rti-pop-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>

<!-- Global: dark mode corrections -->
<style lang="scss">
.dark .rti__input :deep([role="group"]) {
  background: rgba(19, 19, 26, 0.8) !important;
}
.dark .rti__pop {
  background: rgba(19, 19, 26, 0.97);
}
</style>