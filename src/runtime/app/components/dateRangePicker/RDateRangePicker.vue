<template>
  <div class="rdrp" :style="{ minWidth: minwidth }">
    <!-- Plain range input (v-calendar popover lives inside RDatePicker) -->
    <RDatePicker
      v-if="!predefined"
      v-model="date"
      date-range-picker
      :attributes="attributes"
      :min-date="minDate"
      :max-date="maxDate"
      :columns="columns"
      :placeholder="placeholder"
      :ui="ui"
    />

    <!-- Predefined ranges: Nuxt UI 4 popover (v2's #panel slot + :popper are gone → #content + :content) -->
    <UPopover
      v-else
      v-model:open="isOpen"
      :content="{ side: 'bottom', align: 'start' }"
      :ui="{ content: 'rdrp-popover' }"
    >
      <!--
        Wrapper div as the trigger: PopoverTrigger injects type="button" / aria attrs into its
        child, and on a UInput those would land on the <input> itself.
      -->
      <div class="rdrp-trigger">
        <UInput
          readonly
          :model-value="rangeText"
          :placeholder="placeholder"
          :ui="inputUi"
          size="xs"
          icon="ri-calendar-schedule-line"
          trailing
          autocomplete="off"
        />
      </div>

      <template #content>
        <div class="rdrp-panel">
          <div class="rdrp-ranges">
            <UButton
              v-for="(range, index) in ranges"
              :key="index"
              :label="t(range.label)"
              color="neutral"
              variant="ghost"
              class="rdrp-range-btn"
              :class="{ 'is-active': isRangeSelected(range.duration, range.isLast) }"
              @click="selectRange(range.duration, range.isLast)"
            />
          </div>

          <div class="rdrp-calendar">
            <RDatePicker
              ref="refDatePicker"
              v-model="tempDate"
              date-range-picker
              predefined
              :attributes="attributes"
              :min-date="minDate"
              :max-date="maxDate"
              :columns="columns"
            />
            <RBtns :data="listBtns" class="p-1.5 justify-end" @click="fnClickListBtn" />
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { sub, isSameDay, add } from 'date-fns'

const { t } = useI18n()

const props = defineProps({
  range:       null,     // extra predefined ranges: [{ label, duration, isLast }]
  predefined:  Boolean,
  attributes:  Object,
  minwidth:    String,
  ui:          null,     // Nuxt UI 4 UInput slots
  minDate:     null,
  maxDate:     null,
  columns:     null,
  placeholder: null,
  // legacy no-ops
  format:      String,
  label:       null,
})

const date = defineModel({ default: () => ({ start: null, end: null }) })

const isOpen = ref(false)
const refDatePicker = ref()
const tempDate = ref({ start: null, end: null })

// `isLast: true` → last N days up to today · `false` → today up to next N days
const defaultRange = [
  { label: 'todal',        duration: { days: 0 },  isLast: false },
  { label: 'yesterday',    duration: { days: 1 },  isLast: true  },
  { label: 'tomorrow',     duration: { days: 1 },  isLast: false },
  { label: 'last_7_days',  duration: { days: 7 },  isLast: true  },
  { label: 'next_7_days',  duration: { days: 7 },  isLast: false },
  { label: 'last_30_days', duration: { days: 30 }, isLast: true  },
  { label: 'next_30_days', duration: { days: 30 }, isLast: false },
]

const ranges = computed(() =>
  props.range?.length ? [...defaultRange, ...props.range] : defaultRange,
)

const rangeText = computed(() =>
  date.value?.start && date.value?.end
    ? `${ocdate(date.value.start).format()} - ${ocdate(date.value.end).format()}`
    : '',
)

// ── UInput v4 ui (same hooks as RDatePicker) ──
function mergeSlots(base, user = {}) {
  return Object.fromEntries(
    [...new Set([...Object.keys(base), ...Object.keys(user || {})])].map((k) => [
      k,
      [base[k], user?.[k]].flat().filter((v) => typeof v === 'string' && v).join(' '),
    ]),
  )
}

const inputUi = computed(() => mergeSlots({
  root:         'ui-rdp-input-root relative w-full',
  base:         'ui-rdp-input',
  leadingIcon:  'ui-rdp-icon',
  trailingIcon: 'ui-rdp-icon',
}, props.ui))

// computed so labels follow locale changes
const listBtns = computed(() => [
  { type: 'cancel', label: t('cancel'), color: 'cancel', icon: 'cancel', noIcon: true },
  { type: 'create', label: t('ok'),     color: 'create', icon: 'create', noIcon: true },
])

// ── Draft (tempDate) ↔ committed (date) ──
watch(date, (n) => { if (n) tempDate.value = copyWith(n) }, { immediate: true, deep: true })
watch(isOpen, () => { tempDate.value = copyWith(date.value) })

function fnClickListBtn(type) {
  if (type === 'create') date.value = copyWith(tempDate.value)
  else if (type === 'cancel') tempDate.value = copyWith(date.value)
  isOpen.value = false
}

function isRangeSelected(duration, isLast) {
  const { start, end } = tempDate.value ?? {}
  if (!start || !end) return false
  const today = new Date()
  if (isLast === true)  return isSameDay(start, sub(today, duration)) && isSameDay(end, today)
  if (isLast === false) return isSameDay(start, today) && isSameDay(end, add(today, duration))
  return false
}

function selectRange(duration, isLast) {
  const today = new Date()
  if (isLast === true)  tempDate.value = { start: sub(today, duration), end: today }
  else if (isLast === false) tempDate.value = { start: today, end: add(today, duration) }

  setTimeout(async () => {
    await nextTick()
    await refDatePicker.value?.datePicker()?.move(tempDate.value?.start)
  }, 100)
}
</script>

<!--
  GLOBAL (non-scoped), namespaced .rdrp-*.
  The old rules for .vc-light / .vc-day-content were scoped, so they never reached
  v-calendar's DOM (dead code) and are dropped. Colours are tokens, not hex.
-->
<style lang="scss">
.rdrp-trigger { width: 100%; }

// Nuxt UI's popover shell — neutralised, flat bordered surface
.rdrp-popover {
  padding: 0;
  background: var(--bg-content);
  border: 1px solid var(--color-w-b-4);
  border-radius: var(--r-lg);
  box-shadow: none;
  overflow: visible;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.rdrp-panel {
  display: flex;
  flex-direction: column;
  font-family: var(--font-400);

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
  }
}

.rdrp-ranges {
  display: flex;
  flex-direction: column;
  padding: var(--sp-4) 0;
  border-bottom: 1px solid var(--color-w-b-4);

  @media (min-width: 640px) {
    align-self: stretch;
    border-bottom: 0;
    border-right: 1px solid var(--color-w-b-4);
  }
}

.rdrp-range-btn {
  width: 100%;
  min-width: fit-content;
  padding-inline: var(--sp-6);
  border-radius: 0;
  white-space: nowrap;

  &:hover { background: var(--bg-tertiary); }
  &.is-active { color: var(--c-accent); }
}

.rdrp-calendar {
  display: grid;
  align-items: center;

  > * + * { border-top: 1px solid var(--color-w-b-4); }
}
</style>