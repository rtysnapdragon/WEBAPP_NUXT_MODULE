<!-- components/global/RBreadcrumb.vue -->
<!--
  Standalone breadcrumb strip.

  Props (all optional — falls back to useBreadcrumb state):
    items          – array of RHeaderBreadcrumbItem
    show-back      – show back arrow
    back-tooltip   – tooltip text on back button
    back-action    – () => void — override default router.back()
    separator-icon – lucide / heroicons icon name

  Slots:
    actions        – right-side action buttons; shown only when hasAction prop = true

  Usage A — purely via composable (set in page setup):
    <RBreadcrumb />

  Usage B — inline props:
    <RBreadcrumb
      :items="[{ label: 'Home', to: '/' }, { label: 'Users' }]"
      show-back
      back-tooltip="Go back"
    />

  Usage C — with actions slot (hasAction must be true):
    <RBreadcrumb has-action>
      <template #actions>
        <UButton label="Save" />
      </template>
    </RBreadcrumb>
-->

<script setup>
const props = defineProps({
  // Breadcrumb items — if omitted, reads from useBreadcrumb state
  items:       { type: Array, default: undefined },
  // Back button
  showBack:    { type: Boolean, default: undefined },
  backTooltip: { type: String, default: undefined },
  backAction:  { type: Function, default: undefined },
  // Separator icon
  separatorIcon: { type: String, default: undefined },
  // When true the #actions slot is rendered
  hasAction:   { type: Boolean, default: false },
})

const router  = useRouter()
const crumb   = useBreadcrumb()
const { t }   = useI18n()

// ── Resolved values (prop wins over state) ────────────────────────────────────
const titleComputed = computed(() =>
  crumb.data.value.title,
)

const subtitleComputed = computed(() =>
  crumb.data.value.subtitle,
)

const resolvedItems = computed(() =>
  props.items ?? crumb.data.value.items ?? [],
)

const resolvedShowBack = computed(() => {
  if (props.showBack !== undefined) return props.showBack
  return crumb.data.value.hasBack ?? false
})

const resolvedBackTooltip = computed(() =>
  props.backTooltip ?? crumb.data.value.backTooltip ?? t('back'),
)

const resolvedSeparator = computed(() =>
  props.separatorIcon ?? crumb.data.value.separatorIcon ?? 'i-lucide-chevron-right',
)

// ── Back action — prop → state → router.back() ────────────────────────────────

const handleBack = () => {
  const fn = props.backAction ?? crumb.data.value.fnBack
  if (typeof fn === 'function') {
    fn()
  } else {
    router.back()
  }
}

// ── Dropdown items builder ────────────────────────────────────────────────────

const mapChildren = (children) => {
  if (!children?.length) return []
  return [
    children.map((child) => ({
      label:    child.label,
      icon:     child.icon,
      disabled: child.disabled ?? false,
      onSelect: () => {
        if (typeof child.onClick === 'function') {
          child.onClick()
          return
        }
        if (child.to) navigateTo(child.to)
      },
    })),
  ]
}

// ── Visibility ────────────────────────────────────────────────────────────────

const hasContent = computed(() =>
  resolvedShowBack.value || resolvedItems.value.length > 0,
)
</script>

<template>
  <div
    v-if="hasContent || (hasAction && $slots.actions)"
    class="rbc"
  >
    <!-- LEFT: back + items -->
    <div class="rbc-left">
      <!-- Title -->
      <div class="rbc-text">
        <h1
          v-if="titleComputed"
          class="rbc-title"
        >
          {{ titleComputed }}
        </h1>

        <!-- Subtitle -->
        <p
          v-if="subtitleComputed"
          class="rbc-subtitle"
        >
          {{ subtitleComputed }}
        </p>
      </div>

      <!-- Breadcrumb -->
      <div
        class="rbc-breadcrumb"
      >
        <!-- Back button -->
        <template v-if="resolvedShowBack">
          <RTooltip
            v-if="resolvedBackTooltip"
            :text="resolvedBackTooltip"
          >
            <div
              class="rbc-back-button cursor-pointer p-2 "
              @click="handleBack"
            > 
              <UIcon
              :name="'i-lucide-arrow-left'"
              class="rbc-separator text-[var(--c-text)]"
              />
            </div>
          </RTooltip>

          <UButton
            v-else
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            size="xs"
            @click="handleBack"
          />
        </template>

        <!-- Breadcrumb items -->
        <UBreadcrumb
          v-if="resolvedItems.length"
          :items="resolvedItems"
        >
          <!-- Custom separator -->
          <template #separator>
            <UIcon
              :name="resolvedSeparator"
              class="rbc-separator text-[var(--c-text)]"
            />
          </template>

          <!-- Custom item rendering -->
          <template #item="{ item }">
            <div class="rbc-item">

              <!-- Navigable link -->
              <NuxtLink
                v-if="item.to"
                :to="item.to"
                class="rbc-link"
              >
                <UIcon v-if="item.icon" :name="item.icon" class="rbc-item-icon" />
                <span>{{ item.label }}</span>
              </NuxtLink>

              <!-- Clickable (no route) -->
              <div
                v-else-if="typeof item.onClick === 'function'"
                class="rbc-link"
                type="button"
                @click="item.onClick"
              >
                <UIcon v-if="item.icon" :name="item.icon" class="rbc-item-icon" />
                <span>{{ item.label }}</span>
              </div>

              <!-- Current / last crumb -->
              <div
                v-else
                class="rbc-current"
              >
                <UIcon v-if="item.icon" :name="item.icon" class="rbc-item-icon" />
                <span>{{ item.label }}</span>
              </div>

              <!-- Dropdown for children -->
              <UDropdownMenu
                v-if="item.children?.length"
                :items="mapChildren(item.children)"
              >
                <div
                  class="rbc-chevron-btn cursor-pointer p-2"
                >
                    <UIcon
                      :name="'i-lucide-chevron-down'"
                      class="rbc-separator"
                    />
                </div>
              </UDropdownMenu>
            </div>
          </template>
        </UBreadcrumb>
      </div>
    </div>

    <!-- RIGHT: actions slot (opt-in via hasAction) -->
    <div
      v-if="hasAction && $slots.actions"
      class="rbc-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* ── Container ─────────────────────────────────────────────────────────────── */
.rbc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  // gap: 12px;
  margin-bottom: 4px;      /* sits just above the title inside RPageHeader */
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/* ── Left cluster ───────────────────────────────────────────────────────────── */
.rbc-left {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  justify-content: flex-start;
  gap: 6px;
  // min-width: 0;
  // flex: 1;
  // overflow: hidden;
}

.rbc-title {
  font-size: 17px;
  font-weight: bold !important; 
  color: var(--c-text) !important;
}

.rbc-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--c-muted);
}

.rbc-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: start;
  flex-direction: row;
  gap: 6px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

/* ── Item wrapper ──────────────────────────────────────────────────────────── */
.rbc-item {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  font-size: 13px;
  color: var(--c-text);
}

.rbc-item-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--c-text);
}

/* ── Link / button styles ──────────────────────────────────────────────────── */
.rbc-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: var(--c-text, currentColor);
  cursor: pointer;
  transition: opacity 0.15s;
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;

  &:hover {
    opacity: 0.7;
  }
}

/* ── Current (last) crumb ──────────────────────────────────────────────────── */
.rbc-current {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-primary, currentColor);
}

/* ── Separator ─────────────────────────────────────────────────────────────── */
.rbc-separator {
  opacity: 0.4;
  width: 12px;
  height: 12px;
  color: var(--c-text);
}

/* ── Chevron dropdown trigger ──────────────────────────────────────────────── */
.rbc-chevron-btn {
  padding-inline: 2px !important;
}

/* ── Actions ───────────────────────────────────────────────────────────────── */
.rbc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>