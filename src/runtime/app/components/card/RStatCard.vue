<script setup lang="ts">
// RStatCard — KPI metric card with trend indicator
withDefaults(defineProps<{
  title:   string
  value:   string | number
  icon?:   string
  trend?:  number      // percent change, positive = up
  prefix?: string
  suffix?: string
  color?:  'accent' | 'success' | 'danger' | 'info' | 'warning'
  loading?: boolean
  glass?:  boolean
}>(), {
  color: 'accent',
})
</script>

<template>
  <div :class="['r-stat-card', `r-stat-card--${color}`, { 'r-stat-card--glass': glass }]">
    <!-- Icon -->
    <div class="r-stat-card__icon-wrap">
      <UIcon v-if="icon" :name="icon" class="r-stat-card__icon" />
    </div>

    <!-- Content -->
    <div class="r-stat-card__content">
      <p class="r-stat-card__title">{{ title }}</p>

      <div v-if="loading" class="r-stat-skeleton" />
      <p v-else class="r-stat-card__value">
        <span v-if="prefix" class="r-stat-card__pre">{{ prefix }}</span>
        {{ value }}
        <span v-if="suffix" class="r-stat-card__suf">{{ suffix }}</span>
      </p>

      <!-- Trend -->
      <div v-if="trend !== undefined && !loading" class="r-stat-card__trend">
        <UIcon
          :name="trend >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
          :class="trend >= 0 ? 'r-stat-card__trend--up' : 'r-stat-card__trend--down'"
        />
        <span :class="trend >= 0 ? 'r-stat-card__trend--up' : 'r-stat-card__trend--down'">
          {{ Math.abs(trend) }}%
        </span>
        <span class="r-stat-card__trend-label">vs last period</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_mixin' as *;

.r-stat-card {
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding:       var(--space-5);
  display:       flex;
  gap:           var(--space-4);
  align-items:   flex-start;
  @include transition;

  &:hover { box-shadow: var(--glow-accent-sm); }

  &--glass { @include glass; }

  &--accent  .r-stat-card__icon-wrap { background: rgba(255,140,66,0.12); color: var(--c-accent); }
  &--success .r-stat-card__icon-wrap { background: rgba(74,222,128,0.12); color: var(--color-green); }
  &--danger  .r-stat-card__icon-wrap { background: rgba(248,113,113,0.12); color: var(--color-red); }
  &--info    .r-stat-card__icon-wrap { background: rgba(96,165,250,0.12); color: var(--color-blue); }
  &--warning .r-stat-card__icon-wrap { background: rgba(255,179,71,0.12); color: var(--color-yellow); }

  &__icon-wrap {
    width:         44px;
    height:        44px;
    border-radius: var(--radius-md);
    @include flex-center;
    flex-shrink:   0;
  }

  &__icon { font-size: 1.3rem; }

  &__content { flex: 1; min-width: 0; }

  &__title {
    font-size:  0.78rem;
    color:      var(--c-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    @include truncate;
  }

  &__value {
    font-size:   1.6rem;
    font-weight: 700;
    color:       var(--c-text);
    line-height: 1.2;
    margin-top:  var(--space-1);
  }

  &__pre, &__suf {
    font-size:   0.9rem;
    font-weight: 500;
    color:       var(--c-muted);
  }

  &__trend {
    display:     flex;
    align-items: center;
    gap:         4px;
    margin-top:  var(--space-2);
    font-size:   0.8rem;
    font-weight: 500;

    &--up   { color: var(--color-green); }
    &--down { color: var(--color-red); }

    &-label { color: var(--c-muted); font-weight: 400; }
  }
}

.r-stat-skeleton {
  height:        28px;
  width:         80px;
  margin-top:    var(--space-1);
  border-radius: var(--radius-sm);
  background:    linear-gradient(90deg, var(--c-border) 25%, rgba(255,255,255,0.4) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation:     shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
