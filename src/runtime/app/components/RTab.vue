<template>
  <UTabs ref="refOCTab" v-model="model" :items="items" :orientation="orientation" :default-index="defaultIndex" :ui="ui"
    :variant="props.variant" @change="onChangeTab">
    <template #default="{ item, index, selected, disabled }">
      <slot name="default" v-bind="{ item, index, selected, disabled }" />
    </template>

    <template #item="{ item, index, selected, disabled }">
      <slot name="item" v-bind="{ item, index, selected, disabled }" />
    </template>

    <template v-for="r in templateRender" :key="r" #[r]="{ item, index, selected }" class="">
      <slot :name="r" v-bind="{ item, index, selected }"></slot>
    </template>
  </UTabs>
</template>

<script setup>
//for clear route
// const fullPath = useRoute().fullPath;
// const parameter = fullPath?.split("?")[1];
// const router = useRouter();
// if (parameter) {
//   router.replace(fullPath?.split("?")[0]);
// }
/////////////////////////////////

const model = defineModel();
const props = defineProps([
  "ui",
  "orientation",
  "defaultIndex",
  "items",
  "isObject",
  "NotClearRoute",
  "variant"
]);
const NotClearRoute = computed(() => props.NotClearRoute ?? false);
const emits = defineEmits(["onChange"]);

watch(
  () => NotClearRoute.value,
  (n, o) => {
    if (!n) {
      const fullPath = useRoute().fullPath;
      const parameter = fullPath?.split("?")[1];
      const router = useRouter();
      if (parameter) {
        router.replace(fullPath?.split("?")[0]);
      }
    }
  },
  { deep: true, immediate: true }
);

const ui = computed(() => {
  const vertical = props.orientation;

  const defaultUI = {
    wrapper: "relative space-y-4",
    list: {
      base: `${vertical === "vertical" ? "space-y-1.5" : "!flex gap-1.5 nav-oc-tab"
        }`,
      background: "bg-transparent dark:bg-transparent",
      padding: "p-0",
      width: "",
      height: "h-full",
      rounded: "",
      tab: {
        base: `relative ${vertical === "vertical" ? "" : "w-fit"} ease-in-out`,
        background: "",
        active: "tab-bg-active text-white",
        inactive: "color-sub-text",
        rounded: "ocs-rounded",
        height: "h-8",
        font: "font-normal !tracking-normal",
      },
      marker: {
        wrapper:
          "focus-visible:!outline-0 focus-visible:!border-0 ease-in-out !h-8",
        base: "focus-visible:!outline-0 focus-visible:!border-0",
        background: "tab-bg-active-marker",
        rounded: "ocs-rounded",
        shadow: "!shadow-none",
      },
    },
  };

  return {
    ...defaultUI,
    ...props.ui,
    list: {
      ...defaultUI.list,
      ...props.ui?.list,
      tab: {
        ...defaultUI.list.tab,
        ...props.ui?.list?.tab,
      },
    },
  };
});

const isObject = computed(() =>
  isNotEmpty(props.isObject) ? props.isObject : false
);

const orientation = computed(() => props.orientation);
const defaultIndex = computed(() => props.defaultIndex);
const items = computed(() => props.items);
const templateRender = computed(() =>
  items.value.filter((e) => e.slot).map((e) => e.slot)
);
const onChangeTab = (index) => {
  if (isObject.value) emits("onChange", items.value[index]);
  else emits("onChange", index);
};
const refOCTab = ref();

function OCTab() {
  return refOCTab.value;
}
defineExpose({
  OCTab,
  jumpTo: (index) => {
    model.value = index;
  },
  disabled: (index, disabled) => {
    items.value.filter((v, i) =>
      i == index ? (v.disabled = disabled) : (v.disabled = false)
    );
  },
});
</script>

<style lang="scss">
.tab-bg-default {
  background-color: var(--bg-wrapper);
  letter-spacing: 0px !important;
}

.tab-bg-active-marker {
  background-color: var(--color-primary) !important;
}

.nav-oc-tab {
  display: flex !important;
  gap: 0.375rem !important; // 1.5 in Tailwind is 0.375rem
  overflow-x: auto; // Maintain scrollability
  overflow-y: hidden;

  // &::-webkit-scrollbar {
  //   display: none !important; // Hide scrollbar on mobile
  // }

  @media (max-width: 540px) {
    &::-webkit-scrollbar {
      display: none !important; // Hide scrollbar on mobile
    }
  }
}
</style>
