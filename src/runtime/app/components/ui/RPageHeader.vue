<script setup lang="ts">
// RPageHeader — page title + breadcrumb + actions slot
// No TypeScript in <script> block as per SARIKA convention

defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon:     { type: String, default: '' },
  back:     { type: Boolean, default: false },
})

const emit = defineEmits(['back'])
</script>

<template>
  <div class="r-page-header">
    <!-- Left -->
    <div class="r-page-header__left">
      <button v-if="back" class="r-page-header__back" type="button" @click="emit('back')">
        <UIcon name="i-lucide-arrow-left" />
      </button>

      <div class="r-page-header__icon-wrap" v-if="icon">
        <UIcon :name="icon" class="r-page-header__icon" />
      </div>

      <div>
        <h1 class="r-page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="r-page-header__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right: action slot -->
    <div v-if="$slots.actions" class="r-page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_mixin' as *;

.r-page-header {
  @include flex-between;
  gap:           var(--space-4);
  margin-bottom: var(--space-6);
  flex-wrap:     wrap;

  @include mobile-only {
    flex-direction: column;
    align-items:    flex-start;
    gap:            var(--space-3);
  }

  &__left {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }

  &__back {
    width:         36px;
    height:        36px;
    border:        1px solid var(--c-border);
    border-radius: var(--radius-md);
    background:    transparent;
    color:         var(--c-muted);
    cursor:        pointer;
    @include flex-center;
    @include transition(fast);
    &:hover { color: var(--c-accent); border-color: var(--c-accent); }
  }

  &__icon-wrap {
    width:         44px;
    height:        44px;
    border-radius: var(--radius-md);
    background:    rgba(255,140,66,0.1);
    color:         var(--c-accent);
    @include flex-center;
    flex-shrink:   0;
  }

  &__icon { font-size: 1.2rem; }

  &__title {
    font-size:   1.4rem;
    font-weight: 700;
    color:       var(--c-text);
    line-height: 1.2;

    @include mobile-only { font-size: 1.2rem; }
  }

  &__subtitle {
    font-size:  0.82rem;
    color:      var(--c-muted);
    margin-top: 3px;
  }

  &__actions {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
    flex-wrap:   wrap;

    @include mobile-only { width: 100%; }
  }
}
</style>
