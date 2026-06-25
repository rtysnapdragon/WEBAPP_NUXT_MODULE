<template>
    <USkeleton :ui="ui" :class="newClass" />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ ui: Object, outContent: Boolean, class: String })
const newClass = computed(() => props.class)
const ui = computed(() => {
    const defaultUI = {
        base: 'animate-pulse',
        background: `${isNotEmpty(props.outContent) ? 'out-content-color' : 'in-content-color'}`,
        rounded: 'rounded-md',
    }

    return { ...defaultUI, ...props.ui }

})
</script>

<style lang="scss">
.in-content-color {
    background-color: var(--bg-wrapper);
}

.out-content-color {
    background-color: var(--bg-content);
}

.dark {
    .in-content-color {
        background-color: var(--bg-wrapper);
    }

    .out-content-color {
        background-color: var(--bg-content);
    }
}
</style>