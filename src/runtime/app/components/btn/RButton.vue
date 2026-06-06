<script setup lang="ts">
// RButton — SARIKA reusable button
// Props: variant, size, icon, loading, disabled, block
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?:  'solid' | 'outline' | 'ghost' | 'soft' | 'danger'
  size?:     'xs' | 'sm' | 'md' | 'lg'
  icon?:     string
  iconRight?: string
  loading?:  boolean
  disabled?: boolean
  block?:    boolean
  type?:     'button' | 'submit' | 'reset'
}>(), {
  variant: 'solid',
  size:    'md',
  type:    'button',
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const cls = computed(() => [
  'r-btn',
  `r-btn--${props.variant}`,
  `r-btn--${props.size}`,
  { 'r-btn--block': props.block },
  { 'r-btn--loading': props.loading },
])
</script>

<template>
  <button
    :class="cls"
    :type="type"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <!-- Left icon or spinner -->
    <span v-if="loading" class="r-btn__spinner" aria-hidden="true">
      <UIcon name="i-lucide-loader-2" class="animate-spin" />
    </span>
    <UIcon v-else-if="icon" :name="icon" class="r-btn__icon" />

    <!-- Slot -->
    <span v-if="$slots.default" class="r-btn__label">
      <slot />
    </span>

    <!-- Right icon -->
    <UIcon v-if="iconRight && !loading" :name="iconRight" class="r-btn__icon r-btn__icon--right" />
  </button>
</template>

<style lang="scss" scoped>
// @use '../../assets/styles/mixin' as *;
// @use '~/assets/styles/_mixin' as *;
.r-btn {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  gap:             var(--space-2);
  font-family:     var(--font-fallback);
  font-weight:     500;
  border:          1px solid transparent;
  border-radius:   var(--radius-md);
  cursor:          pointer;
  white-space:     nowrap;
  @include transition(fast);
  @include focus-ring;

  &--block { width: 100%; }

  /* ── Sizes ── */
  &--xs  { padding: 4px 10px;  font-size: 0.72rem; }
  &--sm  { padding: 6px 14px;  font-size: 0.8rem;  }
  &--md  { padding: 8px 18px;  font-size: 0.875rem;}
  &--lg  { padding: 11px 24px; font-size: 1rem;    }

  /* ── Variants ── */
  &--solid {
    background: var(--c-accent);
    color:      #fff;
    border-color: var(--c-accent);
    &:hover:not(:disabled) {
      background: var(--c-accent-2);
      box-shadow: var(--glow-accent-sm);
    }
  }

  &--outline {
    background:   transparent;
    color:        var(--c-accent);
    border-color: var(--c-accent);
    &:hover:not(:disabled) {
      background: rgba(255,140,66,0.08);
    }
  }

  &--ghost {
    background: transparent;
    color:      var(--c-text);
    &:hover:not(:disabled) {
      background: rgba(255,140,66,0.08);
      color:      var(--c-accent);
    }
  }

  &--soft {
    background:   rgba(255,140,66,0.12);
    color:        var(--c-accent);
    border-color: transparent;
    &:hover:not(:disabled) {
      background: rgba(255,140,66,0.2);
    }
  }

  &--danger {
    background: var(--c-danger);
    color:      #fff;
    border-color: var(--c-danger);
    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }

  &:disabled, &--loading {
    opacity: 0.55;
    cursor:  not-allowed;
  }

  &__icon { font-size: 1em; flex-shrink: 0; }
  &__icon--right { margin-left: auto; }
  &__spinner { display: flex; }
}
</style>
