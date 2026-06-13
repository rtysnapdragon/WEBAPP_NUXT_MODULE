
<template>
  <USlideover
    v-model:open="open"
    :side="slideoverSide"
    :dismissible="dismissible"
    :title="title"
    :subtitle="subtitle"
    :description="description"
    :overlay="true"
    :closeIcon="true"
    :transition="true"
    :ui="mergedUi"
    :close="{
      icon: 'ri-close-line',
      color: 'neutral',
      variant: 'ghost',
      square: true,
      onClick: () => handleClose(false)
    }"
    @update:open="onOpenChange"
    class="r-drawer"
    :class="['r-form-builder', `r-form-builder--${slideoverSide}`]"
  >
    <!-- Header -->
    <template #header>
      <slot name="header">
        <div class="r-header flex items-center justify-between w-full">
          <div>
            <h3
              v-if="title"
              class="text-base font-semibold"
            >
              {{ title }}
            </h3>

            <p
              v-if="description"
              class="text-sm text-muted"
            >
              {{ description }}
            </p>
          </div>
          <i class="ri-close-line text-[16px] cursor-pointer" @click="handleClose(false)"></i>
        </div>
      </slot>
    </template>
  
    <!-- Body -->
    <template #body>
      <div class="r-body space-y-4 w-full flex flex-col">
          <slot />
      </div>
    </template>

    <!-- Footer -->`

    <template #footer>
      <slot
        name="footer"
          :close="handleClose"
      >
        <div class="r-footer py-[10px] flex justify-end gap-2 w-full">
          <RBtn
            color="neutral"
            :label="cancelLabel"
            @click="handleClose(false)"
          />

          <RBtn
            color="primary"
            :label="submitLabel"
            @click="handleSubmit"
          />
        </div>
      </slot>
    </template>
  </USlideover>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormSchema } from '../types/form'
import { useUIStore } from '../stores/ui'
import { useI18n } from 'vue-i18n'
const open = defineModel<boolean>()

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    subtitle?: string

    side?: 'left' | 'right' | 'top' | 'bottom'

    ui?: Record<string, any>

    showCancel?: boolean
    showSubmit?: boolean

    submitLabel?: string
    cancelLabel?: string

    dismissible?: boolean

    noClose?: boolean
  }>(),
  {
    side: 'right', //right/left/top/bottom
    dismissible: true,
    subtitle: '',

    showCancel: true,
    showSubmit: false,

    submitLabel: 'save',
    cancelLabel: 'cancel',

    noClose: true,

    ui: () => ({})
  }
)
const ui = useUIStore()

const emit = defineEmits<{
  close: [boolean]
  submit: []
}>()

function handleClose(result = false) {
  open.value = false
  emit('close', result)
}

function handleSubmit() {
  emit('submit')
}
/* -----------------------------
   UI Helpers
----------------------------- */
const slideoverSide = computed(() => {
  console.log("ui.isMobile ====================> : ", ui.isMobile)
  return ui.isMobile ? 'bottom' : props.side
})

const mergedUi = computed(() => ({
  slots: {
    content: [
      'bg-[var(--c-surface)]',
      'border-[var(--c-border)]',
      'shadow-xl'
    ],
    overlay: 'fixed inset-0 bg-elevated/75',
     header: [
       'px-5 py-4',
       'border-b border-[var(--c-border)]'
     ],
 
     body: [
       'flex-1',
       'overflow-y-auto',
       'p-5'
     ],
 
     footer: [
       'px-5 py-3 border-t border-defaul flex items-center gap-1.5 p-4 sm:px-6',
       'border-t border-[var(--c-border)]'
     ],
    close: [
      'absolute',
      'top-4',
      'right-4',
      'w-8 h-8',
      'rounded-lg',
      'bg-transparent',
      'hover:bg-accented',
      'text-muted',
      'cursor-pointer',
    ],
     title: 'font-semibold',
     description: 'text-sm text-muted'   
  },
    variants: {
        side: {
          top: {
            content: ''
          },
          right: {
            content: 'max-w-md'
          },
          bottom: {
            content: ''
          },
          left: {
            content: 'max-w-md'
          }
        },
        inset: {
          true: {
            content: 'rounded-lg'
          }
        },
        transition: {
          true: {
            overlay: 'data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]'
          }
        }
      },
  footer: 'justify-end',
  ...props.ui
}))

function onOpenChange(value: boolean) {
  open.value = value

  if (!value) {
    emit('close', false)
  }
}

// watch(open, (value) => {
//   if (!value) {
//     emit('close', false)
//   }
// })
</script>

<style lang="scss" scoped>
.r-drawer {
    background-color: var(--c-bg);
  --ui-radius: var(--r-xl);

  --ui-backdrop-filter: blur(8px);
}

.r-header {
  padding: 10px 15px;
  color: var(--c-text);
}

.r-body {
  padding: 10px 15px;
  color: var(--c-text);
  overflow-y:scroll !important;
  overflow-x: hidden !important;
}

.r-footer {
  padding: 10px 15px;
  color: var(--c-text);
}

.r-footer :deep(button) {
  width: 100%;
  max-width: 250px;
}


.r-form-builder {
  /* Mobile: bottom sheet style */
  &--bottom :deep(.slideover-panel) {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-height:   90dvh;
  }

  &__header {
    @include flex-between;
    padding:     var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--c-border);
    gap:         var(--space-4);
  }

  &__title-wrap {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }

  &__icon-wrap {
    width:         40px;
    height:        40px;
    border-radius: var(--radius-md);
    background:    rgba(255,140,66,0.12);
    color:         var(--c-accent);
    @include flex-center;
    font-size:     1.1rem;
    flex-shrink:   0;
  }

  &__title {
    font-size:   1rem;
    font-weight: 600;
    color:       var(--c-text);
  }

  &__subtitle {
    font-size: 0.8rem;
    color:     var(--c-muted);
    margin-top: 2px;
  }

  &__close {
    width:         32px;
    height:        32px;
    border:        none;
    border-radius: var(--radius-md);
    background:    transparent;
    color:         var(--c-muted);
    cursor:        pointer;
    @include flex-center;
    @include transition(fast);
    flex-shrink:   0;

    &:hover {
      background: rgba(255,140,66,0.1);
      color:      var(--c-accent);
    }
  }

  &__body {
    flex:      1;
    overflow-y: auto;
    padding:   var(--space-5) var(--space-6);
    display:   flex;
    flex-direction: column;
    gap:       var(--space-5);

    @include mobile-only {
      padding: var(--space-4);
    }
  }

  &__footer {
    display:       flex;
    align-items:   center;
    justify-content: flex-end;
    gap:           var(--space-3);
    padding:       var(--space-4) var(--space-6);
    border-top:    1px solid var(--c-border);
    background:    var(--c-surface);

    @include mobile-only {
      padding:      var(--space-4);
      flex-direction: column;
      > * { width: 100%; }
    }
  }
}
</style>