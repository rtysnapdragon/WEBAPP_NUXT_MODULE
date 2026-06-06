<template>
  <UForm ref="refOcForm" :validate="validate" :schema="schema" :state="state" @submit="onSubmit" @error="onError">
    <slot />
  </UForm>
</template>
<script setup>
const props = defineProps(["schema", "validate", "state"])
const emit = defineEmits(["onSubmit", "onInput", "onError"]);
const schema = computed(() => props.schema);
const validate = computed(() => props.validate);
const state = computed(() => props.state);
const refOcForm = ref();

defineExpose({ ocForm, submit, clearValidate });

mounted(() => { });

async function onSubmit(event) {
  emit("onSubmit", event);
}

async function onError(event) {
  emit("onError", event);
}

function submit() {
  refOcForm.value.submit();
}
function clearValidate() {
  refOcForm.value.clear();
}
function ocForm() {
  return refOcForm.value
}
</script>
