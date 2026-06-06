<template>
  <USlideover v-model="isOpen" :side="side" :ui="ui" :transition="transition" :overlay="overlay"
    :prevent-close="preventClose" :appear="appear">
    <div class="oc-drawer-container" ref="refWrapperOCDrawer">
      <div class="oc-drawer-header" v-if="$slots.header">
        <slot name="header" />
        <i class="ri-close-fill text-[16px] cursor-pointer" @click="closed"></i>
      </div>
      <div ref="refOCDrawerBody" class="oc-drawer-body "
        :class="hasScroll ? 'drawer-has-scroll isScroll ocs-scroll' : ''">
        <slot />
      </div>
      <div class="oc-drawer-footer" v-if="$slots.footer">
        <slot name="footer" />
      </div>
    </div>
  </USlideover>
</template>

<script setup>
const isOpen = defineModel();
const props = defineProps([
  "ui",
  "transition",
  "overlay",
  "preventClose",
  "side",
  "appear",
  "isScroll",
  "class",
]);
const emit = defineEmits(["closed"]);

const ui = computed(() => {
  const defaultUI = {
    overlay: {
      base: "!transition-transform",
      background: "bg-overlay",
      transition: {
        enter: "!ease-in-out !duration-[400ms]",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "!ease-in-out !duration-[400ms]",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0",
      },
    },
    base: `relative flex-1 flex flex-col w-full focus:outline-none ${props.class}`,
    background: "color-bg-content",
    ring: "",
    rounded: "",
    padding: "",
    shadow: "shadow-none",
    width: `max-w-sm ${props.class}`,
    transition: {
      enter: "!transform !transition !duration-[250ms]",
      leave: "!transform !transition !duration-200",
    },
    translate: {
      base: "translate-x-0",
      left: "-translate-x-full rtl:translate-x-full",
      right: "translate-x-full rtl:-translate-x-full",
    },
  };

  const resultUI = {
    ...defaultUI,
    ...props.ui,

    transition: {
      ...defaultUI.transition,
      ...props.ui?.transition,
    },
    translate: {
      ...defaultUI.translate,
      ...props.ui?.translate,
    },
    overlay: {
      ...defaultUI.overlay,
      ...props.ui?.overlay,
      transition: {
        ...defaultUI.overlay.transition,
        ...props.ui?.overlay?.transition,
      },
    },
  };

  return resultUI;
});

const transition = computed(() => props.transition);
const overlay = computed(() => props.overlay);
const preventClose = computed(() => props.preventClose);
const side = computed(() => props.side);
const appear = computed(() => props.appear);

const refWrapperOCDrawer = ref();

const refOCDrawerBody = ref();
const hasScroll = ref(false);

onMounted(async () => {
  await nextTick(); // Ensure DOM is fully rendered
  observeBody(); // Initial check


});

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll);
});

watch(() => isOpen.value, (n) => {
  // console.log('====>>> watch', n)
  if (n) {
    setTimeout(() => {
      observeBody(); // Initial check
    }, 100);

  } else {
    window.removeEventListener('resize', checkScroll);
  }
})

function observeBody() {
  if (!refOCDrawerBody.value) return;
  checkScroll()
  window.addEventListener('resize', checkScroll);
}


function checkScroll() {
  const wrapper = refWrapperOCDrawer.value;
  const body = refOCDrawerBody.value;

  if (!wrapper || !body) return;

  const header = wrapper.querySelector('.oc-drawer-header');
  const footer = wrapper.querySelector('.oc-drawer-footer');

  const headerHeight = header?.getBoundingClientRect().height || 0;
  const footerHeight = footer?.getBoundingClientRect().height || 0;
  const bodyHeight = body.getBoundingClientRect().height;

  const availableHeight = window.innerHeight - headerHeight - footerHeight;

  hasScroll.value = bodyHeight > availableHeight || bodyHeight > 400;
  // console.log('===>>>', hasScroll.value)
}

function closed() {
  isOpen.value = false;
  emit("closed");
}
</script>

<style lang="scss">
.oc-drawer-overlay {
  background: var(--bg-wrapper-50) !important;
}

.oc-drawer-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;

  .oc-drawer-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    min-height: 50px;
    padding: 0 20px;
    font-size: 14px;
    font-family: var(--font-500);
  }

  .oc-drawer-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2px 20px !important; // 11px 20px 11px 20px
    max-height: 100%;
    padding: 0 20px;
    overflow-y: auto;

    &.isScroll {
      // this class add auto
      overflow-y: auto;

      &::-webkit-scrollbar-thumb {
        border: 3px solid var(--bg-content);
      }

      &:hover::-webkit-scrollbar-thumb {
        background-color: var(--color-w-b-3) !important;
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-w-b-2) !important;
      }
    }

    &.drawer-has-scroll {
      padding: 0 11px 0px 20px;
      overflow-y: auto;
    }
  }

  .oc-drawer-footer {
    display: flex;
    align-items: center;
    justify-content: end;
    min-height: 71px;
    padding: 0px 20px;
    grid-gap: 6px;
  }
}
</style>
