<!-- components/RDrawer.vue -->
<script setup>
import { computed, useSlots } from 'vue'

import { useScreenStore } from '../stores/screen'
const open = defineModel()
const props = defineProps([
  'direction',
  'modal',
  'overlay',
  'handle',
  'dismissible',
  'trapFocus',
  'closeOnEscape',
  'closeOnOutsideClick',
  'className',
  'ui',
  'title',
  'icon',
  'description',
  'class',
  'handleOnly',
  'shouldScaleBackground',
  'nested'
])

const dismissible = computed(() => props.dismissible ?? true)
const modal = computed(() => props.modal ?? true)
const overlay = computed(() => props.overlay ?? true)
const handle = computed(() => props.handle ?? true)
const trapFocus = computed(() => props.trapFocus ?? true)
const closeOnEscape = computed(() => props.closeOnEscape ?? true)
const closeOnOutsideClick = computed(() => props.closeOnOutsideClick ?? true)
const className = computed(() => props.class ?? '')
const handleOnly = computed(() => props.handleOnly ?? false)
const nested = computed(() => props.nested ?? false)
const shouldScaleBackground = computed(() => props.shouldScaleBackground ?? false)


const emit = defineEmits(['update:modelValue', 'open', 'close'])

const screen = useScreenStore()
/**
 * Responsive defaults
 */
const defaultWidth = computed(() => {
  if (screen.isMobile) return '85vw'
  if (screen.isTablet) return '400px'
  return '500px'
})


// Internal state
const defaultUI = computed(() => {
  const base  = {
    overlay: 'r-drawer-overlay fixed inset-0 bg-elevated/75',
    content: [
      'r-drawer-content r-drawer-content fixed bg-default ring ring-default flex focus:outline-none flex-col w-[500px] flex flex-col bg-default shadow-xl',
      nested.value ? 'z-[60]' : 'z-[50]'
    ],
    handle: [
      'shrink-0 !bg-accented',
      'transition-opacity',
      'r-drawer-handle'
    ],
    container: 'r-drawer-container w-full flex flex-col gap-4 p-4 overflow-y-auto',
    header: '',
    title: 'text-highlighted font-semibold',
    description: 'mt-1 text-muted text-sm',
    body: 'r-drawer-body flex-1',
    footer: 'flex flex-col gap-1.5'
  }
  return { ...base, ...props.ui }
})

</script>

<template>
    <UDrawer
      v-model:open="open"
      :direction="direction"
      :modal="modal"
      :overlay="overlay"
      :handle="handle"
      :handle-only="handleOnly"
      :dismissible="dismissible"
      :trap-focus="trapFocus"
      :close-on-escape="closeOnEscape"
      :close-on-outside-click="closeOnOutsideClick"
      :should-scale-background="shouldScaleBackground"
      :class="className"
      :ui="defaultUI"
      class="r-drawer-wrapper"
      >
      <!-- :style="sizeStyle" -->

      <!-- Pass through all slots -->
      <!-- <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template> -->

      <template #content>
        <div
        class="flex flex-col h-full"
        :style="{
          width: direction === 'left' || direction === 'right'
            ? defaultWidth
            : '100%'
        }"
      >
        <div v-if="$slots.header || title || description" class="r-drawer-wrapper">
          <slot name="header">
            <div class="flex items-center justify-between w-full">
              <div>
                  <h2 v-if="title" v-html="title" class="text-lg font-bold"></h2>
                  <span v-if="description" v-html="description"></span>
              </div>
              <div @click="open = false" class="r-drawer-header cursor-pointer" ><i class="ri-close-line"></i></div>
            </div>
          </slot>
        </div>
        
        <!-- BODY -->
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>

        <div v-if="$slots.footer"  class="p-4 border-t">
          <slot name="footer">

          </slot>
        </div>
        </div>
      </template>
    </UDrawer>
</template>

<style lang="scss" scoped>
.r-drawer-handle {
  height: 4px;
  width: 40px;
  border-radius: 999px;
  background: var(--color-muted);
  margin: 10px auto;
}
.r-drawer-wrapper {
  display: inline-block;
  z-index: 9999;
  min-width: 500px;
  padding: 20px;
}

:deep([data-vaul-drawer-direction='right']) {
  width: 500px;
}

/* Mobile */
@media (max-width: 640px) {
  :deep(.r-drawer-content) {
    width: 85vw !important;
    max-width: 85vw !important;
  }

  :deep([data-vaul-drawer-direction="top"]),
  :deep([data-vaul-drawer-direction="bottom"]) {
    height: 85vh !important;
    max-height: 85vh !important;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  :deep([data-vaul-drawer-direction="left"]),
  :deep([data-vaul-drawer-direction="right"]) {
    width: 400px !important;
    max-width: 400px !important;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  :deep([data-vaul-drawer-direction="left"]),
  :deep([data-vaul-drawer-direction="right"]) {
    width: 500px !important;
    max-width: 500px !important;
  }
}

/* Handle */
:deep([data-slot="handle"]) {
  padding: 12px 16px;
}

:deep([data-slot="handle"]::before) {
  width: 40px;
  height: 4px;
  border-radius: 999px;
}

/* Overlay */
:deep([data-slot="overlay"]) {
  backdrop-filter: blur(8px);
}

/* Content */
:deep([data-slot="content"]) {
  transition:
    transform .3s cubic-bezier(.4,0,.2,1),
    opacity .3s ease;
}

/* Scrollbar */
:deep([data-slot="body"]) {
  scrollbar-width: thin;
}

:deep([data-slot="body"]::-webkit-scrollbar) {
  width: 4px;
}

:deep([data-slot="body"]::-webkit-scrollbar-track) {
  background: var(--bg-tertiary);
}

:deep([data-slot="body"]::-webkit-scrollbar-thumb) {
  background: var(--c-accent);
  border-radius: 999px;
}

// :deep(.r-drawer-content) {}
// :deep(.r-drawer-overlay) {}
// :deep(.r-drawer-handle) {}
// :deep(.r-drawer-body) {}
</style>