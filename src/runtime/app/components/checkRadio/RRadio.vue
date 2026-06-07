<template>
  <URadio
    v-model="select"
    :ui="ui"
    :label="label"
    :name="name"
    :help="help"
    :required="required"
    :disabled="disabled"
    :value="value"
    v-bind="$attrs"
  />
</template>

<script setup>
const select = defineModel();
const props = defineProps([
  "ui",
  "label",
  "name",
  "help",
  "required",
  "value",
  "disabled",
  "modeCheckBox",
]);

const ui = computed(() => {
  const defaultUI = {
    wrapper: "relative flex items-start",
    container: "flex items-center h-5",
    base: "h-4 w-4",
    form: "",
    color: "",
    background: "",
    border: "",
    ring: "",
    inner: "ms-3 flex flex-col",
    label: "text-xs font-normal color-w-b-1 line-clamp-1",
    required: "text-xs text-red-500 dark:text-red-400",
    help: "text-xs text-gray-500 dark:text-gray-400",
    default: {
      color: "",
    },
  };

  if (props.modeCheckBox) {
    defaultUI.base = "h-4 w-4 oc-checkbox";
  } else {
    defaultUI.base = "h-4 w-4 oc-radio";
  }

  const resultUI = { ...defaultUI, ...props.ui };

  return resultUI;
});

const label = computed(() => props.label);
const name = computed(() => props.name);
const help = computed(() => props.help);
const required = computed(() => props.required);
const value = computed(() => props.value);
const disabled = computed(() => props.disabled);
</script>

<style lang="scss">
input[type="radio"] {
  &.oc-radio {
    position: relative;
    visibility: hidden;
    // width: 20px;
    // height: 20px;
    width: 18px;
    height: 18px;

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
