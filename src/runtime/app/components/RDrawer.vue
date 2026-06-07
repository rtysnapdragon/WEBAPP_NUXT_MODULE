
<template>
  <USlideover
    v-model:open="open"
    :side="side"
    :dismissible="dismissible"
    :title="title"
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
      <!-- Close Button -->
  <!-- <template #close>
    <UButton
      icon="ri-close-line"
      color="neutral"
      variant="ghost"
      square
      @click="handleClose(false)"
    />
  </template>
    <template #actions>
      <div class="flex gap-x-2 justify-end w-full">
        <RBtn
          v-if="showCancel"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          @click="handleClose(false)"
        />

        <RBtn
          v-if="showSubmit"
          :label="submitLabel"
          color="primary"
          @click="handleSubmit"
        />
      </div>
    </template> -->

    <!-- Body -->
    <template #body>
        <div class="r-body">
            <slot />
        </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <slot
        name="footer"
        :close="handleClose"
      >
        <div class="r-footer py-[10px] flex justify-end gap-2 w-full">
          <RBtn
            v-if="showCancel"
            color="neutral"
            variant="outline"
            :label="cancelLabel"
            @click="handleClose(false)"
          />

          <RBtn
            v-if="showSubmit"
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
import { computed } from 'vue'

const open = defineModel<boolean>()

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string

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

    showCancel: true,
    showSubmit: false,

    submitLabel: 'Submit',
    cancelLabel: 'Cancel',

    noClose: true,

    ui: () => ({})
  }
)

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
      'right-4'
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
}

.r-footer {
  padding: 10px 15px;
  color: var(--c-text);
}

.r-footer :deep(button) {
  width: 100%;
  max-width: 250px;
}
</style>