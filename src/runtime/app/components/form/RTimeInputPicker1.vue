<script setup lang="ts">
// RTimeInputPicker — SARIKA
// Native-feel time picker: text input + popover drum scroll picker
// Supports: v-model (HH:MM or HH:MM:SS string), 12/24h, step, am/pm, size, disabled, clearable
// Keyboard: ↑↓ on drum columns, Tab between columns, Enter/Escape on popover

import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

// ── Types ──────────────────────────────────────────────────────────────────
export interface TimeValue {
  hours:   number   // 0-23 (always 24h internally)
  minutes: number
  seconds: number
}

// ── Props ──────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue?:  string | null   // "HH:MM" or "HH:MM:SS"
  label?:       string
  labelKm?:     string
  hint?:        string
  error?:       string
  placeholder?: string
  size?:        'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?:    boolean
  readonly?:    boolean
  clearable?:   boolean
  required?:    boolean
  use12h?:      boolean          // AM/PM mode
  showSeconds?: boolean
  minuteStep?:  number           // 1, 5, 10, 15, 30
  secondStep?:  number
  minTime?:     string           // "HH:MM" — optional boundary
  maxTime?:     string
  // NuxtUI ui passthrough (for UInput wrapper)
  ui?:          Record<string, unknown>
}>(), {
  size:        'md',
  clearable:   true,
  use12h:      false,
  showSeconds: false,
  minuteStep:  1,
  secondStep:  1,
})

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  'update:modelValue': [val: string | null]
  change:              [val: string | null]
  clear:               []
  blur:                []
}>()

const { locale } = useI18n()

// ── Parse / Format helpers ─────────────────────────────────────────────────
function parseTime(str?: string | null): TimeValue {
  if (!str) return { hours: 0, minutes: 0, seconds: 0 }
  const parts = str.split(':').map(Number)
  return {
    hours:   Math.max(0, Math.min(23, parts[0] ?? 0)),
    minutes: Math.max(0, Math.min(59, parts[1] ?? 0)),
    seconds: Math.max(0, Math.min(59, parts[2] ?? 0)),
  }
}

function formatTime(t: TimeValue): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return props.showSeconds
    ? `${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`
    : `${pad(t.hours)}:${pad(t.minutes)}`
}

function to12h(h: number) {
  if (h === 0)  return 12
  if (h > 12)   return h - 12
  return h
}

function fromAmPm(h12: number, pm: boolean): number {
  if (pm  && h12 !== 12) return h12 + 12
  if (!pm && h12 === 12) return 0
  return h12
}

// ── State ──────────────────────────────────────────────────────────────────
const open      = ref(false)
const inputRef  = ref<HTMLInputElement | null>(null)
const popRef    = ref<HTMLDivElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

const time = ref<TimeValue>(parseTime(props.modelValue))
const ampm = ref<'AM' | 'PM'>(time.value.hours >= 12 ? 'PM' : 'AM')

// Drum scroll refs
const hourDrum   = ref<HTMLDivElement | null>(null)
const minuteDrum = ref<HTMLDivElement | null>(null)
const secondDrum = ref<HTMLDivElement | null>(null)

// Raw text input state
const rawInput   = ref(props.modelValue ?? '')
const inputError = ref(false)

// ── Sync prop → internal ───────────────────────────────────────────────────
watch(() => props.modelValue, v => {
  const parsed = parseTime(v)
  time.value   = parsed
  ampm.value   = parsed.hours >= 12 ? 'PM' : 'AM'
  rawInput.value = v ?? ''
})

// ── Emit on change ─────────────────────────────────────────────────────────
function emitChange() {
  const str = formatTime(time.value)
  rawInput.value = str
  emit('update:modelValue', str)
  emit('change', str)
}

// ── Drum item lists ────────────────────────────────────────────────────────
const hourItems = computed(() => {
  if (props.use12h) return Array.from({ length: 12 }, (_, i) => i + 1)   // 1-12
  return Array.from({ length: 24 }, (_, i) => i)                          // 0-23
})

const minuteItems = computed(() =>
  Array.from({ length: Math.ceil(60 / props.minuteStep) }, (_, i) => i * props.minuteStep)
)

const secondItems = computed(() =>
  Array.from({ length: Math.ceil(60 / props.secondStep) }, (_, i) => i * props.secondStep)
)

// Current displayed hour (12h or 24h)
const displayHour = computed(() =>
  props.use12h ? to12h(time.value.hours) : time.value.hours
)

// ── Drum scroll logic ──────────────────────────────────────────────────────
const ITEM_H = 40  // px per drum item — must match CSS

function scrollDrumTo(el: HTMLDivElement | null, idx: number) {
  if (!el) return
  el.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' })
}

function scrollAllDrums() {
  nextTick(() => {
    const hIdx = props.use12h
      ? hourItems.value.indexOf(displayHour.value)
      : time.value.hours
    scrollDrumTo(hourDrum.value,   hIdx)
    scrollDrumTo(minuteDrum.value, minuteItems.value.indexOf(
      roundToStep(time.value.minutes, props.minuteStep)
    ))
    if (props.showSeconds) {
      scrollDrumTo(secondDrum.value, secondItems.value.indexOf(
        roundToStep(time.value.seconds, props.secondStep)
      ))
    }
  })
}

function roundToStep(val: number, step: number) {
  const nearest = Math.round(val / step) * step
  const list = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step)
  return list.includes(nearest) ? nearest : list[0]
}

// ── Popover open/close ─────────────────────────────────────────────────────
function openPicker() {
  if (props.disabled || props.readonly) return
  open.value = true
  scrollAllDrums()
}

function closePicker() {
  open.value = false
  emit('blur')
}

// Click-outside
function onOutsideClick(e: MouseEvent) {
  if (
    popRef.value?.contains(e.target as Node) ||
    triggerRef.value?.contains(e.target as Node) ||
    inputRef.value?.contains(e.target as Node)
  ) return
  closePicker()
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick))

// ── Set hour ───────────────────────────────────────────────────────────────
function setHour(h: number) {
  if (props.use12h) {
    time.value = { ...time.value, hours: fromAmPm(h, ampm.value === 'PM') }
  } else {
    time.value = { ...time.value, hours: h }
  }
  emitChange()
}

function setMinute(m: number) {
  time.value = { ...time.value, minutes: m }
  emitChange()
}

function setSecond(s: number) {
  time.value = { ...time.value, seconds: s }
  emitChange()
}

function toggleAmPm(val: 'AM' | 'PM') {
  ampm.value = val
  time.value = { ...time.value, hours: fromAmPm(to12h(time.value.hours), val === 'PM') }
  emitChange()
}

// ── Keyboard on drum ──────────────────────────────────────────────────────
function onDrumKey(e: KeyboardEvent, col: 'h' | 'm' | 's') {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault()
    const dir = e.key === 'ArrowUp' ? -1 : 1

    if (col === 'h') {
      const list = hourItems.value
      const cur  = list.indexOf(displayHour.value)
      const next = (cur + dir + list.length) % list.length
      setHour(list[next])
      scrollDrumTo(hourDrum.value, next)
    } else if (col === 'm') {
      const list = minuteItems.value
      const cur  = list.indexOf(roundToStep(time.value.minutes, props.minuteStep))
      const next = (cur + dir + list.length) % list.length
      setMinute(list[next])
      scrollDrumTo(minuteDrum.value, next)
    } else {
      const list = secondItems.value
      const cur  = list.indexOf(roundToStep(time.value.seconds, props.secondStep))
      const next = (cur + dir + list.length) % list.length
      setSecond(list[next])
      scrollDrumTo(secondDrum.value, next)
    }
  }
  if (e.key === 'Escape') closePicker()
}

// ── Raw text input ─────────────────────────────────────────────────────────
function onInputChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  rawInput.value = val
  // Accept HH:MM or HH:MM:SS
  const match = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (match) {
    const h = Number(match[1])
    const m = Number(match[2])
    const s = Number(match[3] ?? 0)
    if (h <= 23 && m <= 59 && s <= 59) {
      inputError.value = false
      time.value = { hours: h, minutes: m, seconds: s }
      ampm.value = h >= 12 ? 'PM' : 'AM'
      emit('update:modelValue', val)
      emit('change', val)
      return
    }
  }
  inputError.value = val.length > 0
}

function onInputFocus() {
  openPicker()
}

// ── Clear ──────────────────────────────────────────────────────────────────
function clearValue() {
  time.value     = { hours: 0, minutes: 0, seconds: 0 }
  ampm.value     = 'AM'
  rawInput.value = ''
  inputError.value = false
  emit('update:modelValue', null)
  emit('clear')
}

// ── Display string ─────────────────────────────────────────────────────────
const displayValue = computed(() => {
  if (!props.modelValue && !rawInput.value) return ''
  if (props.use12h) {
    const h = to12h(time.value.hours)
    const pad = (n: number) => String(n).padStart(2, '0')
    return props.showSeconds
      ? `${pad(h)}:${pad(time.value.minutes)}:${pad(time.value.seconds)} ${ampm.value}`
      : `${pad(h)}:${pad(time.value.minutes)} ${ampm.value}`
  }
  return formatTime(time.value)
})

// ── Now shortcut ──────────────────────────────────────────────────────────
function setNow() {
  const n = new Date()
  time.value = { hours: n.getHours(), minutes: n.getMinutes(), seconds: n.getSeconds() }
  ampm.value = time.value.hours >= 12 ? 'PM' : 'AM'
  emitChange()
  scrollAllDrums()
}

// ── Pad helper for template ───────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
</script>

<template>
  <div
    :class="[
      'rtip',
      `rtip--${size}`,
      {
        'rtip--disabled': disabled,
        'rtip--readonly': readonly,
        'rtip--error':    !!error || inputError,
        'rtip--open':     open,
      },
    ]"
  >
    <!-- ── Label ──────────────────────────────────────────── -->
    <div v-if="label || labelKm" class="rtip__label-row">
      <label class="rtip__label">
        {{ locale === 'km' && labelKm ? labelKm : label }}
        <span v-if="required" class="rtip__req" aria-hidden="true">*</span>
      </label>
      <span v-if="hint && !error" class="rtip__hint">{{ hint }}</span>
    </div>

    <!-- ── Input field ────────────────────────────────────── -->
    <div class="rtip__field">
      <!-- Clock icon -->
      <span class="rtip__lead-icon" aria-hidden="true">
        <UIcon name="i-lucide-clock" />
      </span>

      <!-- Text input -->
      <input
        ref="inputRef"
        :value="displayValue"
        type="text"
        :placeholder="placeholder ?? (use12h ? '12:00 AM' : '00:00')"
        :disabled="disabled"
        :readonly="readonly"
        :class="['rtip__input', { 'rtip__input--has-value': !!modelValue }]"
        autocomplete="off"
        spellcheck="false"
        @input="onInputChange"
        @focus="onInputFocus"
        @keydown.escape="closePicker"
      />

      <!-- Trailing actions -->
      <div class="rtip__trail">
        <!-- Clear -->
        <Transition name="rtip-fade">
          <button
            v-if="clearable && modelValue"
            type="button"
            class="rtip__clear"
            tabindex="-1"
            aria-label="Clear time"
            @click.stop="clearValue"
          >
            <UIcon name="i-lucide-x" />
          </button>
        </Transition>

        <!-- Trigger -->
        <button
          ref="triggerRef"
          type="button"
          :disabled="disabled || readonly"
          :class="['rtip__trigger', { 'rtip__trigger--active': open }]"
          aria-label="Open time picker"
          @click.stop="open ? closePicker() : openPicker()"
        >
          <UIcon name="i-lucide-clock-3" />
        </button>
      </div>
    </div>

    <!-- ── Error message ──────────────────────────────────── -->
    <Transition name="rtip-fade">
      <p v-if="error || inputError" class="rtip__error" role="alert">
        <UIcon name="i-lucide-alert-circle" />
        {{ error ?? (locale === 'km' ? 'ទម្រង់ម៉ោងមិនត្រឹមត្រូវ' : 'Invalid time format (HH:MM)') }}
      </p>
    </Transition>

    <!-- ── Popover drum picker ────────────────────────────── -->
    <Transition name="rtip-pop">
      <div
        v-if="open"
        ref="popRef"
        class="rtip__pop"
        role="dialog"
        aria-label="Time picker"
        @keydown.escape="closePicker"
      >
        <!-- Header -->
        <div class="rtip__pop-head">
          <div class="rtip__pop-display">
            <span class="rtip__pop-time">
              {{ use12h ? `${pad(to12h(time.hours))}:${pad(time.minutes)}${showSeconds ? `:${pad(time.seconds)}` : ''} ${ampm}` : formatTime(time) }}
            </span>
            <RBadge v-if="modelValue" variant="default" size="sm" dot>
              {{ locale === 'km' ? 'បានជ្រើស' : 'set' }}
            </RBadge>
          </div>
          <button type="button" class="rtip__now-btn" @click="setNow">
            <UIcon name="i-lucide-timer" />
            {{ locale === 'km' ? 'ឥឡូវ' : 'Now' }}
          </button>
        </div>

        <!-- Column labels -->
        <div :class="['rtip__col-labels', { 'rtip__col-labels--secs': showSeconds, 'rtip__col-labels--ampm': use12h }]">
          <span>{{ locale === 'km' ? 'ម៉ោង' : 'HH' }}</span>
          <span>{{ locale === 'km' ? 'នាទី' : 'MM' }}</span>
          <span v-if="showSeconds">{{ locale === 'km' ? 'វិ' : 'SS' }}</span>
          <span v-if="use12h">AM/PM</span>
        </div>

        <!-- Drums -->
        <div :class="['rtip__drums', { 'rtip__drums--secs': showSeconds, 'rtip__drums--ampm': use12h }]">

          <!-- Selection highlight bar -->
          <div class="rtip__selector" aria-hidden="true" />

          <!-- ── Hour drum ── -->
          <div
            ref="hourDrum"
            class="rtip__drum"
            tabindex="0"
            role="listbox"
            :aria-label="locale === 'km' ? 'ម៉ោង' : 'Hours'"
            @keydown="onDrumKey($event, 'h')"
          >
            <div class="rtip__drum-pad" />
            <div
              v-for="h in hourItems"
              :key="h"
              :class="['rtip__drum-item', { 'rtip__drum-item--active': h === displayHour }]"
              role="option"
              :aria-selected="h === displayHour"
              @click="setHour(h); scrollDrumTo(hourDrum, hourItems.indexOf(h))"
            >
              {{ pad(h) }}
            </div>
            <div class="rtip__drum-pad" />
          </div>

          <!-- Colon -->
          <div class="rtip__colon" aria-hidden="true">:</div>

          <!-- ── Minute drum ── -->
          <div
            ref="minuteDrum"
            class="rtip__drum"
            tabindex="0"
            role="listbox"
            :aria-label="locale === 'km' ? 'នាទី' : 'Minutes'"
            @keydown="onDrumKey($event, 'm')"
          >
            <div class="rtip__drum-pad" />
            <div
              v-for="m in minuteItems"
              :key="m"
              :class="['rtip__drum-item', { 'rtip__drum-item--active': m === roundToStep(time.minutes, minuteStep) }]"
              role="option"
              :aria-selected="m === time.minutes"
              @click="setMinute(m); scrollDrumTo(minuteDrum, minuteItems.indexOf(m))"
            >
              {{ pad(m) }}
            </div>
            <div class="rtip__drum-pad" />
          </div>

          <!-- Colon (seconds) -->
          <div v-if="showSeconds" class="rtip__colon" aria-hidden="true">:</div>

          <!-- ── Second drum ── -->
          <div
            v-if="showSeconds"
            ref="secondDrum"
            class="rtip__drum"
            tabindex="0"
            role="listbox"
            :aria-label="locale === 'km' ? 'វិនាទី' : 'Seconds'"
            @keydown="onDrumKey($event, 's')"
          >
            <div class="rtip__drum-pad" />
            <div
              v-for="s in secondItems"
              :key="s"
              :class="['rtip__drum-item', { 'rtip__drum-item--active': s === roundToStep(time.seconds, secondStep) }]"
              role="option"
              :aria-selected="s === time.seconds"
              @click="setSecond(s); scrollDrumTo(secondDrum, secondItems.indexOf(s))"
            >
              {{ pad(s) }}
            </div>
            <div class="rtip__drum-pad" />
          </div>

          <!-- ── AM/PM column ── -->
          <div v-if="use12h" class="rtip__ampm-col">
            <button
              v-for="p in ['AM', 'PM'] as const"
              :key="p"
              type="button"
              :class="['rtip__ampm-btn', { 'rtip__ampm-btn--active': ampm === p }]"
              @click="toggleAmPm(p)"
            >
              {{ p }}
            </button>
          </div>

        </div><!-- /drums -->

        <!-- Footer -->
        <div class="rtip__pop-footer">
          <button type="button" class="rtip__footer-btn rtip__footer-btn--ghost" @click="closePicker">
            {{ locale === 'km' ? 'បិទ' : 'Close' }}
          </button>
          <button type="button" class="rtip__footer-btn rtip__footer-btn--solid" @click="closePicker">
            <UIcon name="i-lucide-check" />
            {{ locale === 'km' ? 'យល់ព្រម' : 'Done' }}
          </button>
        </div>

      </div>
    </Transition>

  </div>
</template>

<style lang="scss" scoped>

$item-h: 40px;   // must match ITEM_H in <script>
$vis:    3;       // visible items in drum viewport = 3 (scroll window)

// ─────────────────────────────────────────────
// HOST
// ─────────────────────────────────────────────
.rtip {
  position:       relative;
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);
  font-family:    var(--font-fallback);

  &--xs  { font-size: 0.72rem; }
  &--sm  { font-size: 0.8rem;  }
  &--md  { font-size: 0.875rem;}
  &--lg  { font-size: 0.95rem; }
  &--xl  { font-size: 1rem;    }

  &--disabled { opacity: 0.5; pointer-events: none; }
  &--readonly { cursor: default; }

  &--error .rtip__input {
    border-color: var(--c-danger) !important;
    &:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important; }
  }
}

// ─────────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────────
.rtip__label-row {
  display:         flex;
  align-items:     baseline;
  justify-content: space-between;
  gap:             var(--space-1);
}
.rtip__label {
  font-size:   0.82rem;
  font-weight: 500;
  color:       var(--c-text);
  display:     flex;
  gap:         2px;
}
.rtip__req  { color: var(--c-danger); font-size: 0.9em; }
.rtip__hint { font-size: 0.72rem; color: var(--c-muted); }

// ─────────────────────────────────────────────
// FIELD ROW
// ─────────────────────────────────────────────
.rtip__field {
  position:  relative;
  display:   flex;
  align-items: center;
}

.rtip__lead-icon {
  position:  absolute;
  left:      10px;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  color:     var(--c-muted);
  font-size: 0.95rem;
  pointer-events: none;
  z-index: 1;
  @include transition(fast);

  .rtip--open & { color: var(--c-accent); }
}

.rtip__input {
  width:         100%;
  height:        38px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding:       0 80px 0 34px;    // room for lead icon + trail
  font-family:   var(--font-fallback);
  font-size:     inherit;
  color:         var(--c-text);
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  outline:       none;
  cursor:        pointer;
  @include transition(fast);

  &::placeholder { color: var(--c-muted); }

  &:focus, .rtip--open & {
    border-color: var(--c-accent);
    box-shadow:   0 0 0 3px rgba(255,140,66,0.12);
  }

  &--has-value { font-weight: 500; }

  .rtip--readonly & { cursor: default; background: var(--bg-tertiary); }

  .rtip--lg &,
  .rtip--xl & { height: 42px; }
  .rtip--xs & { height: 30px; font-size: 0.72rem; }
  .rtip--sm & { height: 34px; }
}

// ─────────────────────────────────────────────
// TRAILING
// ─────────────────────────────────────────────
.rtip__trail {
  position: absolute;
  right:    6px;
  display:  flex;
  align-items: center;
  gap:      2px;
}

.rtip__clear {
  width:         22px;
  height:        22px;
  border:        none;
  border-radius: 50%;
  background:    rgba(248,113,113,0.1);
  color:         var(--c-danger);
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  font-size:     0.7rem;
  padding:       0;
  &:hover { background: rgba(248,113,113,0.22); }
}

.rtip__trigger {
  width:         30px;
  height:        30px;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    transparent;
  color:         var(--c-muted);
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  padding:       0;
  font-size:     0.95rem;

  &:hover, &--active {
    border-color: var(--c-accent);
    color:        var(--c-accent);
    background:   rgba(255,140,66,0.07);
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

// ─────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────
.rtip__error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   0.75rem;
  color:       var(--c-danger);
  margin:      0;
}

// ─────────────────────────────────────────────
// POPOVER
// ─────────────────────────────────────────────
.rtip__pop {
  position:      absolute;
  top:           calc(100% + 6px);
  left:          0;
  z-index:       200;
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-xl);
  box-shadow:    var(--glass-shadow);
  overflow:      hidden;
  min-width:     240px;
  width:         max-content;

  // Flip up if near bottom of viewport
  @media (max-height: 500px) {
    top:    auto;
    bottom: calc(100% + 6px);
  }

  @include mobile-only {
    left:      50%;
    transform: translateX(-50%);
    min-width: 92vw;
  }
}

// ── Pop header ──
.rtip__pop-head {
  display:         flex;
  align-items:     center;
  justify-content: space-between;
  padding:         var(--space-3) var(--space-4);
  background:      var(--bg-tertiary);
  border-bottom:   1px solid var(--c-border);
  gap:             var(--space-3);
}

.rtip__pop-display {
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
}

.rtip__pop-time {
  font-size:   1.1rem;
  font-weight: 700;
  color:       var(--c-accent);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  text-shadow: var(--glow-text);
}

.rtip__now-btn {
  display:       flex;
  align-items:   center;
  gap:           var(--space-1);
  padding:       var(--space-1) var(--space-3);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    var(--c-surface);
  color:         var(--c-muted);
  font-size:     0.75rem;
  font-family:   var(--font-fallback);
  cursor:        pointer;
  @include transition(fast);
  white-space:   nowrap;

  svg { color: var(--c-accent); font-size: 0.85rem; }

  &:hover {
    border-color: var(--c-accent);
    color:        var(--c-accent);
    background:   rgba(255,140,66,0.06);
  }
}

// ── Column labels ──
.rtip__col-labels {
  display:         grid;
  grid-template-columns: 1fr auto 1fr;
  align-items:     center;
  padding:         var(--space-2) var(--space-4) 0;
  font-size:       0.65rem;
  font-weight:     700;
  color:           var(--c-muted);
  text-transform:  uppercase;
  letter-spacing:  0.07em;

  &--secs  { grid-template-columns: 1fr auto 1fr auto 1fr; }
  &--ampm  { grid-template-columns: 1fr auto 1fr 1fr; }

  span:nth-child(2) { text-align: center; }  // colon spacer
}

// ── Drums container ──
.rtip__drums {
  position: relative;
  display:  grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding:  0 var(--space-4);
  gap:      0;
  height:   ($item-h * $vis + 2px);  // 3 items visible + border

  &--secs  { grid-template-columns: 1fr auto 1fr auto 1fr; }
  &--ampm  { grid-template-columns: 1fr auto 1fr 1fr; }
}

// Selection highlight (middle row)
.rtip__selector {
  position:      absolute;
  left:          var(--space-4);
  right:         var(--space-4);
  top:           50%;
  transform:     translateY(-50%);
  height:        $item-h;
  background:    rgba(255,140,66,0.1);
  border:        1px solid rgba(255,140,66,0.25);
  border-radius: var(--radius-md);
  pointer-events: none;
  z-index:       0;
}

// ── Individual drum ──
.rtip__drum {
  height:     ($item-h * $vis);
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  position:   relative;
  z-index:    1;
  outline:    none;

  &::-webkit-scrollbar { display: none; }

  &:focus .rtip__drum-item--active {
    outline: none;
  }

  // Fade top/bottom
  mask-image:
    linear-gradient(
      to bottom,
      transparent 0%,
      black #{$item-h},
      black #{$item-h * ($vis - 1)},
      transparent 100%
    );
  -webkit-mask-image:
    linear-gradient(
      to bottom,
      transparent 0%,
      black #{$item-h},
      black #{$item-h * ($vis - 1)},
      transparent 100%
    );
}

.rtip__drum-pad {
  height:     $item-h;
  flex-shrink: 0;
}

.rtip__drum-item {
  height:          $item-h;
  display:         flex;
  align-items:     center;
  justify-content: center;
  font-size:       1rem;
  font-weight:     500;
  font-variant-numeric: tabular-nums;
  color:           var(--c-muted);
  cursor:          pointer;
  scroll-snap-align: start;
  border-radius:   var(--radius-md);
  @include transition(fast);
  user-select:     none;
  letter-spacing:  0.04em;

  &:hover:not(&--active) {
    color:      var(--c-text);
    background: rgba(255,140,66,0.06);
  }

  &--active {
    color:       var(--c-accent);
    font-weight: 700;
    font-size:   1.05rem;
  }
}

// Colon separator
.rtip__colon {
  font-size:   1.2rem;
  font-weight: 700;
  color:       var(--c-accent);
  padding:     0 4px;
  user-select: none;
  z-index:     2;
  position:    relative;
  opacity:     0.7;
}

// ── AM/PM column ──
.rtip__ampm-col {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);
  align-items:    center;
  justify-content: center;
  height:         100%;
  padding-left:   var(--space-2);
  z-index:        2;
  position:       relative;
}

.rtip__ampm-btn {
  padding:       6px 12px;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    transparent;
  color:         var(--c-muted);
  font-size:     0.78rem;
  font-weight:   600;
  font-family:   var(--font-fallback);
  cursor:        pointer;
  @include transition(fast);
  letter-spacing: 0.04em;

  &:hover:not(&--active) {
    border-color: var(--c-accent);
    color:        var(--c-accent);
    background:   rgba(255,140,66,0.06);
  }

  &--active {
    background:   var(--c-accent);
    border-color: var(--c-accent);
    color:        #fff;
    box-shadow:   var(--glow-accent-sm);
  }
}

// ── Pop footer ──
.rtip__pop-footer {
  display:         flex;
  align-items:     center;
  justify-content: flex-end;
  gap:             var(--space-2);
  padding:         var(--space-3) var(--space-4);
  border-top:      1px solid var(--c-border);
  background:      var(--bg-tertiary);
}

.rtip__footer-btn {
  display:       flex;
  align-items:   center;
  gap:           var(--space-1);
  padding:       6px 16px;
  border-radius: var(--radius-md);
  font-size:     0.82rem;
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
.rtip-fade-enter-active,
.rtip-fade-leave-active { transition: opacity 0.15s ease; }
.rtip-fade-enter-from,
.rtip-fade-leave-to     { opacity: 0; }

.rtip-pop-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rtip-pop-leave-active { transition: all 0.15s ease; }
.rtip-pop-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.97); }
.rtip-pop-leave-to     { opacity: 0; transform: translateY(-4px) scale(0.98); }
</style>
