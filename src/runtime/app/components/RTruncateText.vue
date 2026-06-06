<template>
    <RTooltip :text="text" class="w-full">
        <div class="oc-text text line-clamp-1 w-full" :class="props.class">
            {{ text }}
        </div>
    </RTooltip>
</template>

<script setup>
const props = defineProps(['text', 'class']);
const text = computed(() => props.text) 
</script>

<style lang="scss" scoped>
// .text {
   
// }
</style>