<template>
  <div class="r-card" :class="{ clickable }" @click="handleClick">
    <div v-if="$slots.header || title" class="r-card__header">
      <slot name="header">
        <h3 class="r-card__title">{{ title }}</h3>
      </slot>
    </div>

    <div class="r-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="r-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) emit('click')
}
</script>

<style scoped>
.r-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  padding: 16px;
  transition: 0.2s ease;
}

.r-card__header {
  margin-bottom: 10px;
}

.r-card__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.r-card__body {
  font-size: 14px;
  color: #374151;
}

.r-card__footer {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.r-card.clickable {
  cursor: pointer;
}

.r-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}
</style>