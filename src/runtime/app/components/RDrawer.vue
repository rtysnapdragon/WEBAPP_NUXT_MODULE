<!-- components/RDrawer.vue -->
<script setup>
import { useScreenStore } from '../stores/screen'
const open = defineModel()
const props = defineProps([
  'direction',
  'dismissible',
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
])

const direction = computed(() => props.direction || 'right')
const dismissible = computed(() => props.dismissible || true)
const modal = computed(() => props.modal || true)
const overlay = computed(() => props.overlay || true)
const handle = computed(() => props.handle || true)
const trapFocus = computed(() => props.trapFocus || true)
const closeOnEscape = computed(() => props.closeOnEscape || true)
const closeOnOutsideClick = computed(() => props.closeOnOutsideClick || true)
const className = computed(() => props.class || '')


const emit = defineEmits(['update:modelValue', 'open', 'close'])

const screen = useScreenStore()

// Internal state
const internalOpen = ref(props.modelValue || props.open || false)
const defaultUI = computed(() => {
  const base  = {
    overlay: 'fixed inset-0 bg-elevated/75',
        content: 'fixed bg-default ring ring-default flex focus:outline-none',
        handle: [
          'shrink-0 !bg-accented',
          'transition-opacity'
        ],
        container: 'w-full flex flex-col gap-4 p-4 overflow-y-auto',
        header: '',
        title: 'text-highlighted font-semibold',
        description: 'mt-1 text-muted text-sm',
        body: 'flex-1',
        footer: 'flex flex-col gap-1.5'
  }
  return { ...base, ...props.ui }
})

</script>

<template>
    <!-- UDrawer with responsive props -->
    <UDrawer
      v-model:open="open"
      :direction="direction"
      :modal="modal"
      :overlay="overlay"
      :handle="handle"
      :handle-only="handleOnly"
      :dismissible="dismissible"
      :class="className"
      :ui="defaultUI"
      class="r-drawer-wrapper"
      >
      <!-- :style="sizeStyle" -->

      <!-- Pass through all slots -->
      <!-- <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template> -->

      <template #body>
        <div class="flex items-center justify-between gap-4 mb-4">
            <h2 class="text-highlighted font-semibold">Drawer non-dismissible</h2>
            <slot name="header" />
            <div color="neutral" variant="ghost" icon="i-lucide-x" @click="open = false" class="r-drawer-header" ></div>
        </div>
      </template>

      <template #content>
        <div class="r-drawer-body">
            <slot />
        </div>
      </template>
    </UDrawer>
</template>

<style lang="scss" scoped>
.r-drawer-wrapper {
  display: inline-block;
  z-index: 9999;
  min-width: 500px;
}

// /* Responsive size adjustments for mobile */
// @media (max-width: 640px) {
//   :deep(.UDrawer) {
//     --drawer-size: 85% !important;
//   }
  
//   :deep(.UDrawer[data-direction="left"]),
//   :deep(.UDrawer[data-direction="right"]) {
//     width: 85% !important;
//     max-width: 85% !important;
//   }
  
//   :deep(.UDrawer[data-direction="top"]),
//   :deep(.UDrawer[data-direction="bottom"]) {
//     height: 85% !important;
//     max-height: 85% !important;
//   }
// }

// /* Tablet adjustments */
// @media (min-width: 641px) and (max-width: 1024px) {
//   :deep(.UDrawer[data-direction="left"]),
//   :deep(.UDrawer[data-direction="right"]) {
//     width: 400px !important;
//     max-width: 400px !important;
//   }
// }

// /* Desktop adjustments */
// @media (min-width: 1025px) {
//   :deep(.UDrawer[data-direction="left"]),
//   :deep(.UDrawer[data-direction="right"]) {
//     width: 500px !important;
//     max-width: 500px !important;
//   }
// }

// /* Custom handle for mobile */
// :deep(.UDrawer-handle) {
//   padding: 12px 16px;
//   border-bottom: 1px solid var(--border-table, #f0f0f0);
// }

// :deep(.UDrawer-handle-bar) {
//   width: 40px;
//   height: 4px;
//   border-radius: 2px;
//   background: var(--color-w-b-4, #cccccc);
//   transition: background 0.2s ease;
// }

// :deep(.UDrawer-handle-bar:hover) {
//   background: var(--c-accent, #ff8c42);
// }

// /* Dark mode overrides */
// .dark :deep(.UDrawer-handle) {
//   border-bottom-color: var(--border-table, #333333);
// }

// .dark :deep(.UDrawer-content) {
//   background: var(--bg-content, #242424);
// }

// .dark :deep(.UDrawer-overlay) {
//   background-color: rgba(0, 0, 0, 0.6);
//   backdrop-filter: blur(8px);
// }

// /* Animation enhancements */
// :deep(.UDrawer-content) {
//   transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
// }

// :deep(.UDrawer-enter-active),
// :deep(.UDrawer-leave-active) {
//   transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
// }

// /* Custom scrollbar for content */
// :deep(.UDrawer-body)::-webkit-scrollbar {
//   width: 4px;
// }

// :deep(.UDrawer-body)::-webkit-scrollbar-track {
//   background: var(--bg-tertiary, #f1f3f6);
// }

// :deep(.UDrawer-body)::-webkit-scrollbar-thumb {
//   background: var(--c-accent, #ff8c42);
//   border-radius: 2px;
// }

// :deep(.UDrawer-body)::-webkit-scrollbar-thumb:hover {
//   background: var(--c-accent-2, #ffb347);
// }
</style>