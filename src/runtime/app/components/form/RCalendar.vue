<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

interface Props {
  modelValue?: CalendarDate | null
  minValue?: CalendarDate
  maxValue?: CalendarDate
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [CalendarDate | null]
}>()

const value = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const ui = {
  root: 'rcalendar',
  header: 'rcalendar-header',
  heading: 'rcalendar-heading',

  cellTrigger: [
    'size-9',
    'rounded-xl',
    'transition-colors'
  ]
}
</script>

<template>
  <UCalendar
    v-model="value"
    :min-value="minValue"
    :max-value="maxValue"
    :ui="ui"
  >
    <template #content="slotProps">
       <div class="flex items-center justify-between px-2">
                            <div class="flex gap-1">
                              <UButton
                                icon="i-heroicons-chevron-double-left"
                                variant="ghost"
                                @click="slotProps.goToPreviousPage"
                              />

                              <UButton
                                icon="i-heroicons-chevron-left"
                                variant="ghost"
                                @click="slotProps.previousPage"
                              />
                            </div>

                            <span class="font-semibold">
                              {{ date }}
                            </span>

                            <div class="flex gap-1">
                              <UButton
                                icon="i-heroicons-chevron-right"
                                variant="ghost"
                                @click="slotProps.nextPage"
                              />

                              <UButton
                                icon="i-heroicons-chevron-double-right"
                                variant="ghost"
                                @click="slotProps.goToNextPage"
                              />
                            </div>
                          </div>

      <slot v-bind="slotProps" />
    </template>
  </UCalendar>
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