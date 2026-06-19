<template>
  <div class="oc-checkbox-group-container ocs-rounded-m" :class="isBorder ? 'oc-border' : ''">
    <RCheckbox v-model="checkbox" v-for="(option, i) in options" :label="option.label"
      :id="`${isNotEmpty(option.id) ? option.id : option.pk ? option.pk : option.value}${i}`" v-bind="option"
      :disabled="disabled || option.disabled" :name="props.name" :ui="ui" class="flex gap-1.5">
      <template #label v-if="$slots.label">
        <slot name="label" v-bind="option" />
      </template>
    </RCheckbox>
  </div>
</template>

<script setup>
const checkbox = defineModel();
const props = defineProps(["options", "disabled", "name", "ui", "isBorder"]);
const options = computed(() => props.options);
const disabled = computed(() => props.disabled);
const ui = computed(() => props.ui);
const isBorder = computed(() => props.isBorder ?? true)
mounted(() => { });
</script>

<style lang="scss" scoped>
.oc-checkbox-group-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;

  &.oc-border {
    border: 1px solid var(--color-w-b-4);
    padding: 8px 12px;
  }

  padding-top: 8px;
  padding-bottom:8px;
  padding-left: unset;
  padding-right: unset;
}
</style>
