<script setup lang="ts">
// RDatePicker — SARIKA reusable single date picker
// Built on NuxtUI v4: UInputDate + UPopover + UCalendar
// v-model: CalendarDate | null
// Props: size, label, hint, error, required, clearable, disabled, placeholder, ui (passthrough)

import { shallowRef, computed, watch, useTemplateRef } from 'vue'
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date'
import { useI18n } from 'vue-i18n'

// ── Props ──────────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue?:    CalendarDate | null
  label?:         string
  labelKm?:       string
  placeholder?:   string
  placeholderKm?: string
  hint?:          string
  error?:         string
  size?:          'xs' | 'sm' | 'md' | 'lg' | 'xl'
  required?:      boolean
  disabled?:      boolean
  clearable?:     boolean
  readonly?:      boolean
  minValue?:      CalendarDate
  maxValue?:      CalendarDate
  // NuxtUI ui slot passthrough — merged on top of SARIKA defaults
  ui?:            Record<string, unknown>
}>(), {
  size:      'md',
  clearable: true,
})

// ── Emits ──────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  'update:modelValue': [val: CalendarDate | null]
  change:              [val: CalendarDate | null]
  clear:               []
  blur:                []
}>()

// ── Refs / i18n ────────────────────────────────────────────────────────────
// ── Use shallowRef + proper sync (this is the key fix) ─────────────────────
const inputRef = useTemplateRef<InstanceType<any>>('inputDateRef')
const { locale } = useI18n()

// ── Internal model ─────────────────────────────────────────────────────────
// shallowRef holds the object reference as-is
const internal = shallowRef<CalendarDate | null>(props.modelValue ?? null)

watch(() => props.modelValue, v => { internal.value = v ?? null },{ immediate: true })
watch(internal, v => {
  emit('update:modelValue', v)
  emit('change', v)
}, { flush: 'sync' } ) // important for date components

// ── Helpers ────────────────────────────────────────────────────────────────
// const now = () => today(getLocalTimeZone())
const now = () => process.client ? today(getLocalTimeZone()) : null //SSR Safety — wrap any date logic that might run on server if needed:

function setToday() {
  internal.value = now()
}

function clearValue() {
  internal.value = null
  emit('clear')
}

const displayLabel = computed(() =>
  locale.value === 'km' && props.labelKm ? props.labelKm : props.label
)

const displayPlaceholder = computed(() =>
  locale.value === 'km' && props.placeholderKm
    ? props.placeholderKm
    : (props.placeholder ?? 'Select a date')
)

// ── Formatted display string (shown below input when date is selected) ─────
const formattedDate = computed(() => {
  if (!internal.value) return null
  const d = internal.value
  const date = new Date(d.year, d.month - 1, d.day)
  return date.toLocaleDateString(locale.value === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
  })
})

// ── NuxtUI ui passthrough ─────────────────────────────────────────────────
// SARIKA defaults merged with any consumer overrides
const mergedUi = computed(() => ({
  root: 'rdp-s__root',
  ...( props.ui ?? {} ),
}))
</script>

<template>
  <div
    :class="[
      'rdp-s',
      `rdp-s--${size}`,
      {
        'rdp-s--disabled': disabled,
        'rdp-s--error':    !!error,
        'rdp-s--readonly': readonly,
        'rdp-s--filled':   !!internal,
      },
    ]"
  >
    <!-- ── Label ─────────────────────────────────────────── -->
    <div v-if="displayLabel || hint" class="rdp-s__label-row">
      <label v-if="displayLabel" class="rdp-s__label">
        {{ displayLabel }}
        <span v-if="required" class="rdp-s__required" aria-hidden="true">*</span>
      </label>
      <span v-if="hint && !error" class="rdp-s__hint">{{ hint }}</span>
    </div>

    <!-- ── Input + Popover ───────────────────────────────── -->
    <div class="rdp-s__field">
      <UInputDate
        ref="inputDateRef"
        v-model="internal"
        :default-value="internal.value"
        :placeholder="displayPlaceholder"
        :disabled="disabled"
        :readonly="readonly"
        :min-value="minValue"
        :max-value="maxValue"
        :ui="mergedUi"
        class="rdp-s__input-date"
        @blur="emit('blur')"
      >
        <template #trailing>
          <div class="rdp-s__trailing">

            <!-- Clear btn -->
            <Transition name="rdp-s-fade">
              <button
                v-if="clearable && internal"
                type="button"
                class="rdp-s__clear"
                aria-label="Clear date"
                tabindex="-1"
                @click.stop="clearValue"
              >
                <UIcon name="i-lucide-x" />
              </button>
            </Transition>

            <!-- Popover trigger -->
            <UPopover
              :reference="inputRef?.inputsRef?.[3]?.$el"
              :ui="{ content: 'rdp-s-popover' }"
            >
              <button
                type="button"
                :disabled="disabled || readonly"
                :class="['rdp-s__trigger', { 'rdp-s__trigger--active': !!internal }]"
                aria-label="Open calendar"
              >
                <UIcon name="i-lucide-calendar" class="rdp-s__trigger-icon" />
              </button>

              <!-- ── Popover content ── -->
              <template #content>
                <div class="rdp-s-popover__inner">

                  <!-- Quick actions -->
                  <div class="rdp-s-popover__quick">
                    <button type="button" class="rdp-s-popover__quick-btn" @click="setToday">
                      <UIcon name="i-lucide-calendar-check" />
                      {{ locale === 'km' ? 'ថ្ងៃនេះ' : 'Today' }}
                    </button>
                    <button
                      v-if="internal"
                      type="button"
                      class="rdp-s-popover__quick-btn rdp-s-popover__quick-btn--danger"
                      @click="clearValue"
                    >
                      <UIcon name="i-lucide-trash-2" />
                      {{ locale === 'km' ? 'លុបចោល' : 'Clear' }}
                    </button>
                  </div>

                  <!-- Divider -->
                  <div class="rdp-s-popover__sep" />

                  <!-- Calendar -->
                  <UCalendar
                    v-model="internal"
                    :min-value="minValue"
                    :max-value="maxValue"
                    class="rdp-s-popover__cal"
                  />

                  <!-- Footer -->
                  <div class="rdp-s-popover__footer">
                    <div class="rdp-s-popover__selected">
                      <UIcon
                        :name="internal ? 'i-lucide-check-circle-2' : 'i-lucide-calendar'"
                        :class="internal ? 'rdp-s-popover__selected-icon--ok' : 'rdp-s-popover__selected-icon--muted'"
                        class="rdp-s-popover__selected-icon"
                      />
                      <span>
                        {{ formattedDate ?? (locale === 'km' ? 'មិនទាន់ជ្រើស' : 'No date selected') }}
                      </span>
                    </div>
                  </div>

                </div>
              </template>
            </UPopover>

          </div>
        </template>
      </UInputDate>
    </div>

    <!-- ── Error ──────────────────────────────────────────── -->
    <Transition name="rdp-s-fade">
      <p v-if="error" class="rdp-s__error" role="alert">
        <UIcon name="i-lucide-alert-circle" />
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>

// ─────────────────────────────────────────────
// HOST
// ─────────────────────────────────────────────
.rdp-s {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2);
  font-family:    var(--font-fallback);

  // Size scale applied to font
  &--xs  { font-size: 0.72rem; }
  &--sm  { font-size: 0.8rem;  }
  &--md  { font-size: 0.875rem;}
  &--lg  { font-size: 0.95rem; }
  &--xl  { font-size: 1rem;    }

  &--disabled { opacity: 0.5; pointer-events: none; }
  &--readonly { cursor: default; }

  // Error ring on the input
  &--error {
    .rdp-s__input-date :deep(input) {
      border-color: var(--c-danger) !important;
      &:focus {
        box-shadow: 0 0 0 3px rgba(248,113,113,0.12) !important;
      }
    }
  }
}

// ─────────────────────────────────────────────
// LABEL ROW
// ─────────────────────────────────────────────
.rdp-s__label-row {
  display:         flex;
  align-items:     baseline;
  justify-content: space-between;
  gap:             var(--space-2);
}

.rdp-s__label {
  font-size:   0.82rem;
  font-weight: 500;
  color:       var(--c-text);
  display:     flex;
  gap:         4px;
  align-items: baseline;
}

.rdp-s__required { color: var(--c-danger); font-size: 0.9em; }
.rdp-s__hint     { font-size: 0.72rem; color: var(--c-muted); }

// ─────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────
.rdp-s__error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   0.75rem;
  color:       var(--c-danger);
  margin:      0;
}

// ─────────────────────────────────────────────
// FIELD + NUXTUI OVERRIDE
// ─────────────────────────────────────────────
.rdp-s__field { position: relative; }

.rdp-s__input-date {
  width: 100%;

  // Override NuxtUI UInputDate internals with SARIKA tokens
  :deep(input) {
    font-family:   var(--font-fallback) !important;
    color:         var(--c-text) !important;
    background:    var(--c-surface) !important;
    border-color:  var(--c-border) !important;
    border-radius: var(--radius-md) !important;
    @include transition(fast);

    &::placeholder { color: var(--c-muted) !important; opacity: 1; }

    &:focus, &:focus-within {
      border-color: var(--c-accent) !important;
      box-shadow:   0 0 0 3px rgba(255,140,66,0.12) !important;
      outline:      none !important;
    }
  }

  // Segment spinner arrows (year/month/day segments)
  :deep([data-type]) {
    font-family: var(--font-fallback) !important;
    color:       var(--c-text) !important;
    @include transition(fast);

    &:focus, &[data-focused] {
      background: rgba(255,140,66,0.12) !important;
      color:      var(--c-accent) !important;
      border-radius: var(--radius-sm) !important;
      outline: none !important;
    }
  }

  // Literal separators (/, -)
  :deep([data-type="literal"]) {
    color: var(--c-muted) !important;
    user-select: none;
  }
}

// ─────────────────────────────────────────────
// TRAILING SLOT
// ─────────────────────────────────────────────
.rdp-s__trailing {
  display:     flex;
  align-items: center;
  gap:         2px;
  padding-right: 2px;
}

// Clear ×
.rdp-s__clear {
  width:         20px;
  height:        20px;
  border:        none;
  border-radius: 50%;
  background:    rgba(248,113,113,0.1);
  color:         var(--c-danger);
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  font-size:     0.7rem;
  flex-shrink:   0;
  padding:       0;

  &:hover { background: rgba(248,113,113,0.2); }
}

// Calendar trigger button
.rdp-s__trigger {
  width:         30px;
  height:        30px;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-md);
  background:    transparent;
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  padding:       0;
  flex-shrink:   0;

  &:hover, &--active {
    border-color: var(--c-accent);
    background:   rgba(255,140,66,0.08);

    .rdp-s__trigger-icon { color: var(--c-accent); }
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.rdp-s__trigger-icon {
  font-size: 0.95rem;
  color:     var(--c-muted);
  @include transition(fast);
}

// Fade transition
.rdp-s-fade-enter-active,
.rdp-s-fade-leave-active { transition: opacity 0.15s ease; }
.rdp-s-fade-enter-from,
.rdp-s-fade-leave-to     { opacity: 0; }
</style>
