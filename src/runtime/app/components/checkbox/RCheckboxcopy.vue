<template>
  <UCheckbox v-model="select" :ui="ui" :label="label" :name="props.name" :help="help" :required="props.required"  :indeterminate="indeterminate"
    :disabled="disabled" :value="value" v-bind="$attrs" :id="id"
    :inputClass="['oc-checkbox  ', disabled || disabled == '' ? '!cursor-not-allowed' : '', indeterminate && 'minus']">
    <template #label v-if="$slots.label">
      <slot name="label" />
    </template>
  </UCheckbox>
</template>

<script setup>
const select = defineModel()
const props = defineProps(['ui', 'label', 'name', 'help', 'required', 'value', 'disabled', 'id',   'indeterminate'])

const ui = computed(() => {
  const defaultUI = {
    wrapper: 'w-full relative flex items-center gap-1.5',
    container: 'flex items-center h-5',
    base: 'r-checkbox-base rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-3 h-4 w-4 focus-visible:!ring-0 focus:!ring-0',
    indicator: 'flex items-center justify-center size-full text-inverted',
    icon: 'shrink-0 size-full',
    form: '',
    color: '',
    background: '',
    border: '',
    ring: '',
    inner: 'ms-0 flex flex-col',
    label: 'block font-medium text-default text-xs font-normal color-w-b-1 line-clamp-1 cursor-pointer',
    required: 'text-xs text-red-500 dark:text-red-400',
    help: 'text-xs text-gray-500 dark:text-gray-400',
    root: 'relative flex items-start',
    description: 'text-muted',
    default: {
      color: '',
    },
  }
  const resultUI = { ...defaultUI, ...props.ui }

  return resultUI
})

const label = computed(() => props.label)
const help = computed(() => props.help)
const value = computed(() => props.value)
const disabled = computed(() => props.disabled)
// const name = computed(() => props.name)
const id = computed(() => props.id)

mounted(() => {

})
</script>

<style lang="scss">
$oc-checkbox-padding: 6px;

.r-checkbox-base{
  border: 2px solid #c3c3c3 !important;
  width: 15px ! important;
  height: 15px !important;
}

input[type='checkbox'] {
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

    &:focus::after {
      content: '';
      position: absolute;
      top: -$oc-checkbox-padding;
      bottom: -$oc-checkbox-padding;
      left: -$oc-checkbox-padding;
      right: -$oc-checkbox-padding;
      border: 2px solid var(--color-primary);
      border-radius: 9px;
      box-sizing: content-box;
    }

    &:checked {
      background-color: transparent;
      color: var(--color-primary) !important;
      border-color: var(--color-primary) !important;
    }

    &:checked::before {
      color: var(--color-primary) !important;
      transform: scale(1.1);
      font-weight: bold;
      opacity: 1;
    }

    &::before {
      content: '\eb7a' !important;
      font-family: 'remixicon' !important;
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
        content: '\f1ae' !important;
      }
    }
  }
}
</style>
