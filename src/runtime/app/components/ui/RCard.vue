<script setup lang="ts">
// RCard — glass morphism card
withDefaults(defineProps<{
  title?:     string
  subtitle?:  string
  icon?:      string
  glass?:     boolean
  padding?:   'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  bordered?:  boolean
}>(), {
  padding:  'md',
  bordered: true,
})
</script>

<template>
  <div :class="[
    'r-card',
    `r-card--pad-${padding}`,
    { 'r-card--glass': glass, 'r-card--hoverable': hoverable, 'r-card--bordered': bordered }
  ]">
    <!-- Header -->
    <div v-if="title || $slots.header" class="r-card__header">
      <slot name="header">
        <div class="r-card__title-wrap">
          <UIcon v-if="icon" :name="icon" class="r-card__icon" />
          <div>
            <p class="r-card__title">{{ title }}</p>
            <p v-if="subtitle" class="r-card__subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </slot>
      <div v-if="$slots.actions" class="r-card__actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Body -->
    <div class="r-card__body">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="r-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>

.r-card {
  background:    var(--c-surface);
  border-radius: var(--radius-lg);
  overflow:      hidden;
  @include transition;

  &--bordered { border: 1px solid var(--c-border); }

  &--glass {
    @include glass;
  }

  &--hoverable:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    transform:  translateY(-1px);
  }

  /* Padding variants */
  &--pad-none .r-card__body { padding: 0; }
  &--pad-sm   .r-card__body { padding: var(--space-3); }
  &--pad-md   .r-card__body { padding: var(--space-4) var(--space-5); }
  &--pad-lg   .r-card__body { padding: var(--space-6) var(--space-8); }

  &__header {
    display:       flex;
    align-items:   center;
    justify-content: space-between;
    padding:       var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--c-border);
    gap:           var(--space-3);
  }

  &__title-wrap {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }

  &__icon {
    font-size:  1.2rem;
    color:      var(--c-accent);
    flex-shrink: 0;
  }

  &__title {
    font-size:   0.9rem;
    font-weight: 600;
    color:       var(--c-text);
  }

  &__subtitle {
    font-size: 0.78rem;
    color:     var(--c-muted);
    margin-top: 2px;
  }

  &__actions {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    flex-shrink: 0;
  }

  &__footer {
    padding:    var(--space-3) var(--space-5);
    border-top: 1px solid var(--c-border);
    background: rgba(0,0,0,0.02);
  }
}
</style>
