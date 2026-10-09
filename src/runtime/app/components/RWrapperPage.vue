<template>
  <div class="r-wrapper-page" :class="props.class">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps(["class"]);
</script>

<style lang="scss" scoped>
.r-wrapper-page {
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  margin-right: 8px;
  border-radius: 12px;
  gap: var(--sp-3);
  height: calc(100vh - 70px);
}
@media (max-width: 768px) {
  .r-wrapper-page {
    padding: 5px 5px 2px 5px !important;
    grid-gap: 12px !important;
    height: calc(100vh - 114px) !important;
  }
}
</style>
