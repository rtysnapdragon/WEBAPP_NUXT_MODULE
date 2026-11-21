<template>
  <div class="ui-rdp-root w-full" :class="$attrs.class" :style="$attrs.style">
    <!-- ── Range ── -->
    <VDatePicker
      v-if="dateRangePicker"
      ref="refDatePicker"
      v-model="date"
      is-range
      :columns="pickerColumns"
      v-bind="pickerBind($attrs)"
      :attributes="attributes"
      :min-date="minDate"
      :max-date="maxDate"
      :masks="pickerMasks"
      :popover="popover"
    >
      <!-- no default slot when `predefined` → renders the calendar inline -->
      <template v-if="!predefined" #default="{ togglePopover, inputValue }">
        <UInput
          ref="refInput"
          readonly
          :model-value="rangeText(inputValue)"
          :disabled="disabled"
          :placeholder="placeholder"
          :ui="inputUi"
          size="xs"
          icon="ri-calendar-schedule-line"
          trailing
          autocomplete="off"
          @click="togglePopover"
        />
      </template>
    </VDatePicker>

    <!-- ── Single / time / dateTime ── -->
    <VDatePicker
      v-else
      ref="refDatePicker"
      v-model="date"
      v-bind="pickerBind($attrs)"
      :mode="mode"
      :hide-time-header="false"
      :attributes="attributes"
      :min-date="minDate"
      :max-date="maxDate"
      :masks="pickerMasks"
      :popover="popover"
      :is24hr="is24hr"
      is-required
    >
      <template #default="{ inputValue, inputEvents }">
        <UInput
          ref="refInput"
          :model-value="inputValue"
          v-on="inputEvents"
          :disabled="disabled"
          :placeholder="placeholder"
          :ui="inputUi"
          size="xs"
          icon="ri-calendar-schedule-line"
          trailing
          autocomplete="off"
          @focus="onFocus"
          @input="onInput"
        />
      </template>
    </VDatePicker>
  </div>
</template>

<script setup>
import { DatePicker as VDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { computed, ref, watch, unref, onBeforeUnmount } from 'vue'
import { useScreens } from 'vue-screen-utils'

// class/style go to our root; everything else is forwarded to v-calendar (see pickerBind).
defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue:      null,
  attrs:           Object,   // extra v-calendar attrs, merged over the defaults
  mode:            String,   // date | time | dateTime
  attributes:      Object,
  placeholder:     null,
  dateRangePicker: Boolean,
  minDate:         null,
  maxDate:         null,
  masks:           null,
  ui:              null,     // Nuxt UI 4 UInput slots: { root, base, leadingIcon, trailingIcon }
  disabled:        Boolean,
  is24hr:          Boolean,
  columns:         null,
  predefined:      Boolean,
  // legacy no-ops, kept so existing callers don't leak them into v-calendar
  hideTimeHeader:  Boolean,
  format:          String,
  label:           null,
  variant:         String,
})

const emit = defineEmits(['update:modelValue', 'close'])

const refDatePicker = ref()
const refInput = ref()

// UInput v4 exposes `inputRef` (the <input>) — the old v2 `onBlur()` / `.input` are gone.
const inputEl = () => unref(refInput.value?.inputRef)

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('close')
  },
})

// ── v-calendar config ──
const baseAttrs = computed(() => ({
  transparent: true,
  borderless: true,
  color: 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
  ...props.attrs,
}))

function pickerBind(a) {
  const { class: _c, style: _s, ...rest } = a
  return { ...baseAttrs.value, ...rest }
}

const popover = { visibility: 'click', placement: 'bottom' }

// v-calendar tokens (DD / YYYY) — not date-fns ones (dd / yyyy). Caller's `masks` wins.
const pickerMasks = computed(() => {
  if (props.masks) return props.masks
  switch (props.mode) {
    case 'time':     return { input: 'HH:mm:ss' }
    case 'dateTime': return { input: 'MMM DD, YYYY HH:mm:ss' }
    default:         return { input: 'MMM DD, YYYY' }
  }
})

const { mapCurrent } = useScreens({ xs: '0px', sm: '640px', md: '768px', lg: '1024px' })
const pickerColumns = mapCurrent(
  isNotEmpty(props.columns) ? props.columns : { lg: 2, md: 2, sm: 2 },
  1,
)

const dateRangePicker = computed(() => props.dateRangePicker)

const rangeText = (iv) =>
  isNotEmpty(iv?.start) && isNotEmpty(iv?.end) ? `${iv.start} - ${iv.end}` : ''

// ── UInput v4 ui: hook classes per slot, caller's `ui` appended (strings/arrays only) ──
function mergeSlots(base, user = {}) {
  return Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(user || {})])].map((k) => [
      k,
      [base[k], user?.[k]].flat().filter((v) => typeof v === 'string' && v).join(' '),
    ]),
  )
}

const inputUi = computed(() => mergeSlots({
  root:         'ui-rdp-input-root relative w-full',
  base:         'ui-rdp-input',
  leadingIcon:  'ui-rdp-icon',
  trailingIcon: 'ui-rdp-icon',
}, props.ui))

// ── Behaviour ──
function getZeroTimeDate() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function onFocus() {
  if ((date.value == null || date.value === '') && props.mode === 'time') {
    date.value = getZeroTimeDate()
  }
}

// Cleared input → reset after 1s. Any further typing cancels the pending reset
// (previously only the *empty* branch cleared the timer, so retyping got wiped).
let timeout
function onInput(e) {
  clearTimeout(timeout)
  const val = e?.target?.value
  if (val === '' || val == null) timeout = setTimeout(fnReset, 1000)
}
onBeforeUnmount(() => clearTimeout(timeout))

watch(date, (n) => {
  if (dateRangePicker.value) {
    if (n?.end) {
      refDatePicker.value?.updateValue(n)
      inputEl()?.blur()
    }
  } else if (n) {
    inputEl()?.blur()
  } else if (n == null || n === '') {
    refDatePicker.value?.updateValue(n)
  }
}, { deep: true })

function datePicker() {
  return refDatePicker.value
}

function fnReset() {
  date.value = ''
  refDatePicker.value?.updateValue('')
  setTimeout(() => {
    const el = inputEl()
    if (el) el.value = ''
  }, 100)
}

defineExpose({ datePicker, fnReset })
</script>

<!--
  GLOBAL (non-scoped): the real <input> lives inside UInput and the calendar popover is
  v-calendar's own DOM, so scoped CSS can't reach either. No !important on our own input
  (Tailwind 4 utilities are in @layer, unlayered CSS wins); `!important` is kept only where we
  fight v-calendar's own *unlayered* stylesheet.
-->
<style lang="scss">
// ── Input (matches RInput) ──
.ui-rdp-input {
  width: 100%;
  height: 38px;
  padding-block: 0;
  padding-inline: 12px 40px; // trailing icon
  font-family: var(--font-400);
  font-size: 13px;
  font-weight: var(--font-medium);
  line-height: 18px;
  letter-spacing: 0.5px;
  text-align: left;
  color: var(--c-text);
  background: transparent;
  border: 1px solid var(--color-w-b-4);
  border-radius: var(--r-md);
  box-shadow: none;
  outline: none;
  transition: border-color var(--t-fast) var(--ease-in-out), box-shadow var(--t-fast) var(--ease-in-out);

  &:focus,
  &:focus-visible {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 12%, transparent);
  }

  &::placeholder { font-size: 12px; color: var(--c-muted); }
  &[readonly] { cursor: pointer; }

  &:disabled {
    background: var(--bg-tertiary);
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.ui-rdp-icon {
  font-size: 16px;
  color: var(--c-muted);
}

// ── v-calendar popover / panel ──
.vc-popover-content-wrapper { z-index: 999 !important; }

.vc-date-picker-content,
.vc-popover-content {
  background-color: var(--bg-content) !important;
  border: 1px solid var(--color-w-b-4) !important;
}

.vc-header .vc-arrow:hover { background: var(--vc-day-content-hover-bg) !important; }

.vc-nav-title:hover,
.vc-nav-arrow:hover,
.vc-nav-item:hover { background-color: var(--vc-day-content-hover-bg); }

.vc-focus:focus-within {
  outline: 0;
  box-shadow: none !important;
}

.vc-pane-layout > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(1px * var(--tw-divide-x-reverse));
  border-left-width: calc(1px * calc(1 - var(--tw-divide-x-reverse)));
  border-color: var(--color-w-b-4) !important;
}

// ── v-calendar time picker (shared with RTimePicker's popover) ──
.vc-time-picker {
  padding: 8px 9px;

  > * + * { margin-top: 0 !important; }

  .vc-time-header { display: none !important; }
}

.vc-time-select-group {
  padding: 0 5px;
  background: var(--bg-content) !important;

  svg { width: 25px; height: 30px; }

  select {
    padding: 0 9px;
    background: var(--bg-content) !important;
  }
}

.vc-base-select {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 10px;

  select.vc-align-right { text-align: center; }
  .vc-focus { font-size: 15px; } // select dropdown
}
</style>