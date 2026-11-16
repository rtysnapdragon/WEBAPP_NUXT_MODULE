<template>
  <div class="title w-full h-[40px] flex items-center justify-center text-[10px] color-w-b-2 text-nowrap whitespace-nowrap">
    RTYGroup® {{ props.name ?? 'Master Tracker' }} v{{ props.v }} · <i class="ri-copyright-line ml-1"></i>{{ format(new Date(), 'yyyy') }} App: {{ props.appv }} by
    <a class="hover-to-color-primary" :href="props.link ?? '#'" style="padding: 0px 4px;">RITHTHY</a>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
const props = defineProps(['v', 'name','link','appv'])

</script>

<style lang="scss" scoped>
  .title {
      font-size: clamp(5px, 2.5vw, 10px);
      background: linear-gradient(135deg, var(--success), var(--secondary));
      -webkit-background-clip: text;
      background-clip: text;
      // color: transparent;
      text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
      letter-spacing: 1px;
      line-height: 1.2;
  }
</style>