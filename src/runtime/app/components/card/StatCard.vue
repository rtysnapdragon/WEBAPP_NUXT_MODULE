<template>
  <div class="stat-card fade-up" :style="{ '--delay': delay + 'ms' }">
    <div class="stat-card__glow" :style="{ background: color }" />
    <div class="stat-card__icon" :style="{ background: `${color}20`, color }">
      <i :class="icon"></i>
    </div>
    <div class="stat-card__label">{{ label }}</div>
    <div class="stat-card__value">
      <!-- <AnimatedNumber :value="value" /> -->
    </div>
    <div v-if="change !== undefined" class="stat-card__change" :class="change >= 0 ? 'stat-card__change--up' : 'stat-card__change--down'">
      <span>{{ change >= 0 ? '↑' : '↓' }}</span>
      <span>{{ Math.abs(change) }} today</span>
    </div>
    <div v-if="subtext" class="text-xs text-muted" style="margin-top: 4px;">{{ subtext }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: number
  color?: string
  change?: number
  subtext?: string
  delay?: number
}>()
</script>

<style lang="scss">
.stat-card {
  animation-delay: var(--delay, 0ms);
  cursor: default;

  &:hover .stat-card__glow {
    opacity: .25;
    transform: scale(1.2);
  }

  .stat-card__glow {
    transition: all 0.2ms;
    transition-property: opacity, transform;
  }
}
</style>
