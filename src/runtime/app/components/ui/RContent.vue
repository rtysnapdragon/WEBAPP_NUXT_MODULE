<script setup lang="ts">

</script>

<template>
  <div class="r-content">
    <slot />
  </div>
</template>

<style lang="scss" scoped>

.r-content {
  background:    var(--bg-c-card) !important;
  border-radius: var(--radius-lg);
  overflow:      hidden;
  padding:10px !important;
  min-height: calc(100dvh - 350px) ;
  @include transition;
}
</style>
