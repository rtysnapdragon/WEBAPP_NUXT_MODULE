<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :transition="true"
    :fullscreen="isFullScreen"
    :dismissible="noClose"
    closeIcon="ri-close-line"
    :hide-header="noHeader"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
    :ui="defaultUI"
    class="r-modal"
  >
    <!-- HEADER -->
    <template #header>
      <div v-if="$slots.header" class="r-modal__header">
        <div class="title">
          <slot name="header" />
        </div>
        <div
          :class="['btn-close', noClose ? '!hidden' : '']"
          @click="
            () => {
              onCloseModal();
            }
          "
        >
          <i class="ri-close-large-fill"></i>
        </div>
        <slot name="headerCenter" />
        <slot name="headerRight" />
      </div>

      <div v-else class="r-modal__header r-modal__header__custom">
        <div class="flex gap-2 items-center">
          <div v-if="icon" v-html="`<i class='${icon} text-[16px]'></i>`"></div>
          <div class="flex flex-col">
            <h2 v-if="title" v-html="title" class="text-lg font-bold"></h2>
            <span v-if="description" v-html="description" class="text-[var(--c-muted])]"></span>
          </div>
        </div>
        <i class="ri-close-large-fill cursor-pointer btn-close" @click="() => { onCloseModal() }" />
      </div>
    </template>

    <!-- BODY (IMPORTANT FIX) -->
    <template #body>
      <div class="r-modal__body">
        <slot />
      </div>
    </template>

    <!-- FOOTER -->
    <template v-if="$slots.footer" #footer>
      <div class="r-modal__footer" >
        <slot name="footer" :close="onCloseModal()" />
      </div>
    </template>
  </UModal>
</template>

<script setup>
const isOpen = defineModel()

const props = defineProps([
  'title',
  'description',
  'isFullScreen',
  'noClose',
  'ui',
  'icon',
  'noHeader',
  'mode'
])
  

const emit = defineEmits(["submit",'onClose'])

const title = computed(() => props.title)
const description = computed(() => props.description)
const isFullScreen = computed(() => props.isFullScreen)
const noClose = computed(() => props.noClose)
const icon = computed(() => props.icon)
const mode = computed(() => props.mode)
const onCloseModal = () => {
  isOpen.value = false;
  emit("onClose");
};
const mergedUi = computed(() => ({
  base: "r-modal__base",
  content: "r-modal__content bg-default divide-y divide-default flex flex-col focus:outline-none",
  header: ["r-modal__header", props.noHeader ? 'hide-header !p-0 !min-h-0' : 'p-0'] ,
  body: "r-modal__body-ui flex-1",
  footer: "flex items-center",
  overlay: "r-modal__overlay fixed inset-0",
  rounded: "r-modal__rounded",
  shadow: "r-modal__shadow",
  description: 'mt-1 text-muted text-sm',
  title: 'text-highlighted font-semibold',
  close: 'absolute top-4 end-4',
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
}))

const defaultUI = computed(() => ({
  ...(props.ui ?? {}), ...mergedUi.value
}))
</script>

<style lang="scss">
.btn-close{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px !important;
  height: 20px !important;
  padding: 5px;
  border-radius: 999px !important;
  :hover{
    background-color: red !important;
  }
}

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
.r-modal__base{  
  button{
    width: 20px !important;
    height: 20px !important;
  }
  
  :deep(.r-modal__overlay) {
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(6px);
  }
  
/* ===== Modal container ===== */
  :deep(.r-modal__content) {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  [data-slot="body"]{
    padding: 10px 20px  !important;
  }
}

.r-modal__header{
    width: 100%;
    // min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: start;
    
    &__custom {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

/* ===== Body ===== */
.r-modal__body {
  font-size: 13px;
  color: var(--c-text);
  /* max-height: 70vh; */
  overflow-y: auto;
}

/* ===== Footer ===== */

.r-modal__footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* buttons */
.r-modal__btn {
  min-width: 90px;
}

/* rounded override */
.r-modal__rounded {
  border-radius: 50px;
}


// global setup style on NuxtUI to full access override
  [data-slot="header"] {
    padding: 5px 15px;
    min-height: 50px !important;
    // max-height: 20px !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    overflow: hidden !important;

    h2 {
    font-size: 15px !important;
    line-height: 20px !important;
    font-weight: 600 !important;
    margin: 0 !important;
  }

  /* Adjust close icon size */
  :deep([data-slot="header"] .ri-close-large-fill) {
    font-size: 18px !important;
  }
  }


// hide UMoldal header of NuxtUI
.hide-header{
  display: none !important;
}
</style>