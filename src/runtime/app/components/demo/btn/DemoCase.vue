<template>
  <RCard class="demo-case">
    <header class="demo-case__head">
      <div class="demo-case__titles">
        <h3 class="demo-case__title">{{ title }}</h3>
        <p v-if="description" class="demo-case__desc">{{ description }}</p>
      </div>
      <button v-if="code" type="button" class="demo-case__toggle" @click="open = !open">
        <i class="ri-code-s-slash-line" /> {{ open ? 'Hide code' : 'Show code' }}
      </button>
    </header>

    <div v-if="$slots.default" class="demo-case__preview" :class="`demo-case__preview--${layout}`">
      <slot />
    </div>

    <p v-if="$slots.note" class="demo-case__note">
      <i class="ri-information-line" />
      <span><slot name="note" /></span>
    </p>

    <DemoCode v-if="code && open" :code="code" class="demo-case__code" />
  </RCard>
</template>

<script setup>
const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  /** source shown under the live preview */
  code: { type: String, default: '' },
  /** row = wrap in a line, grid = auto-fill columns, column = stacked */
  layout: { type: String, default: 'row', validator: (v) => ['row', 'grid', 'column'].includes(v) },
  codeOpen: { type: Boolean, default: true },
})

const open = ref(props.codeOpen)
</script>

<style lang="scss" scoped>
.demo-case {
  margin-bottom: 16px;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }

  &__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  &__desc {
    margin: 4px 0 0;
    max-width: 70ch;
    font-size: 13px;
    line-height: 1.55;
    color: var(--c-muted, var(--ui-text-muted));
  }

  &__toggle {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border: 1px solid var(--c-border, var(--ui-border));
    border-radius: 8px;
    background: transparent;
    color: var(--c-muted, var(--ui-text-muted));
    font-size: 12px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s;

    &:hover {
      border-color: var(--c-accent, #6366f1);
      color: var(--c-accent, #6366f1);
    }
  }

  &__preview {
    padding: 18px;
    border: 1px dashed var(--c-border, var(--ui-border));
    border-radius: 12px;

    &--row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
    }

    &--grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px 10px;
      align-items: start;
    }

    &--column {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  &__note {
    display: flex;
    gap: 8px;
    margin: 12px 0 0;
    padding: 9px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, #f59e0b 12%, transparent);
    color: var(--c-text, var(--ui-text));
    font-size: 12.5px;
    line-height: 1.55;

    i {
      flex-shrink: 0;
      margin-top: 1px;
      color: #d97706;
    }
  }

  &__code {
    margin-top: 12px;
  }
}
</style>
