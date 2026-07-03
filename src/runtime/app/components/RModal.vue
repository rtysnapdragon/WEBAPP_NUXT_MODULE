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
    :hide-footer="noFooter"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full'
    }"
    :content="{ style: { minWidth: modalWidthValue } }"
    :ui="defaultUI"
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
    <template  #footer>
        <div  v-if="$slots.footer" class="r-modal__footer" >
          <slot name="footer" />
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
  'modalWidth',
  'noClose',
  'ui',
  'icon',
  'noHeader',
  'noFooter',
  'mode'
])
  

const emit = defineEmits(["submit",'onClose'])

const title = computed(() => props.title)
const description = computed(() => props.description)
const isFullScreen = computed(() => props.isFullScreen)
const noClose = computed(() => props.noClose)
const icon = computed(() => props.icon)
const mode = computed(() => props.mode)
const modalWidth = computed(() => props.modalWidth)
const modalWidthValue = computed(() => modalWidth.value ?? 'fit-content')
const onCloseModal = () => {
  isOpen.value = false;
  emit("onClose");
};
const mergedUi = computed(() => ({
  wrapper: "r-modal__wrapper",
  content: ["r-modal__content", 'bg-default divide-y divide-default flex flex-col focus:outline-none'],
  header: ["r-modal__header", props.noHeader ? 'hide-header !p-0 !min-h-0' : 'p-0'] ,
  body: "r-modal__body-ui flex-1",
  footer: ["r-modal__footer flex items-center", props.noFooter ? 'hide-footer !p-0 !min-h-0' : 'p-0'],
  overlay: "r-modal__overlay fixed inset-0",
  rounded: "r-modal__rounded",
  shadow: "r-modal__shadow",
  description: 'mt-1 text-muted text-sm',
  title: 'text-highlighted font-semibold',
  close: 'absolute top-4 end-4',
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


/* ===== Overlay ===== */
.r-modal__content{ //
  width: 100%;
  // min-width: 1900px;
  // min-width: v-bind(modalWidthValue);
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
    padding: 5px 0;
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
  padding: 5px 10px;
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
.hide-header,.hide-footer{
  display: none !important;
}
</style>