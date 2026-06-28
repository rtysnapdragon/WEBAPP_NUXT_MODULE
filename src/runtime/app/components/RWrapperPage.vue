<template>
  <div class="r-wrapper-page" :class="props.class">
      <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps(['class'])
</script>

<style >
.r-wrapper-page {
  display: flex;
  flex-direction: column;
  padding: 0px 20px 20px 20px;
  grid-gap: 16px;
  height: calc(100vh - 66px);
}
@media (max-width: 768px) {
  .r-wrapper-page {
    padding: 0px 14px 20px 14px;
    grid-gap: 12px;
    height: calc(100vh - 114px);
  }
}
</style>