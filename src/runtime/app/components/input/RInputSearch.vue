<template>
  <RInput ref="refOCInput" v-model.trim="search" icon="ri-search-2-line" :placeholder="placeholder ? placeholder : $t('search')" :isLeft="true" :isRight="true"
    :autofocus="props.autofocus" autocomplete="off" :ui="{
      wrapper: `container-oc-input-search relative sm:w-auto ${props.wrapper ?? ''}`,
      base: `input-search ${props.class ?? ''} ps-9 pe-9`,
      icon: {
        trailing: { wrapper: 'right-1.5 btn-cancel', pointer: '', size: lg },
        leading: { wrapper: 'px-3.5' },
      },
    }" @input="onSearch">
    <template #trailing>
      <!-- <UButton v-show="isNotEmpty(search)" color="gray" variant="link" icon="ri-close-circle-line" :padded="false"
        @click="onCancel" class="text-lg" :ui="{
          icon: { base: 'flex justify-center items-center text-[14px]' },
          inline: 'hover:no-underline',
        }" /> -->
      <div v-show="isNotEmpty(search)" @click="onCancel" class="text-lg cursor-pointer"> <i class="ri-close-circle-line"></i> </div>
    </template>
  </RInput>
</template>
<script setup>
const search = defineModel();
const emit = defineEmits(["onInput", "onCancel"]);
const props = defineProps(["autofocus", "class", "wrapper","placeholder"]);
const placeholder = computed(()=> props.placeholder ?? false)
const refOCInput = ref();
const tempSearch = ref()

let timeout;

function onSearch(e) {
  const query = e.target.value.trim();
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (tempSearch.value === query.toLowerCase()) return
    // Add your logic here, e.g., making an API call
    emit("onInput", query.toLowerCase());
    tempSearch.value = query.toLowerCase()
  }, 1000);
}

function onCancel() {
  if (tempSearch.value == '') return
  search.value = "";
  emit("onCancel", '');
  tempSearch.value = ''
}

function remoteData(s = "") {
  search.value = s;
}

function ocInput() {
  return refOCInput.value.ocInput();
}

defineExpose({ remoteData, ocInput });
</script>
<style lang="scss">
.input-search {
  height: 36px;
  width: 250px;
  border: none !important;
  box-shadow: none !important;
  border-radius: 10px !important;
  background: var(--bg-content) !important;
  height: 36px;

  &:focus {
    border: none !important;
    box-shadow: none !important;
  }

  &.line {
    border: 1px solid var(--color-w-b-4) !important;
    background: none ;

    &:focus {
      border: 1px solid var(--color-primary) !important;
      box-shadow: none !important;
    }
  }
}

.container-oc-input-search{
  .btn-cancel{
    right: 6px;
  }
}

.oc-content,
.oc-modal {
  .input-search {
    background: var(--bg-wrapper) !important;

    &:focus {
      border: none !important;
      box-shadow: none !important;
    }

    &.line {
      border: 1px solid var(--color-w-b-4) !important;
      background: none !important;

      &:focus {
        border: 1px solid var(--color-primary) !important;
        box-shadow: none !important;
      }
    }
  }
}
</style>
