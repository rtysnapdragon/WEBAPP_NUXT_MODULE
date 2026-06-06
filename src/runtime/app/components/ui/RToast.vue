<script setup lang="ts">
// RToast — global toast notification stack driven by ui store
import { useUIStore } from '@/stores/ui'
const ui = useUIStore()

const icons: Record<string, string> = {
  success: 'i-lucide-check-circle-2',
  error:   'i-lucide-x-circle',
  info:    'i-lucide-info',
  warning: 'i-lucide-alert-triangle',
}
</script>

<template>
  <Teleport to="body">
    <div class="r-toast-stack" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="r-toast-list">
        <div
          v-for="toast in ui.toasts"
          :key="toast.id"
          :class="['r-toast', `r-toast--${toast.type}`]"
          role="alert"
        >
          <UIcon :name="icons[toast.type]" class="r-toast__icon" />
          <div class="r-toast__body">
            <p class="r-toast__title">{{ toast.title }}</p>
            <p v-if="toast.message" class="r-toast__msg">{{ toast.message }}</p>
          </div>
          <button class="r-toast__close" type="button" @click="ui.removeToast(toast.id)">
            <UIcon name="i-lucide-x" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_mixin' as *;

.r-toast-stack {
  position:       fixed;
  bottom:         var(--space-6);
  right:          var(--space-6);
  z-index:        9999;
  pointer-events: none;
  width:          360px;
  max-width:      calc(100vw - 2rem);

  @include mobile-only {
    bottom: var(--space-4);
    right:  var(--space-4);
    left:   var(--space-4);
    width:  auto;
  }
}

.r-toast-list { display: flex; flex-direction: column; gap: var(--space-2); }

.r-toast {
  display:       flex;
  align-items:   flex-start;
  gap:           var(--space-3);
  padding:       var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border:        1px solid var(--c-border);
  pointer-events: all;
  @include glass(var(--glass-blur-sm));

  &--success { border-color: rgba(74,222,128,0.3); }
  &--error   { border-color: rgba(248,113,113,0.3); }
  &--info    { border-color: rgba(96,165,250,0.3); }
  &--warning { border-color: rgba(255,179,71,0.3); }

  &__icon {
    font-size:  1.1rem;
    flex-shrink: 0;
    margin-top: 1px;

    .r-toast--success & { color: var(--color-green); }
    .r-toast--error   & { color: var(--color-red); }
    .r-toast--info    & { color: var(--color-blue); }
    .r-toast--warning & { color: var(--color-yellow); }
  }

  &__body { flex: 1; min-width: 0; }
  &__title { font-size: 0.875rem; font-weight: 600; color: var(--c-text); }
  &__msg   { font-size: 0.78rem;  color: var(--c-muted); margin-top: 2px; }

  &__close {
    background: transparent;
    border:     none;
    color:      var(--c-muted);
    cursor:     pointer;
    padding:    2px;
    @include flex-center;
    @include transition(fast);
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    &:hover { color: var(--c-text); }
  }
}

/* Transition */
.toast-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(100%); }
.toast-leave-to     { opacity: 0; transform: translateX(100%); }

@include mobile-only {
  .toast-enter-from, .toast-leave-to { transform: translateY(100%); }
}
</style>
