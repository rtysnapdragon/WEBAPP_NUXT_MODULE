<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { defu } from 'defu'
import { computed } from 'vue'
interface Props {
  modelValue?: CalendarDate | null
  minValue?: CalendarDate
  maxValue?: CalendarDate
  ui?: null | Record<string, unknown>
  range?: boolean
  numberOfMonths?: number
}

const props = withDefaults(defineProps<Props>(), {
  ui: null,
  range: false,
  numberOfMonths: 1,
})

const emit = defineEmits<{
  'update:modelValue': [CalendarDate | null]
  'select':[CalendarDate | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

function onUpdate(value: CalendarDate) {
  emit('update:modelValue', value)
  emit('select', value)
}
const defaultUI = {
  root: 'rcalendar rdp-calendar p-2 border-4 border-red-500 bg-transparent',
  header: 'rcalendar-header mb-4 bg-yellow-200',
  heading: 'rcalendar-heading font-semibold text-[12px] text-red-500',
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
    'rounded-full',
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
// const mergedUi = computed(() => ({
//   ...defaultUI,
//   ...(props.ui ?? {}),
// }))

const mergedUi = computed(() =>
  defu(props.ui ?? {}, defaultUI)
)
</script>

<template>
  <UCalendar
    v-model="value"
    :min-value="minValue"
    :max-value="maxValue"
    :range="range"
    :number-of-months="numberOfMonths"
    :ui="mergedUi"
    @update:model-value="onUpdate"
  />
<!-- 
  <UCalendar
  :model-value="modelValue"
  :min-value="minValue"
  :max-value="maxValue"
  :range="range"
  :number-of-months="numberOfMonths"
  :ui="mergedUi"
  @update:model-value="onUpdate"
/> -->
</template>


<style scoped lang="scss">
.rcalendar {
  background: var(--c-surface);
  // border-radius: 16px;
}
.rcalendar {
  :deep([data-slot="prev-button"]),
  :deep([data-slot="next-button"]) {
    width: 22px !important;
    height: 22px !important;
  // }
  // :deep(button[aria-label*="Previous"]),
  // :deep(button[aria-label*="Next"]) {
    // width: 22px !important;
    // height: 22px !important;
    min-width: 22px !important;
    padding: 0 !important;
    display:flex;
    justify-content: center;
    align-items: center;
    gap:4px;

    margin: 10px 0 !important;
    border-radius: 8px;
    background: var(--c-surface);
    // border: 0.5px solid var(--c-border);
  }

  :deep(button[aria-label*="Previous"]:hover),
  :deep(button[aria-label*="Next"]:hover) {
    background: var(--c-primary-50);
  }
}


// .calendar-nav-btn {
//   width: 32px;
//   height: 32px;
//   padding: 0;
// }

// .calendar-header {
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 4px;
// }


.rdp-calendar {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 15px;
  margin: 10px;
}

.rdp-calendar-day {
  width: 36px;
  height: 36px;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
