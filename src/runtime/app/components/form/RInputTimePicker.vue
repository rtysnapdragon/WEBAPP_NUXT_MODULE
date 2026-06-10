<script setup lang="ts">
// RInputTimePicker — SARIKA
// Thin, fully-typed wrapper around NuxtUI v4 UInputTime
// Modes via props:
//   :range="false"  → single Time value          (default)
//   :range="true"   → { start: Time, end: Time }
//   :granularity    → 'hour' | 'minute' | 'second' (default 'minute')
//   :hour-cycle     → 12 | 24
//   :disabled / :readonly / :required
//
// v-model: Time | { start: Time; end: Time } | null
// Emits:   update:modelValue, change, clear, blur

import { Time } from '@internationalized/date'
import { useI18n } from 'vue-i18n'
import { shallowRef, computed, watch, toRaw } from 'vue'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'

// ── Types ──────────────────────────────────────────────────────────────────
export type SingleTimeValue = Time | null
export interface RangeTimeValue { start: Time; end: Time }
export type TimeModelValue = SingleTimeValue | RangeTimeValue | null

// ── Props ──────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  // Core
  modelValue?:   TimeModelValue
  range?:        boolean

  // UInputTime passthrough
  granularity?:  'hour' | 'minute' | 'second'
  hourCycle?:    12 | 24
  disabled?:     boolean
  readonly?:     boolean
  required?:     boolean

  // Field decoration
  label?:        string
  labelKm?:      string
  hint?:         string
  error?:        string
  placeholder?:  string
  size?:         'xs' | 'sm' | 'md' | 'lg' | 'xl'
  clearable?:    boolean

  // NuxtUI ui slot passthrough (merged with SARIKA defaults)
  ui?:           Record<string, unknown>
}>(), {
  granularity: 'minute',
  size:        'md',
  clearable:   true,
})

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  'update:modelValue': [val: TimeModelValue]
  change:              [val: TimeModelValue]
  clear:               []
  blur:                []
}>()

const { locale } = useI18n()
const selected  = shallowRef<Time | null>
  props.modelValue ? toRaw(props.modelValue) : null
const EMPTY = today(getLocalTimeZone()) // stable fallback placeholder

// ── Internal model (shallowRef — Time objects are immutable) ───────────────
const internal = shallowRef<TimeModelValue>(props.modelValue ?? null)
const inputValue = computed((): TimeModelValue =>
  selected.value ? toRaw(selected.value) : toRaw(EMPTY)
)


watch(() => props.modelValue, v => { internal.value = v ?? null })
watch(internal, v => {
  emit('update:modelValue', v)
  emit('change', v)
})

// ── Label / hint resolved bilingually ─────────────────────────────────────
const displayLabel = computed(() =>
  locale.value === 'km' && props.labelKm ? props.labelKm : props.label
)

// ── Clear ──────────────────────────────────────────────────────────────────
function clearValue() {
  internal.value = null
  emit('clear')
}

// ── NuxtUI ui deep-merge: SARIKA defaults → consumer overrides ─────────────
const baseUi = computed<Record<string, unknown>>(() => ({
  root:    'ritp__root',
  base:    'ritp__base',
  leading: 'ritp__leading',
}))

const mergedUi = computed(() => ({
  ...baseUi.value,
  ...(props.ui ?? {}),
}))

// ── Helper: is value non-null (drives clear button) ────────────────────────
const hasValue = computed(() => {
  if (internal.value == null) return false
  if (props.range) {
    const v = internal.value as RangeTimeValue
    return v.start != null || v.end != null
  }
  return internal.value != null
})

// ── Format display string for summary chip ─────────────────────────────────
function fmtTime(t: Time | null | undefined): string {
  if (!t) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  if (props.granularity === 'second')
    return `${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`
  if (props.granularity === 'hour')
    return `${pad(t.hour)}:00`
  return `${pad(t.hour)}:${pad(t.minute)}`
}

const displaySummary = computed(() => {
  if (!internal.value) return null
  if (props.range) {
    const v = internal.value as RangeTimeValue
    return `${fmtTime(v.start)} → ${fmtTime(v.end)}`
  }
  return fmtTime(internal.value as Time)
})

// ── Duration (range mode only) ────────────────────────────────────────────
const duration = computed(() => {
  if (!props.range || !internal.value) return null
  const v = internal.value as RangeTimeValue
  if (!v.start || !v.end) return null
  const startMins = v.start.hour  * 60 + v.start.minute
  const endMins   = v.end.hour    * 60 + v.end.minute
  const diff      = endMins - startMins
  if (diff <= 0) return null
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
})
</script>

<template>
  <div
    :class="[
      'ritp',
      `ritp--${size}`,
      {
        'ritp--range':    range,
        'ritp--disabled': disabled,
        'ritp--readonly': readonly,
        'ritp--error':    !!error,
        'ritp--filled':   hasValue,
      },
    ]"
  >
    <!-- ── Label row ────────────────────────────────────── -->
    <div v-if="displayLabel || hint" class="ritp__label-row">
      <label class="ritp__label">
        {{ displayLabel }}
        <span v-if="required" class="ritp__req" aria-hidden="true">*</span>
      </label>
      <span v-if="hint && !error" class="ritp__hint">{{ hint }}</span>
    </div>

    <!-- ── Input wrapper ────────────────────────────────── -->
    <div class="ritp__field">

      <!-- Mode: single -->
      <UInputTime
        v-if="!range"
        v-model="(inputValue as Time | null)"
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="ritp__input"
        @blur="emit('blur')"
      />

      <!-- Mode: range -->
      <UInputTime
        v-else
        v-model="(inputValue as RangeTimeValue)"
        range
        :granularity="granularity"
        :hour-cycle="hourCycle"
        :disabled="disabled"
        :readonly="readonly"
        :ui="mergedUi"
        class="ritp__input"
        @blur="emit('blur')"
      />

      <!-- Clear button -->
      <Transition name="ritp-fade">
        <button
          v-if="clearable && hasValue && !disabled && !readonly"
          type="button"
          class="ritp__clear"
          tabindex="-1"
          aria-label="Clear time"
          @click="clearValue"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </Transition>
    </div>

    <!-- ── Error ────────────────────────────────────────── -->
    <Transition name="ritp-fade">
      <p v-if="error" class="ritp__error" role="alert">
        <UIcon name="i-lucide-alert-circle" />
        {{ error }}
      </p>
    </Transition>

    <!-- ── Value summary chip ────────────────────────────── -->
    <Transition name="ritp-fade">
      <div v-if="hasValue && !error" class="ritp__summary">
        <UIcon name="i-lucide-clock-check" class="ritp__summary-icon" />
        <span class="ritp__summary-val">{{ displaySummary }}</span>
        <span v-if="range && duration" class="ritp__summary-dur">
          · {{ duration }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>


// ─────────────────────────────────────────────
// HOST
// ─────────────────────────────────────────────
.ritp {
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

  // Error ring on NuxtUI segments
  &--error {
    :deep([data-focused]),
    :deep(input) {
      border-color: var(--c-danger) !important;
    }
  }
}

// ─────────────────────────────────────────────
// LABEL
// ─────────────────────────────────────────────
.ritp__label-row {
  display:         flex;
  align-items:     baseline;
  justify-content: space-between;
  gap:             var(--space-2);
}

.ritp__label {
  font-size:   0.82rem;
  font-weight: 500;
  color:       var(--c-text);
  display:     flex;
  gap:         4px;
  align-items: baseline;
}

.ritp__req  { color: var(--c-danger); font-size: 0.9em; }
.ritp__hint { font-size: 0.72rem; color: var(--c-muted); }

// ─────────────────────────────────────────────
// FIELD ROW
// ─────────────────────────────────────────────
.ritp__field {
  position:    relative;
  display:     flex;
  align-items: center;
  gap:         var(--space-2);
}

// ── NuxtUI UInputTime SARIKA override ──────────
// All deep overrides live here so NuxtUI internals
// get SARIKA tokens without !important abuse
.ritp__input {
  flex: 1;
  min-width: 0;

  // Outer container / border
  :deep([class*="input"]),
  :deep([role="group"]) {
    font-family:   var(--font-fallback) !important;
    background:    var(--c-surface) !important;
    border:        1px solid var(--c-border) !important;
    border-radius: var(--radius-md) !important;
    @include transition(fast);

    &:focus-within {
      border-color: var(--c-accent) !important;
      box-shadow:   0 0 0 3px rgba(255, 140, 66, 0.12) !important;
      outline:      none !important;
    }
  }

  // Segment cells (hour / minute / second / am-pm)
  :deep([data-type]:not([data-type="literal"])) {
    font-family:   var(--font-fallback) !important;
    font-variant-numeric: tabular-nums;
    color:         var(--c-muted) !important;
    border-radius: var(--radius-sm) !important;
    @include transition(fast);

    &[data-placeholder] { color: var(--c-muted) !important; opacity: 0.6; }

    &[data-focused],
    &:focus {
      background: rgba(255, 140, 66, 0.12) !important;
      color:      var(--c-accent) !important;
      outline:    none !important;
    }
  }

  // Filled segments
  .ritp--filled & :deep([data-type]:not([data-type="literal"])) {
    color: var(--c-text) !important;
  }

  // Literal separators ( : and –– range arrow)
  :deep([data-type="literal"]) {
    color:       var(--c-muted) !important;
    user-select: none;
    font-weight: 500;
  }

  // Range separator arrow
  :deep([data-type="literal"]:has(~ [data-type])) {
    color: var(--c-accent) !important;
    padding: 0 var(--space-1);
  }

  // Size-driven height
  .ritp--xs & :deep([role="group"]) { min-height: 30px; padding: 0 8px; }
  .ritp--sm & :deep([role="group"]) { min-height: 34px; padding: 0 10px; }
  .ritp--md & :deep([role="group"]) { min-height: 38px; padding: 0 12px; }
  .ritp--lg & :deep([role="group"]) { min-height: 42px; padding: 0 14px; font-size: 1rem; }
  .ritp--xl & :deep([role="group"]) { min-height: 46px; padding: 0 16px; font-size: 1.05rem; }
}

// ─────────────────────────────────────────────
// CLEAR BUTTON
// ─────────────────────────────────────────────
.ritp__clear {
  width:         26px;
  height:        26px;
  flex-shrink:   0;
  border:        none;
  border-radius: 50%;
  background:    rgba(248, 113, 113, 0.1);
  color:         var(--c-danger);
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  font-size:     0.72rem;
  padding:       0;

  &:hover { background: rgba(248, 113, 113, 0.22); }
}

// ─────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────
.ritp__error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   0.75rem;
  color:       var(--c-danger);
  margin:      0;
}

// ─────────────────────────────────────────────
// SUMMARY CHIP
// ─────────────────────────────────────────────
.ritp__summary {
  display:       inline-flex;
  align-items:   center;
  gap:           var(--space-2);
  padding:       3px 10px;
  background:    rgba(255, 140, 66, 0.07);
  border:        1px solid rgba(255, 140, 66, 0.18);
  border-radius: var(--radius-full);
  width:         fit-content;

  &-icon { font-size: 0.82rem; color: var(--c-accent); flex-shrink: 0; }

  &-val {
    font-size:   0.75rem;
    font-weight: 600;
    color:       var(--c-text);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.03em;
  }

  &-dur {
    font-size: 0.72rem;
    color:     var(--c-muted);
  }
}

// ─────────────────────────────────────────────
// TRANSITIONS
// ─────────────────────────────────────────────
.ritp-fade-enter-active,
.ritp-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.ritp-fade-enter-from,
.ritp-fade-leave-to     { opacity: 0; transform: translateY(-2px); }
</style>

<!-- ─────────────────────────────────────────────
     GLOBAL — dark-mode & NuxtUI portal corrections
────────────────────────────────────────────── -->
<style lang="scss">
// Dark mode segment fix
.dark .ritp__input {
  :deep([role="group"]) {
    background: rgba(19, 19, 26, 0.72) !important;
  }

  :deep([data-type]:not([data-type="literal"])) {
    color: var(--c-muted) !important;
    &[data-focused] { color: var(--c-accent) !important; }
  }
}
</style>