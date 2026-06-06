<script setup lang="ts">
// RForm — base form wrapper with schema validation
import { ref, provide } from 'vue'

const props = withDefaults(defineProps<{
  modelValue:   Record<string, unknown>
  loading?:     boolean
  disabled?:    boolean
  cols?:        1 | 2 | 3 | 4
}>(), {
  cols: 1,
})

const emit = defineEmits<{
  'update:modelValue': [val: Record<string, unknown>]
  submit:  [val: Record<string, unknown>]
  cancel:  []
  reset:   []
}>()

const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

// Provide form context to children
provide('rForm', {
  modelValue: () => props.modelValue,
  errors,
  touched,
  loading:  () => props.loading,
  disabled: () => props.disabled,
  updateField(key: string, value: unknown) {
    emit('update:modelValue', { ...props.modelValue, [key]: value })
  },
  setError(key: string, msg: string) {
    errors.value[key] = msg
  },
  clearError(key: string) {
    delete errors.value[key]
  },
  touch(key: string) {
    touched.value[key] = true
  },
})

function handleSubmit(e: Event) {
  e.preventDefault()
  emit('submit', props.modelValue)
}
</script>

<template>
  <form class="r-form" novalidate @submit="handleSubmit">
    <div :class="['r-form__grid', `r-form__grid--cols-${cols}`]">
      <slot />
    </div>
  </form>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_mixin' as *;

.r-form {
  width: 100%;

  &__grid {
    display: grid;
    gap: var(--space-4);

    &--cols-1 { grid-template-columns: 1fr; }
    &--cols-2 { grid-template-columns: repeat(2, 1fr); }
    &--cols-3 { grid-template-columns: repeat(3, 1fr); }
    &--cols-4 { grid-template-columns: repeat(4, 1fr); }

    @include mobile-only {
      grid-template-columns: 1fr !important;
    }
    @include tablet-only {
      &--cols-3, &--cols-4 { grid-template-columns: repeat(2, 1fr); }
    }
  }
}
</style>
