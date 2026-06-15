<template>
  <UInput ref="refOCInput" v-model="value" v-model.nullable="value" :size="props.size ?? ' text-[12px]'" :name="props.name" :ui="ui" :type="type"
    :placeholder="placeholder" :loading="loading" :leading="leading" :loading-icon="loadingIcon" :trailing="trailing"
    :padded="padded" :icon="icon" :autofocus="autofocus" :autofocus-delay="autofocusDelay" :autocomplete="autocomplete"
    :leading-icon="leadingIcon" :trailing-icon="trailingIcon" :disabled="disabled" class="w-full"
    :inputClass="score ? 'ocs-input-score' : 'ocs-input'" @focus="(v) => emits('onFocus', v)"
    @blur="(v) => emits('onBlur', v)" @input="(v) => emits('onInput', v)" :min="min" :max="max">
    <!-- :inputClass="score ? 'ocs-input-score' : 'ocs-input'" @focus="(v) => emits('onFocus', v)" -->
    <template #leading v-if="$slots.leading">
      <slot name="leading" />
    </template>

    <template #trailing v-if="$slots.trailing">
      <slot name="trailing" class="right-[10px]" />
    </template>
    <!-- <template #trailing v-if="!$slots.trailing">
      <slot v-if="value?.length > 0" name="trailing" class="right-[10px]" />
    </template> -->

    <label v-if="floatingLabel" class="pointer-events-none absolute left-0 -top-2.5 text-highlighted text-xs font-medium px-1.5 transition-all peer-focus:-top-2.5 peer-focus:text-highlighted peer-focus:text-xs peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-dimmed peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
      <span class="inline-flex bg-default px-1">{{ floatingLabel }}</span>
    </label>
  </UInput>
</template>

<script setup>
const refOCInput = ref();
const value = defineModel();
const props = defineProps([
  "size",
  "name",
  "type", //file/search/text/password/number/textarea/checkbox/radio/switch/select/time/date
  "ui",
  "icon",
  "placeholder",
  "autofocus",
  "autofocusDelay",
  "loading",
  "leading",
  "trailing",
  "loadingIcon",
  "leadingIcon",
  "trailingIcon",
  "autocomplete",
  "disabled",
  "min",
  "max",
  "score",
  "isRight",
  "floatingLabel"
]);

const loading = computed(() => props.loading);
const trailing = computed(() => props.trailing);
const leading = computed(() => props.leading);
const type = computed(() => props.type);
const placeholder = computed(() => props.placeholder);
const autofocus = computed(() => props.autofocus);
const autofocusDelay = computed(() => props.autofocusDelay);
const loadingIcon = computed(() => props.loadingIcon);
const leadingIcon = computed(() => props.leadingIcon);
const trailingIcon = computed(() => props.trailingIcon);
const autocomplete = computed(() => props.autocomplete);
const padded = computed(() => props.padded);
const icon = computed(() => props.icon);
const min = computed(() => props.min);
const max = computed(() => props.max);
const score = computed(() => props.score);
const isRight = computed(() => props.isRight ?? false)
const floatingLabel = computed(() => props.floatingLabel)
const disabled = computed(() => props.disabled)

watch(value, (newValue) => {
  if (type.value === "number") {
    let formattedValue = newValue?.toString();
    formattedValue = formattedValue?.replace(/[^0-9.]/g, "");
    if (isEmpty(formattedValue)) return;
    const parts = formattedValue?.split(".");
    if (parts?.length > 2) {
      formattedValue = parts[0] + "." + parts[1];
    }
    if (parts[1]) {
      formattedValue = parts[0] + "." + parts[1]?.substring(0, 2);
    }
    value.value = formattedValue;
  }
});

// sinh
const emits = defineEmits(["onFocus", "onBlur", "onInput"]);

const ui = computed(() => {
  const defaultUI = {
    root: 'w-full relative inline-flex items-center',
    base:['trailing-padding leading-padding pr-12 pl-14.5 peer rounded-md border-0 appearance-none placeholder:text-dimmed disabled:cursor-not-allowed disabled:opacity-75','transition-colors'],
    wrapper: 'relative oc-input-wrapper',
    placeholder: "placeholder:text-[12px]",
    rounded: "",
    leadingIcon: 'text-[12px] text-gray-400',
    trailingIcon: 'text-[12px] text-gray-400',
    file: {
      base: "file:hidden",
    },
    size: {},
    gap: {
      xs: "gap-x-2",
    },
    padding: {
      xs: "px-3 py-2.5",
    },
    leading: {
      padding: {
        xs: "ps-10 leading-padding",
      },
    },
    trailing: {
      padding: {
        xs: "pe-20 trailing-padding",
      },
    },
    icon: {
      base: "flex justify-center items-center",
      size: {},
      leading: {
        wrapper: 'absolute inset-y-0 start-0 flex items-center position-right-custom text-[18px]',

      },
      trailing: {
        wrapper: `absolute inset-y-0 end-0 flex items-center position-right-custom position-${isRight.value ? `right` : ''} text-[18px]`,
      }
    },
  };

  const resultUI = {
    ...defaultUI,
    ...props.ui,
    file: {
      ...defaultUI.file,
      ...props.ui?.file,
    },
    size: {
      ...defaultUI.size,
      ...props.ui?.size,
    },
    gap: {
      ...defaultUI.gap,
      ...props.ui?.gap,
    },
    padding: {
      ...defaultUI.padding,
      ...props.ui?.padding,
    },
    leading: {
      ...defaultUI.leading,
      ...props.ui?.leading,
      padding: {
        ...defaultUI.leading.padding,
        ...props.ui?.leading?.padding,
      },
    },
    trailing: {
      ...defaultUI.trailing,
      ...props.ui?.trailing,
      padding: {
        ...defaultUI.trailing.padding,
        ...props.ui?.trailing?.padding,
      },
    },
    icon: {
      ...defaultUI.icon,
      ...props.ui?.icon,
      size: {
        ...defaultUI.icon.size,
        ...props.ui?.icon?.size,
      },
      leading: {
        ...defaultUI.icon.leading,
        ...props.ui?.icon?.leading,
      },
      trailing: {
        ...defaultUI.icon.trailing,
        ...props.ui?.icon?.trailing,
      },
    },
  };
  return resultUI;
});

function ocInput() {
  return refOCInput.value;
}

defineExpose({ ocInput });
</script>

<style lang="scss">
.oc-input-wrapper {
  .position-right-custom {
    right: 12px;
  }
  .position-right {
    right: 5px !important;
  }
}

.loader {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-w-b-3);
  border-bottom-color: var(--color-w-b-2);
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

[type="text"] {
  &::placeholder {
    color: var(--color-w-b-3) !important;
  }
}

// work for trailing and leading icon of UInput
[data-slot="leading"] {
  padding-left: 12px !important;
}

[data-slot="trailing"] {
  padding-right: 12px !important;
}

//work for rinput
//make space for leading icon
[data-slot="base"] {
  padding-left: 30px !important;
}

// .leading-padding{
//   padding-left: 12px !important;
// }

// .trailing-padding{
//   padding-right: 40px !important;
// }

.ocs-input {
  box-shadow: none !important;
  border: 1px solid var(--color-w-b-4) !important;
  border-radius: 8px !important;
  font-size: 14px;
  color: var(--color-w-b-1);
  height: 38px;
  width: 100%;
  padding-right: 42px !important;
  background-color: transparent !important;

  &:focus {
    border: 1px solid var(--color-primary) !important;
  }
  
  // &:focus-visible{
  //   outline: 1px solid var(--color-primary) !important;
  // }

  &:disabled {
    background: var(--bg-wrapper-50) !important;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
}

.ocs-input-score {
  box-shadow: none !important;
  border: 1px solid var(--color-w-b-4) !important;
  border-radius: 8px !important;
  text-align: end !important;
  font-size: 14px;
  color: var(color-w-b-1);
  background-color: transparent !important;
  width: 100%;

  &:focus {
    border: 1px solid var(--color-primary) !important;
  }

  // &:focus-visible{
  //   outline: 1px solid var(--color-primary) !important;
  // }

  &:disabled {
    background: var(--bg-wrapper-50) !important;
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
}
</style>
