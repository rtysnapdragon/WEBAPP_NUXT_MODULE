<script setup lang="ts">

</script>

<template>
  <div class="r-content">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.r-content {
  background:    var(--c-surface) !important;
  border-radius: var(--radius-lg);
  overflow:      hidden;
  padding:15px !important;
  min-height: calc(100dvh - 350px) ;
}
</style>
