<script setup>
import { computed } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { defu } from 'defu'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  ui: {type: Object, default: {}},
  placeholder: String
})

const modelValue = defineModel('data', {default: null,})

const inputDate = useTemplateRef('inputDate')

const defaultUi = {
  root: 'w-full',
  base: [
    'rounded-[14px]',
    'border',
    'transition-all duration-200',
    'bg-[var(--c-surface)]',
    'text-[var(--c-text)]',
    'border-[var(--c-border)]',
    'focus-within:border-[var(--c-accent)]',
    'focus-within:ring-2',
    'focus-within:ring-[color:var(--c-accent)]/20'
  ]
}

const mergedUi = computed(() =>
  defu(props.ui ?? {}, defaultUi)
)

const calendarUi = {
  cellTrigger: [
    'rounded-xl',
    'transition-all duration-150'
  ]
}
</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="modelValue"
    :ui="mergedUi"
    :placeholder="placeholder"
    v-bind="$attrs"
  >
    <template #trailing>
      <UPopover :reference="inputDate?.inputsRef?.[3]?.$el">
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-calendar"
          aria-label="Select date"
          class="
            text-[var(--c-accent)]
            hover:bg-[var(--c-border)]
            rounded-xl
          "
        />

        <template #content>
          <div class="r-date-picker-calendar">
            <UCalendar
              v-model="modelValue"
              :ui="calendarUi"
              class="p-3"
            />
          </div>
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>

<style scoped lang="scss">
.r-date-picker-calendar {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;

  backdrop-filter: var(--glass-blur-sm);
  box-shadow: var(--glass-shadow);

  :deep(button[data-selected]) {
    background: var(--c-accent);
    color: white;
    box-shadow: var(--glow-accent-sm);
  }

  :deep(button[data-today]) {
    border: 1px solid var(--c-accent);
  }

  :deep(button:hover) {
    background: color-mix(
      in srgb,
      var(--c-accent) 12%,
      transparent
    );
  }

  :deep(.text-muted) {
    color: var(--c-muted);
  }
}
</style>