<template>
  <RCard class="demo-log">
    <div class="demo-log__head">
      <strong><i class="ri-pulse-line" /> Event log</strong>
      <button v-if="entries.length" type="button" class="demo-log__clear" @click="emit('clear')">Clear</button>
    </div>

    <p v-if="!entries.length" class="demo-log__empty">Click or interact with any demo below, the emitted events appear here.</p>

    <TransitionGroup v-else name="demo-log" tag="ul" class="demo-log__list">
      <li v-for="e in entries" :key="e.id">
        <time>{{ e.time }}</time>
        <b>{{ e.name }}</b>
        <code v-if="e.detail">{{ e.detail }}</code>
      </li>
    </TransitionGroup>
  </RCard>
</template>

<script setup>
defineProps({
  entries: { type: Array, default: () => [] },
})
const emit = defineEmits(['clear'])
</script>

<style lang="scss" scoped>
.demo-log {
  position: sticky;
  top: 8px;
  z-index: 20;
  margin-bottom: 16px;
  backdrop-filter: blur(8px);

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  &__clear {
    border: 0;
    background: transparent;
    color: var(--c-accent, #6366f1);
    font-size: 12px;
    cursor: pointer;
  }

  &__empty {
    margin: 6px 0 0;
    font-size: 12.5px;
    color: var(--c-muted, var(--ui-text-muted));
  }

  &__list {
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    font-size: 12.5px;

    li {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px;
      padding: 3px 0;
    }

    time {
      color: var(--c-muted, var(--ui-text-muted));
      font-variant-numeric: tabular-nums;
    }

    code {
      padding: 1px 6px;
      border-radius: 6px;
      background: color-mix(in srgb, var(--c-accent, #6366f1) 10%, transparent);
      font-size: 12px;
    }
  }
}

.demo-log-enter-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.demo-log-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
