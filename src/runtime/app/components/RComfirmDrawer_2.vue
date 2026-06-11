<script setup lang="ts">
import { computed } from 'vue'
import { createReusableTemplate, useMediaQuery } from '@vueuse/core'
import { useConfirmStore } from '../stores/confirm'
const [DefineBody, ReuseBody] =
  createReusableTemplate()

const confirmStore = useConfirmStore()

const isDesktop =
  useMediaQuery('(min-width:768px)')

const open = computed({
  get: () => !!confirmStore.data,
  set: (value:boolean) => {
    if (!value) {
      confirmStore.hide()
    }
  }
})

async function onConfirm() {
  await confirmStore.confirmAction()
}

function onCancel() {
  confirmStore.hide()
}
</script>

<template>
  <DefineBody>
    <div class="space-y-4">
      <div
        v-if="
          confirmStore.data?.message
        "
        class="text-sm text-[var(--c-muted)]"
      >
        {{ confirmStore.data.message }}
      </div>

      <slot />

      <div
        class="flex justify-end gap-2 pt-4"
      >
        <UButton
          :label="
            confirmStore.data
              ?.cancelText
          "
          color="neutral"
          variant="outline"
          :disabled="
            confirmStore.loading
          "
          @click="onCancel"
        />

        <UButton
          :label="
            confirmStore.data
              ?.confirmText
          "
          :color="
            confirmStore.data?.color
          "
          :loading="
            confirmStore.loading
          "
          @click="onConfirm"
        />
      </div>
    </div>
  </DefineBody>

  <UModal
    v-if="isDesktop"
    v-model:open="open"
    :dismissible="
      !confirmStore.data?.persistent
    "
    :title="
      confirmStore.data?.title
    "
    :description="
      confirmStore.data?.description
    "
  >
    <template #body>
      <ReuseBody />
    </template>
  </UModal>

  <UDrawer
    v-else
    v-model:open="open"
    :dismissible="
      !confirmStore.data?.persistent
    "
    :title="
      confirmStore.data?.title
    "
    :description="
      confirmStore.data?.description
    "
  >
    <template #body>
      <ReuseBody />
    </template>
  </UDrawer>
</template>