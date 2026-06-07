<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :transition="true"
    :fullscreen="isFullScreen"
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
  ...props.ui
}))
</script>

<style scoped>
.r-modal{
  background-color: var(--c-bg) !important;
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
/* .r-modal :deep(.r-modal__header) {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
} */

.r-modal__header{
    padding: 5px 15px;
    width: 100%;
}

/* ===== Body ===== */
.r-modal__body {
  padding: 15px 15px;
  font-size: 13px;
  color: #374151;
  max-height: 70vh;
  overflow-y: auto;
}

/* ===== Footer ===== */
.r-modal__footer {
  padding: 5px 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* footer actions */
.r-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* buttons */
.r-modal__btn {
  min-width: 90px;
}

/* rounded override */
.r-modal :deep(.r-modal__rounded) {
  border-radius: 50px;
}
</style>
