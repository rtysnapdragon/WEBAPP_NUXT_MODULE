<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { computed } from 'vue'
interface Props {
  modelValue?: CalendarDate | null
  minValue?: CalendarDate
  maxValue?: CalendarDate
  ui?: null | Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  ui: null,
})

const emit = defineEmits<{
  'update:modelValue': [CalendarDate | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const defaultUI = {
  root: 'rcalendar rdp-calendar border-4 border-red-500 bg-transparent',
  header: 'rcalendar-header mb-4 bg-yellow-200',
  heading: 'rcalendar-heading font-semibold text-[12px] text-red-500 text-xl',
  grid: 'rcalendar-grid w-full border-collapse select-none space-y-1 focus:outline-none',
  gridRow: 'rcalendar-grid-row grid grid-cols-7 place-items-center',
  gridWeekDaysRow: 'rcalendar-grid-week-days-row mb-4 grid w-full grid-cols-7',
  gridBody: 'rcalendar-grid-body grid',
  headCellWeek: 'text-xs text-muted',
  cellWeek: 'relative text-center text-muted',
  cell: 'relative text-center',
  cellTrigger: [
    'rdp-calendar-day',
    'size-9',
    'rounded-xl',
    'transition-all',
    'hover:bg-primary-50',
    'data-[selected]:bg-primary',
    'data-[selected]:text-white',
    'transition-colors'
  ],
  prevButton: 'rounded-xl border border-[var(--c-border)]',
  nextButton: 'rounded-xl border border-[var(--c-border)]',
  prev: 'rounded-xl bg-black-500 border',
  next: 'rounded-xl border'
}

// const ui  = {
//   ...(props.ui) , ...defaultUI
// }
const mergedUi = computed(() => ({
  ...defaultUI,
  ...(props.ui ?? {}),
}))
</script>

<template>
  <UCalendar
    v-model="value"
    :min-value="minValue"
    :max-value="maxValue"
    :ui="mergedUi"
  />
</template>

<style scoped lang="scss">
.rcalendar {
  background: var(--c-surface);
  border-radius: 16px;
}
</style>

<style scoped lang="scss">
.rcalendar {
  :deep(button[aria-label*="Previous"]),
  :deep(button[aria-label*="Next"]) {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;

    border-radius: 8px;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
  }

  :deep(button[aria-label*="Previous"]:hover),
  :deep(button[aria-label*="Next"]:hover) {
    background: var(--c-primary-50);
  }
}
</style>
