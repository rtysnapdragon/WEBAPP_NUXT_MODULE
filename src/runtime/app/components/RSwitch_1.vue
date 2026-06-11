<script setup lang="ts">
import { computed } from 'vue'
import { defu } from 'defu'

interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
  loading?: boolean

  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  checkedIcon?: string
  uncheckedIcon?: string

  ui?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  checkedIcon: 'i-lucide-check',
  uncheckedIcon: 'i-lucide-x'
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const mergedUi = computed(() =>
  defu(props.ui ?? {}, {
    root: 'items-start',
    base: `
      data-[state=checked]:bg-[var(--c-accent)]
      data-[state=unchecked]:bg-[var(--color-w-b-6)]
      border
      border-[var(--c-border)]
      transition-all
      duration-200
    `,
    thumb: `
      bg-white
      shadow-sm
    `,
    wrapper: 'gap-2',
    label: `
      text-[var(--c-text)]
      font-medium
    `,
    description: `
      text-[var(--c-muted)]
      text-sm
    `
  })
)
</script>

<template>
  <USwitch
    v-model="model"
    :label="label"
    :description="description"
    :disabled="disabled"
    :loading="loading"
    :size="size"
    :checked-icon="checkedIcon"
    :unchecked-icon="uncheckedIcon"
    :ui="mergedUi"
  />
</template>