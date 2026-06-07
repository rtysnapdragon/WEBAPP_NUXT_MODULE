<template>
  <UFormField
    :size="props.size ?? 'md'"
    :label="label"
    :name="props.name"
    :ui="ui"
    :required="required"
    :hint="hint"
    :error="error"
    :description="description"
    :help="help"
    :eager-validation="eagerValidation"
  >
    <template
      #label="{ error, label, name, hint, description, help }"
      v-if="$slots.label"
    >
      <slot
        name="label"
        v-bind="{ error, label, name, hint, description, help }"
      />
    </template>

    <template
      #hint="{ error, label, name, hint, description, help }"
      v-if="$slots.hint"
    >
      <slot
        name="hint"
        v-bind="{ error, label, name, hint, description, help }"
      />
    </template>

    <template
      #description="{ error, label, name, hint, description, help }"
      v-if="$slots.description"
    >
      <slot
        name="description"
        v-bind="{ error, label, name, hint, description, help }"
      />
    </template>

    <template #default="{ error, label, name, hint, description, help }">
      <slot
        name="default"
        v-bind="{ error, label, name, hint, description, help }"
      />
    </template>

    <template
      #help="{ error, label, name, hint, description, help }"
      v-if="$slots.help"
    >
      <slot
        name="help"
        v-bind="{ error, label, name, hint, description, help }"
      />
    </template>

    <template #error="{ error }" v-if="$slots.error">
      <slot name="error" v-bind="{ error }" />
    </template>
  </UFormField>
</template>

<script setup>
// import OCTooltip from "../OCTooltip.vue";

const props = defineProps([
  "label",
  "name",
  "required",
  "description",
  "ui",
  "error",
  "help",
  "hint",
  "eagerValidation",
  "size",
]);

const ui = computed(() => {
  const defaultUI = {
    wrapper: "",
    inner: "",
    label: {
      wrapper: "flex content-center items-center justify-between",
      base: "block font-normal text-[13px]  ocs-truncate color-w-b-2 ocs-input-focus",
      required:
        "after:content-['*'] after:ms-0.5 after:text-red-500 dark:after:text-red-400",
    },
    size: {
      "2xs": "text-xs",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-sm",
      lg: "text-sm",
      xl: "text-base",
    },
    container: "mt-1 no-relative",
    description: "text-gray-500 dark:text-gray-400",
    hint: "text-gray-500 dark:text-gray-400",
    help: "mt-2 text-gray-500 dark:text-gray-400",
    error: "mt-0 !text-xs text-red-500 dark:text-red-400",
    default: {
      size: "sm",
    },
  };

  const resultUI = {
    ...defaultUI,
    ...props.ui,
    label: {
      ...defaultUI.label,
      ...props.ui?.label,
    },
    size: {
      ...defaultUI.size,
      ...props.ui?.size,
    },
    default: {
      ...defaultUI.default,
      ...props.ui?.default,
    },
  };
  return resultUI;
});

const label = computed(() => props.label);
const required = computed(() => props.required);
const description = computed(() => props.description);
const help = computed(() => props.help);
const hint = computed(() => props.hint);
const error = computed(() => props.error);
const eagerValidation = computed(() => props.eagerValidation);
</script>

<style>
.ocs-input-focus:focus {
  --tw-ring-shadow: #ff5722 !important;
  border-color: #ff5722;
}

.no-relative {
  position: unset !important;
}
</style>
