<template>
  <div class="r-wrapper-page" :class="props.class">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps(['class'])
</script>

<style lang="scss" scoped>
.r-wrapper-page {
  display: flex;
  flex-direction: column;
  padding: 5px 15px 5px 15px;
  grid-gap: 16px;
  height: calc(100vh - 66px);
}
@media (max-width: 768px) {
  .r-wrapper-page {
    padding: 5px 5px 2px 5px !important;
    grid-gap: 12px !important;
    height: calc(100vh - 114px) !important;
  }
}
</style>