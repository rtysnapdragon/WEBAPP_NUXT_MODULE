<script setup lang="ts">
// RFormGroup — collapsible section grouping form fields
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title?:       string
  icon?:        string
  cols?:        1 | 2 | 3 | 4
  collapsible?: boolean
  collapsed?:   boolean
  span?:        number   // grid span override
}>(), {
  cols: 1,
  collapsed: false,
})

const open = ref(!props.collapsed)
</script>

<template>
  <div
    :class="['r-form-group', { 'r-form-group--has-title': title }]"
    :style="span ? { gridColumn: `span ${span}` } : {}"
  >
    <!-- Group header -->
    <div
      v-if="title"
      class="r-form-group__header"
      :class="{ 'r-form-group__header--clickable': collapsible }"
      @click="collapsible && (open = !open)"
    >
      <div class="r-form-group__title-row">
        <UIcon v-if="icon" :name="icon" class="r-form-group__icon" />
        <span class="r-form-group__title">{{ title }}</span>
      </div>
      <UIcon
        v-if="collapsible"
        :name="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="r-form-group__toggle"
      />
    </div>

    <!-- Fields grid -->
    <Transition name="collapse">
      <div
        v-show="!collapsible || open"
        :class="['r-form-group__fields', `r-form-group__fields--cols-${cols}`]"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>

.r-form-group {
  display: contents;

  &--has-title {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    grid-column: 1 / -1;
  }

  &__header {
    @include flex-between;
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--c-border);

    &--clickable {
      cursor: pointer;
      user-select: none;
      &:hover .r-form-group__title { color: var(--c-accent); }
    }
  }

  &__title-row {
    display:     flex;
    align-items: center;
    gap:         var(--space-2);
  }

  &__icon  { color: var(--c-accent); font-size: 1rem; }
  &__title { font-size: 0.83rem; font-weight: 600; color: var(--c-text); text-transform: uppercase; letter-spacing: 0.05em; }
  &__toggle { color: var(--c-muted); @include transition(fast); }

  &__fields {
    display: grid;
    gap:     var(--space-4);

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

/* Collapse transition */
.collapse-enter-active, .collapse-leave-active {
  transition: all 0.22s ease;
  overflow: hidden;
}
.collapse-enter-from, .collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to, .collapse-leave-from {
  max-height: 800px;
}
</style>
