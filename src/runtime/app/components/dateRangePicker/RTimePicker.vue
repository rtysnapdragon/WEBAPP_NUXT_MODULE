<template>
  <div class="rtp" :class="$attrs.class" :style="$attrs.style">
    <VCalendarDatePicker
      v-model="date"
      v-bind="pickerBind($attrs)"
      mode="time"
      :hide-time-header="true"
      :is24hr="is24hr"
      :update-on-input="false"
      :min-date="minDate"
      :max-date="maxDate"
      :popover="popover"
    >
      <template #default="{ inputValue, inputEvents }">
        <div class="rtp-field">
          <input
            ref="input_time"
            :value="inputValue"
            v-on="inputEvents"
            :class="['rtp-input', ui]"
            :placeholder="placeholder"
            :autofocus="false"
            @focus="onFocus"
          />

          <button
            v-if="showClear && hasValue"
            type="button"
            class="rtp-clear"
            aria-label="Clear"
            @click.stop="onClear"
          >
            <i class="ri-close-line" />
          </button>

          <span class="rtp-icon"><i class="ri-calendar-schedule-line" /></span>
        </div>
      </template>
    </VCalendarDatePicker>
  </div>
</template>

<script setup>
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'
import { ref, computed, watch } from 'vue'

// class/style go to our root; everything else is forwarded to v-calendar (see pickerBind).
defineOptions({ inheritAttrs: false })

// defineModel() already declares `modelValue` — it was also declared in defineProps (duplicate).
const date = defineModel()

const props = defineProps({
  attrs:       Object,                          // extra v-calendar attrs
  is24hr:      Boolean,
  showClear:   Boolean,
  placeholder: { type: String, default: '' },
  minDate:     null,                            // were declared but never passed to the picker
  maxDate:     null,
  ui:          null,                            // extra class string for the <input>
  // legacy no-ops
  hideTimeHeader: Boolean,
  format:         String,
})

const emit = defineEmits(['close', 'clear'])

const input_time = ref(null)
const popover = { visibility: 'focus', placement: 'bottom', autoHide: true }

const hasValue = computed(() => date.value !== null && date.value !== undefined && date.value !== '')

// 'HH:mm:ss' string → Date. Now a watcher (immediate), so it also covers values set after mount.
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/

function convertTimeToDate(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, seconds, 0)
  return d
}

watch(date, (v) => {
  if (typeof v === 'string' && TIME_RE.test(v)) date.value = convertTimeToDate(v)
}, { immediate: true })

function onFocus() {
  if (!hasValue.value) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    date.value = d
  }
}

function onClear() {
  date.value = null
  emit('clear')
}

const baseAttrs = computed(() => ({
  transparent: true,
  borderless: true,
  color: 'primary',
  'first-day-of-week': 2,
  ...props.attrs,
  'is-dark': {
    selector: 'html',
    darkClass: 'dark',
    ...props.attrs?.['is-dark'],
  },
}))

function pickerBind(a) {
  const { class: _c, style: _s, ...rest } = a
  return { ...baseAttrs.value, ...rest }
}

// was `defineExpose(input_time.value)` → exposed `null` (value read once at setup)
defineExpose({ inputRef: input_time })
</script>

<!--
  GLOBAL (non-scoped), namespaced .rtp-*. The old scoped `.vc-*` rules never reached
  v-calendar's DOM (dead code) and are dropped — the time popover theme (.vc-time-*) lives in
  RDatePicker's global block. If a page uses RTimePicker alone, move that block to a global
  stylesheet so it always loads.
-->
<style lang="scss">
.rtp-field { position: relative; }

// Matches RInput / RDatePicker
.rtp-input {
  display: block;
  width: 100%;
  height: 38px;
  padding-block: 0;
  padding-inline: 12px 40px; // calendar icon
  font-family: var(--font-400);
  font-size: 13px;
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
}

.rtp-field:has(.rtp-clear) .rtp-input { padding-inline-end: 64px; }

.rtp-icon {
  position: absolute;
  top: 50%;
  inset-inline-end: 12px;
  transform: translateY(-50%);
  font-size: 16px;
  color: var(--c-muted);
  pointer-events: none;
}

.rtp-clear {
  position: absolute;
  top: 50%;
  inset-inline-end: 36px;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 14px;
  color: var(--c-muted);
  background: transparent;
  border: 0;
  border-radius: var(--r-full);
  cursor: pointer;
  transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);

  &:hover {
    background: color-mix(in srgb, var(--c-accent) 10%, transparent);
    color: var(--c-accent);
  }
}
</style>