<template>
  <URadioGroup
    v-model="select"
    :ui="ui"
    :ui-radio="uiRadio"
    :options="options"
    :value-attribute="valueAttribute"
    :option-attribute="optionAttribute"
    :disabled="disabled"
    :mode-check-box="modeCheckBox"
    @change="(v)=>emit('onChange',v)"
  >
    <template #label="{ option }" v-if="$slots.label">
      <slot name="label" v-bind="{ option }" />
    </template>
  </URadioGroup>
</template>

<script setup>
// const { label } = useSlots()
const select = defineModel();
const props = defineProps([
  "ui",
  "uiRadio",
  "options",
  "disabled",
  "optionAttribute",
  "valueAttribute",
  "modeCheckBox",
]); // modeCheckBox true or false

const ui = computed(() => {
  const defaultUI = {
    wrapper:
      "relative flex items-center flex-wrap px-3 pt-2 pb-2 border-color-input ocs-rounded-m max-h-[38px] h-[40px]",
    fieldset: "flex flex-wrap items-center gap-x-5 gap-y-3",
  };

  const resultUI = { ...defaultUI, ...props.ui };

  return resultUI;
});

const uiRadio = computed(() => {
  const defaultUIRadio = {
    wrapper: "relative flex items-center space-x-1",
    container: "flex items-center h-5",
    base: "h-4 w-4",
    form: "form-radio",
    background: "bg-transparent dark:bg-transparent",
    border: "border-color-input",
    ring: "",
    inner: "",
    label: "text-xs font-normal color-w-b-1 line-clamp-1",
    required: "",
    help: "",
  };

  if (props.modeCheckBox) {
    defaultUIRadio.base = "h-4 w-4 oc-checkbox";
  } else {
    defaultUIRadio.base = "h-4 w-4 oc-radio";
  }

  const resultUIRadio = { ...defaultUIRadio, ...props.uiRadio };

  return resultUIRadio;
});

const options = computed(() => props.options);
const disabled = computed(() => props.disabled);
const optionAttribute = computed(() => props.optionAttribute);
const valueAttribute = computed(() => props.valueAttribute);

// Sinh
const emit = defineEmits(["onChange"]);

// watch(
//   select,
//   (n, o) => {
//     emit("onChange", n)
//   },
//   { deep: true, immediate: true }
// );
</script>

<style lang="scss">
$oc-checkbox-padding: 6px;

// .ocs-radio-group {
//   border: 1px solid var(--color-w-b-4) !important;
// }

input[type="radio"] {
  &.oc-radio {
    position: relative;
    visibility: hidden;
    // width: 20px;
    // height: 20px;
    width: 16px;
    height: 16px;

    &:checked {
      background-image: none !important;
      background-color: transparent !important;

      &::before {
        content: "";
        visibility: visible;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: transparent !important;
        border: 2px solid var(--color-primary) !important;
        border-radius: 10px;
      }

      &::after {
        visibility: visible;
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1;
        transform: translate(-50%, -50%) scale(1);
        // width: 10px;
        // height: 10px;
        width: 8px;
        height: 8px;
        background-color: var(--color-primary);
        border-radius: 100%;
      }
    }

    &::before {
      content: "";
      visibility: visible;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: transparent !important;
      border: 2px solid #c3c3c3 !important;
      border-radius: 10px;
    }

    &::after {
      visibility: hidden;
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 1;
      transform: translate(-50%, -50%) scale(0);
      width: 10px;
      height: 10px;
      background-color: var(--color-primary);
      border-radius: 100%;
      transition: all 0.2s ease;
    }
  }
}

input[type="radio"] {
  &.oc-checkbox {
    all: unset;
    position: relative;
    margin: unset;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;

    position: relative;
    border: 2px solid;
    border-color: #c3c3c3;
    border-radius: 5px;
    outline: 0;
    cursor: pointer;
    transition: all 0.2s ease;
    height: 15px;
    width: 15px;
    margin-top: 0;

    // &:focus::after {
    //   content: '';
    //   position: absolute;
    //   top: -$oc-checkbox-padding;
    //   bottom: -$oc-checkbox-padding;
    //   left: -$oc-checkbox-padding;
    //   right: -$oc-checkbox-padding;
    //   border: 2px solid var(--color-primary);
    //   border-radius: 9px;
    //   box-sizing: content-box;
    // }

    &:checked {
      background-color: transparent;
      color: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
      background-image: none !important;
    }

    &:checked::before {
      color: var(--color-primary) !important;
      transform: scale(1.1);
      font-weight: bold;
      opacity: 1;
    }

    &::before {
      content: "\eb7a" !important;
      font-family: "remixicon" !important;
      font-size: 9px;
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 2px;
      right: 2px;
      border-radius: 5px;
      background: 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s var(--ocs-curve);
      transform: scale(0);
      line-height: 16px;
      font-weight: bold !important;
    }

    &.minus {
      &::before {
        content: "\f1ae" !important;
      }
    }
  }
}
</style>
