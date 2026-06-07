<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :transition="true"
    :fullscreen="isFullScreen"
    :dismissible="noClose"
    closeIcon="ri-close-line"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
    :ui="mergedUi"
    class="r-modal"
  >

    <!-- HEADER -->
    <template #header>
      <div class="r-modal__header">
        <slot name="header" />
      </div>
    </template>

    <!-- BODY (IMPORTANT FIX) -->
    <template #body>
        <div class="r-modal__body">
            <slot />
        </div>
    </template>

    <!-- FOOTER -->
    <template #footer="{ close }">
      <div class="r-modal__footer">
        <slot name="footer" :close="close">
          <div class="r-modal__actions">
            <UButton
              v-if="showCancel"
              label="Cancel"
              color="neutral"
              variant="outline"
              class="r-modal__btn"
              @click="close"
            />

            <UButton
              v-if="showSubmit"
              :label="submitLabel"
              color="primary"
              class="r-modal__btn"
              @click="$emit('submit', close)"
            />
          </div>
        </slot>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const open = defineModel()

const props = defineProps({
  title: String,
  description: String,
  isFullScreen: {
    type: Boolean,
    default: false
  },
  noClose: {
    type: Boolean,
    default: true
  },
  ui: {
    type: Object,
    default: () => ({})
  },

  showCancel: {
    type: Boolean,
    default: true
  },

  showSubmit: {
    type: Boolean,
    default: true
  },

  submitLabel: {
    type: String,
    default: "Submit"
  }
})

defineEmits(["submit"])

const mergedUi = computed(() => ({
  base: "r-modal__base",
  content: "r-modal__content",
  header: "r-modal__header",
  body: "r-modal__body-ui",
  footer: "r-modal__footer-ui",
  overlay: "r-modal__overlay",
  rounded: "r-modal__rounded",
  shadow: "r-modal__shadow",
  slots: {
    overlay: 'fixed inset-0',
    content: 'bg-default divide-y divide-default flex flex-col focus:outline-none',
    header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-(--ui-header-height)',
    wrapper: '',
    body: 'flex-1 p-4 sm:p-6',
    footer: 'flex items-center gap-1.5 p-4 sm:px-6',
    title: 'text-highlighted font-semibold',
    description: 'mt-1 text-muted text-sm',
    close: 'absolute top-4 end-4'
  },
  variants: {
    transition: {
      true: {
        overlay: 'data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]',
        content: 'data-[state=open]:animate-[scale-in_200ms_ease-out] data-[state=closed]:animate-[scale-out_200ms_ease-in]'
      }
    },
    fullscreen: {
      true: {
        content: 'inset-0'
      },
      false: {
        content: 'w-[calc(100vw-2rem)] max-w-lg rounded-lg shadow-lg ring ring-default'
      }
    },
    overlay: {
      true: {
        overlay: 'bg-elevated/75'
      }
    },
    scrollable: {
      true: {
        overlay: 'overflow-y-auto',
        content: 'relative'
      },
      false: {
        content: 'fixed',
        body: 'overflow-y-auto'
      }
    }
  },
  compoundVariants: [
    {
      scrollable: true,
      fullscreen: false,
      class: {
        overlay: 'grid place-items-center p-4 sm:py-8'
      }
    },
    {
      scrollable: false,
      fullscreen: false,
      class: {
        content: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] overflow-hidden'
      }
    }
  ],
  ...props.ui
}))
</script>

<style scoped>
.r-modal{
  background-color: var(--c-bg) !important;
  z-index: 9999;
  border-radius: 10px;
  --ui-radius: var(--r-xl);

  :deep([role='dialog']) {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    box-shadow: var(--glass-shadow);
  }

  :deep(.backdrop) {
    backdrop-filter: blur(10px);
  }
}
/* ===== Overlay ===== */
.r-modal :deep(.r-modal__overlay) {
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
}

/* ===== Modal container ===== */
.r-modal :deep(.r-modal__content) {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* ===== Header ===== */
.r-modal :deep(.r-modal__header) {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.r-modal__header{
    padding: 5px 15px;
    width: 100%;
}

/* ===== Body ===== */
.r-modal__body {
  padding: 15px 15px;
  font-size: 13px;
  color: var(--c-text);
  /* max-height: 70vh; */
  overflow-y: auto;
}

/* ===== Footer ===== */
.r-modal__footer {
  padding: 10px 15px;
  /* border-top: 1px solid rgba(0, 0, 0, 0.08); */
}

/* footer actions */
.r-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
  align-items: center;
}

/* buttons */
.r-modal__btn {
  min-width: 90px;
}

/* rounded override */
.r-modal__rounded {
  border-radius: 50px;
}
</style>
