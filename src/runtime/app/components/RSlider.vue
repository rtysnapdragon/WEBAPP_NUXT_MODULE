<template>
  <!--
    .r-slider-host is the only element that lives INSIDE this component's
    scoped DOM tree. We use it as a CSS custom-property carrier and as the
    namespace anchor for the global (non-scoped) style block below.
  -->
  <div class="r-slider-host" :class="sliderScreenMode === 'bottom' ? 'r-slider-host--bottom' : ''">
    <USlideover
      v-model:open="isOpen"
      :side="sliderScreenMode"
      :ui="mergedUI"
      :transition="transition"
      :overlay="overlay ?? true"
      :dismissible="dismissible ?? true"
      :prevent-close="preventClose"
      :close="{
        icon: closeIcon || 'ri-close-line',
        color: 'neutral',
        variant: 'ghost'
      }"
    >
      <!-- #header slot — lives in the portal but we own the markup -->
      <template #header>
        <slot name="header">
          <div class="rs-header">
            <div class="rs-header__left">
              <i v-if="icon" :class="[icon, 'rs-header__icon']" />
              <div>
                <h3 v-if="title" class="rs-header__title">{{ title }}</h3>
                <p v-if="description" class="rs-header__desc">{{ description }}</p>
              </div>
            </div>
            <button class="rs-header__close" aria-label="Close" @click="closed">
              <i class="ri-close-line" />
            </button>
          </div>
        </slot>
      </template>

      <!-- #body slot -->
      <template #body>
        <div
          ref="refRDrawerBody"
          class="rs-body"
          :class="{ 'rs-body--scroll': hasScroll }"
        >
          <slot />
        </div>
      </template>

      <!-- #footer slot — only renders when parent provides content -->
      <template v-if="$slots.footer" #footer>
        <div class="rs-footer">
          <slot name="footer" />
        </div>
      </template>
    </USlideover>
  </div>
</template>

<script setup>
import { useScreenStore } from '../stores/screen'

const screen = useScreenStore()

/* ── model + props ── */
const isOpen = defineModel()

const props = defineProps({
  title:        { type: String,  default: undefined },
  description:  { type: String,  default: undefined },
  icon:         { type: String,  default: undefined },
  closeIcon:    { type: String,  default: undefined },
  side:         { type: String,  default: 'right'   }, // 'left' | 'right' | 'top' | 'bottom'
  width:        { type: Number,  default: undefined }, // px, desktop only
  maxWidth:     { type: Number,  default: 500       }, // px
  transition:   { type: Boolean, default: true      },
  overlay:      { type: Boolean, default: true      },
  dismissible:  { type: Boolean, default: true      },
  preventClose: { type: Boolean, default: false     },
  isScroll:     { type: Boolean, default: false     },
  ui:           { type: Object,  default: () => ({}) },
})

const emit = defineEmits(['closed'])

/* ── computed ── */
const sliderScreenMode = computed(() =>
  screen.isMobile ? 'bottom' : (props.side || 'right')
)

/*
 * Bug 2 fix: build overlay merge safely — defaultUI.overlay was '' (string),
 * so spread of ...props.ui?.overlay?.transition crashed silently.
 * Now overlay is always an object before merging.
 */
const mergedUI = computed(() => {
  const isMobile = screen.isMobile

  const base = {
    // content gets our class so the global SCSS can target it
    content: [
      'rs-content',
      isMobile ? 'rs-content--bottom' : '',
    ],
    // Bug 3 fix: header/body/footer ui values must be plain strings in NuxtUI v4 tv()
    header:  'rs-ui-header w-full',
    body:    'rs-ui-body w-full',
    footer:  'rs-ui-footer gap-0 p-1 sm:px-1 w-full',
    overlay: 'rs-overlay',
  }

  // Safe merge — never spread a non-object
  const userUI     = props.ui && typeof props.ui === 'object' ? props.ui : {}
  const userOverlay = userUI.overlay && typeof userUI.overlay === 'object' ? userUI.overlay : {}

  return {
    ...base,
    ...userUI,
    // keep overlay as merged object, never spread a string
    overlay: {
      ...userOverlay,
    },
  }
})

/* ── scroll detection ── */
// Bug 4 fix: refWrapperOCDrawer was declared but never bound to a template element.
// We don't need it — body height vs viewport is enough.
const refRDrawerBody = ref(null)
const hasScroll      = ref(false)

function checkScroll() {
  const body = refRDrawerBody.value
  if (!body) return
  // Compare natural scroll height to visible client height
  hasScroll.value = body.scrollHeight > body.clientHeight
}

function observeBody() {
  if (!refRDrawerBody.value) return
  checkScroll()
  window.addEventListener('resize', checkScroll, { passive: true })
}

onMounted(async () => {
  await nextTick()
  observeBody()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
})

// Bug 5 fix: 'appear' removed — not a USlideover prop, was silently ignored.
watch(isOpen, (open) => {
  if (open) {
    setTimeout(observeBody, 120)   // wait for portal paint
  } else {
    window.removeEventListener('resize', checkScroll)
    hasScroll.value = false
  }
})

function closed() {
  isOpen.value = false
  emit('closed')
}
</script>

<!--
  SCOPED block — only for the HOST element (.r-slider-host).
  CSS custom properties set here flow into the portal via var() inheritance
  because the portal content reads vars from :root / body, and we set them
  on .r-slider-host which is an ancestor in the *cascade* (not DOM) sense.
  All actual portal element styling is in the GLOBAL block below.
-->
<style lang="scss" scoped>
.r-slider-host {
  // Expose token overrides as custom props so the global block can read them
  --rs-width:      v-bind("props.width ? props.width + 'px' : '420px'");
  --rs-max-width:  v-bind("props.maxWidth ? props.maxWidth + 'px' : '500px'");
  display: contents; // host div adds zero layout impact
}
</style>

<!--
  GLOBAL (non-scoped) block — targets the teleported portal DOM.
  
  WHY NOT SCOPED?
  USlideover uses <DialogPortal> which teleports to document.body.
  Vue's scoped CSS adds a [data-v-xxxxxx] attribute to elements inside
  the component's own DOM subtree. The teleported elements are OUTSIDE
  that subtree, so Vue never stamps the scoped attribute on them.
  Result: every :deep() rule in a scoped block simply never matches.

  FIX: Use a non-scoped block, namespaced by .rs-content (our custom class
  injected via the ui prop) so we never accidentally leak styles globally.
-->
<style lang="scss">
/* ── overlay ── */
.rs-overlay {
  background: color-mix(in srgb, var(--c-bg) 60%, transparent) !important;
  backdrop-filter: blur(4px);
}

/* ── content panel (the sliding drawer itself) ── */
.rs-content {
  // Layout
  display: flex;
  flex-direction: column;
  width: var(--rs-width, 420px) !important;
  max-width: var(--rs-max-width, 500px) !important;
  height: 100dvh;

  // SARIKA surface
  background: var(--glass-bg) !important;
  backdrop-filter: var(--glass-blur) !important;
  -webkit-backdrop-filter: var(--glass-blur) !important;
  color: var(--c-text) !important;
  border-left: 1px solid var(--c-border);
  box-shadow: var(--glass-shadow) !important;

  // radius token (consumed by NuxtUI internally via --ui-radius)
  --ui-radius: var(--r-xl);

  // Zero out NuxtUI's default slot padding — we control it per-slot
  [data-slot="header"],
  [data-slot="body"],
  [data-slot="footer"] {
    padding: 0 !important;
  }
}

/* bottom-sheet variant (mobile) */
.rs-content--bottom {
  width: 100vw !important;
  max-width: 100vw !important;
  height: auto !important;
  max-height: 92dvh;
  border-left: none;
  border-top: 1px solid var(--c-border);
  border-radius: var(--r-xl) var(--r-xl) 0 0 !important;
}

/* ── NuxtUI slot wrappers (string classes we inject via ui prop) ── */
.rs-ui-header {
  // NuxtUI wraps our #header slot content with this element
  padding: 0 !important;
  border-bottom: 1px solid var(--c-border);
  min-height: 0 !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.rs-ui-body {
  flex: 1;
  padding: 0 !important;
  overflow: hidden; // scroll controlled by rs-body inside
}

.rs-ui-footer {
  padding: 0 !important;
  width: 100% !important;
  display: flex !important;
  border-top: 1px solid var(--c-border);
  justify-content: flex-end !important;
  align-items: center !important;
}

/* ── our own header markup (inside the #header slot) ── */
.rs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  min-height: 64px;
  font-family: var(--font-400);
  width: 100% !important;

  &__left {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    min-width: 0;
  }

  &__icon {
    font-size: 20px;
    color: var(--c-accent);
    flex-shrink: 0;
    filter: drop-shadow(var(--glow-text));
  }

  &__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--c-text);
    line-height: 1.3;
  }

  &__desc {
    margin: 2px 0 0;
    font-size: 0.78rem;
    color: var(--c-muted);
    line-height: 1.4;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--r-full);
    border: none;
    background: transparent;
    color: var(--c-muted);
    font-size: 18px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--t-fast) var(--ease-out), color var(--t-fast) var(--ease-out);

    &:hover {
      background: var(--c-hover);
      color: var(--c-text);
    }
  }
}

/* ── body content area ── */
.rs-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--sp-5);
  overflow: hidden;
  padding: 8px 15px;

  // Bug 4 fix: scroll detection now works — class is toggled via checkScroll()
  &--scroll {
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: calc(var(--sp-5) - 4px); // compensate for scrollbar

    // SARIKA scrollbar
    scrollbar-width: thin;
    scrollbar-color: var(--color-w-b-3) transparent;

    &::-webkit-scrollbar        { width: 4px; }
    &::-webkit-scrollbar-track  { background: transparent; }
    &::-webkit-scrollbar-thumb  {
      background: var(--color-w-b-3);
      border-radius: var(--r-full);
    }
    &::-webkit-scrollbar-thumb:hover {
      background: var(--color-w-b-2);
    }
  }
}

/* ── footer content area ── */
.rs-footer {
  display: flex !important;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  min-height: 56px;
}

/* ── dark mode adjustments ── */
.dark .rs-content {
  border-left-color: var(--c-border);
  box-shadow: 0 0 0 1px var(--c-border), var(--glass-shadow);
}

.dark .rs-content--bottom {
  border-top-color: var(--c-border);
}
</style>