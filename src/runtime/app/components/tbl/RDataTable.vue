<script setup lang="ts">
// RDataTable — responsive data table
// Desktop: full table | Tablet: scroll | Mobile: card list
import { computed, ref } from 'vue'
import { useUIStore } from '@/stores/ui'

interface Column {
  key:       string
  label:     string
  sortable?: boolean
  width?:    string
  align?:    'left' | 'center' | 'right'
  class?:    string
}

const props = withDefaults(defineProps<{
  columns:   Column[]
  rows:      Record<string, unknown>[]
  loading?:  boolean
  empty?:    string
  rowKey?:   string
  selectable?: boolean
  selected?:   string[]
  striped?:  boolean
  compact?:  boolean
}>(), {
  empty:  'common.noData',
  rowKey: 'id',
})

const emit = defineEmits<{
  'update:selected': [ids: string[]]
  'row-click':       [row: Record<string, unknown>]
  sort:              [col: string, dir: 'asc' | 'desc']
}>()

const ui = useUIStore()

const sortCol = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(col: Column) {
  if (!col.sortable) return
  if (sortCol.value === col.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortCol.value = col.key
    sortDir.value = 'asc'
  }
  emit('sort', sortCol.value, sortDir.value)
}

const localSelected = computed({
  get:  () => props.selected ?? [],
  set: (v) => emit('update:selected', v),
})

function toggleRow(id: string) {
  const s = [...localSelected.value]
  const i = s.indexOf(id)
  if (i > -1) s.splice(i, 1)
  else        s.push(id)
  localSelected.value = s
}

function toggleAll() {
  const ids = props.rows.map(r => String(r[props.rowKey]))
  if (localSelected.value.length === ids.length)
    localSelected.value = []
  else
    localSelected.value = ids
}

const allSelected = computed(() =>
  props.rows.length > 0 && localSelected.value.length === props.rows.length
)
</script>

<template>
  <div class="r-table-wrap">
    <!-- Desktop / Tablet: table -->
    <div v-if="!ui.isMobile" class="r-table-scroll">
      <table :class="['r-table', { 'r-table--striped': striped, 'r-table--compact': compact }]">
        <thead>
          <tr>
            <th v-if="selectable" class="r-table__th r-table__th--check">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="localSelected.length > 0 && !allSelected"
                @change="toggleAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['r-table__th', `r-table__th--${col.align ?? 'left'}`, { 'r-table__th--sortable': col.sortable }]"
              :style="col.width ? { width: col.width } : {}"
              @click="toggleSort(col)"
            >
              <span class="r-table__th-inner">
                {{ col.label }}
                <span v-if="col.sortable" class="r-table__sort-icon">
                  <UIcon
                    :name="sortCol === col.key
                      ? (sortDir === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down')
                      : 'i-lucide-chevrons-up-down'"
                  />
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="i in 5" :key="`sk-${i}`" class="r-table__row r-table__row--skeleton">
              <td v-if="selectable" class="r-table__td"><div class="r-skeleton r-skeleton--sm" /></td>
              <td v-for="col in columns" :key="col.key" class="r-table__td">
                <div class="r-skeleton" :style="{ width: `${60 + Math.random() * 30}%` }" />
              </td>
            </tr>
          </template>

          <!-- Empty -->
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length + (selectable ? 1 : 0)" class="r-table__empty">
              <slot name="empty">
                <div class="r-table__empty-inner">
                  <UIcon name="i-lucide-inbox" class="r-table__empty-icon" />
                  <p>{{ $t(empty) }}</p>
                </div>
              </slot>
            </td>
          </tr>

          <!-- Rows -->
          <tr
            v-else
            v-for="row in rows"
            :key="String(row[rowKey])"
            class="r-table__row"
            :class="{ 'r-table__row--selected': localSelected.includes(String(row[rowKey])) }"
            @click="$emit('row-click', row)"
          >
            <td v-if="selectable" class="r-table__td r-table__td--check" @click.stop>
              <input
                type="checkbox"
                :checked="localSelected.includes(String(row[rowKey]))"
                @change="toggleRow(String(row[rowKey]))"
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['r-table__td', `r-table__td--${col.align ?? 'left'}`, col.class]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: card list -->
    <div v-else class="r-table-cards">
      <div v-if="loading">
        <div v-for="i in 4" :key="i" class="r-table-card r-table-card--skeleton">
          <div v-for="j in 3" :key="j" class="r-skeleton" :style="{ width: `${50 + j * 10}%` }" />
        </div>
      </div>
      <div v-else-if="rows.length === 0" class="r-table__empty">
        <UIcon name="i-lucide-inbox" class="r-table__empty-icon" />
        <p>{{ $t(empty) }}</p>
      </div>
      <div
        v-else
        v-for="row in rows"
        :key="String(row[rowKey])"
        class="r-table-card"
        :class="{ 'r-table-card--selected': localSelected.includes(String(row[rowKey])) }"
        @click="$emit('row-click', row)"
      >
        <slot name="mobile-card" :row="row">
          <div v-for="col in columns.slice(0, 4)" :key="col.key" class="r-table-card__row">
            <span class="r-table-card__label">{{ col.label }}</span>
            <span class="r-table-card__val">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </span>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

/* ── Skeleton ── */
.r-skeleton {
  height:        14px;
  border-radius: var(--radius-sm);
  background:    linear-gradient(90deg, var(--c-border) 25%, rgba(255,255,255,0.4) 50%, var(--c-border) 75%);
  background-size: 200% 100%;
  animation:     shimmer 1.4s infinite;
  &--sm { height: 10px; width: 24px; }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Table ── */
.r-table-wrap { width: 100%; }

.r-table-scroll {
  overflow-x: auto;
  border:        1px solid var(--c-border);
  border-radius: var(--radius-lg);
}

.r-table {
  width:           100%;
  border-collapse: collapse;
  font-size:       0.875rem;

  &--compact .r-table__td,
  &--compact .r-table__th { padding: var(--space-2) var(--space-3); }

  &--striped .r-table__row:nth-child(even) {
    background: rgba(0,0,0,0.02);
  }

  &__th {
    padding:    var(--space-3) var(--space-4);
    text-align: left;
    font-size:  0.75rem;
    font-weight: 600;
    color:      var(--c-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--c-border);
    white-space: nowrap;

    &--center  { text-align: center; }
    &--right   { text-align: right; }
    &--check   { width: 40px; }

    &--sortable {
      cursor: pointer;
      user-select: none;
      &:hover { color: var(--c-accent); }
    }
  }

  &__th-inner {
    display:     flex;
    align-items: center;
    gap:         var(--space-1);
  }

  &__sort-icon { font-size: 0.85em; opacity: 0.6; }

  &__td {
    padding:        var(--space-3) var(--space-4);
    border-bottom:  1px solid var(--c-border);
    color:          var(--c-text);
    vertical-align: middle;

    &--center { text-align: center; }
    &--right  { text-align: right; }
    &--check  { width: 40px; }
  }

  &__row {
    cursor:  pointer;
    @include transition(fast);

    &:hover { background: rgba(255,140,66,0.04); }
    &--selected { background: rgba(255,140,66,0.08); }
    &:last-child .r-table__td { border-bottom: none; }
  }

  &__empty {
    text-align: center;
    padding:    var(--space-8);
    color:      var(--c-muted);

    &-inner {
      display:        flex;
      flex-direction: column;
      align-items:    center;
      gap:            var(--space-3);
    }

    &-icon { font-size: 2rem; opacity: 0.5; }
  }
}

/* ── Mobile cards ── */
.r-table-cards {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-3);
}

.r-table-card {
  background:    var(--c-surface);
  border:        1px solid var(--c-border);
  border-radius: var(--radius-lg);
  padding:       var(--space-4);
  cursor:        pointer;
  @include transition(fast);

  &:hover { border-color: var(--c-accent); }
  &--selected { border-color: var(--c-accent); background: rgba(255,140,66,0.05); }

  &--skeleton {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-3);
    pointer-events: none;
  }

  &__row {
    display:       flex;
    align-items:   flex-start;
    gap:           var(--space-2);
    font-size:     0.875rem;
  }

  &__label {
    color:     var(--c-muted);
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 90px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__val {
    color:     var(--c-text);
    flex:      1;
  }
}
</style>
