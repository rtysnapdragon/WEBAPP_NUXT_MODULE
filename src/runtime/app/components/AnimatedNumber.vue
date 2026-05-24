<template>
  <div>
    <span class="animated-number">{{ displayed }}</span>
  </div>
</template>

<script setup>
const props = defineProps({ value, duration });

const displayed = ref(0);
const start = ref(0);
const startTime = ref(0);
const duration = computed(() => props.duration ?? 800);

const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

const animate = (ts) => {
  if (!startTime.value) startTime.value = ts
  const elapsed = ts - startTime.value
  const progress = Math.min(elapsed / duration.value, 1)
  displayed.value = Math.round(start.value + (props.value - start.value) * ease(progress))
  if (progress < 1) requestAnimationFrame(animate)
}

watch(() => props.value, (newVal, oldVal) => {
  start.value = oldVal ?? 0
  startTime.value = 0
  requestAnimationFrame(animate)
}, { immediate: true })

// Format large numbers
const format = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

const displayed2 = computed(() => format(displayed.value))
</script>
