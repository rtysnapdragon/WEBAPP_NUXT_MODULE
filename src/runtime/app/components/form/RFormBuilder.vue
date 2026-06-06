<script setup lang="ts">
// RFormBuilder — dynamic form from schema, rendered in a Slideover
// Slideover direction: RTL (desktop/tablet) | BTT (mobile)
import { ref, computed, watch } from 'vue'
import type { FormSchema } from '@/types/form'
import { useUIStore } from '@/stores/ui'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  modelValue:  boolean              // open state
  schema:      FormSchema
  data?:       Record<string, unknown>
  title?:      string
  subtitle?:   string
  icon?:       string
  submitLabel?: string
  cancelLabel?: string
  loading?:    boolean
  id?:         string
}>(), {
  data: () => ({}),
  id:   'form-builder',
})

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  submit:  [data: Record<string, unknown>]
  cancel:  []
  close:   []
}>()

const ui = useUIStore()
const { t } = useI18n()

// Internal form data (clone to avoid mutation)
const formData = ref<Record<string, unknown>>({ ...props.data })

watch(() => props.data, (v) => {
  formData.value = { ...v }
}, { deep: true })

watch(() => props.modelValue, (open) => {
  if (open) ui.openSlideover(props.id)
  else      ui.closeSlideover(props.id)
})

// Direction: btm-to-top on mobile, right-to-left on desk/tablet
const slideoverSide = computed(() =>
  ui.isMobile ? 'bottom' : 'right'
)

const resolvedTitle = computed(() => {
  if (!props.title) return ''
  try { return t(props.title) } catch { return props.title }
})

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}

function handleSubmit(data: Record<string, unknown>) {
  emit('submit', data)
}
</script>

<template>
  <USlideover
    :model-value="modelValue"
    :side="slideoverSide"
    :class="['r-form-builder', `r-form-builder--${slideoverSide}`]"
    :ui="{
      width: ui.isMobile ? 'w-full' : 'max-w-xl w-full',
    }"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- ── Header ── -->
    <template #header>
      <div class="r-form-builder__header">
        <div class="r-form-builder__title-wrap">
          <span v-if="icon" class="r-form-builder__icon-wrap">
            <UIcon :name="icon" />
          </span>
          <div>
            <h2 class="r-form-builder__title">{{ resolvedTitle }}</h2>
            <p v-if="subtitle" class="r-form-builder__subtitle">{{ subtitle }}</p>
          </div>
        </div>
        <button class="r-form-builder__close" type="button" @click="handleClose">
          <UIcon name="i-lucide-x" />
        </button>
      </div>
    </template>

    <!-- ── Body ── -->
    <div class="r-form-builder__body">
      <RForm
        v-model="formData"
        :loading="loading"
        :cols="1"
        @submit="handleSubmit"
      >
        <template v-for="group in schema.groups" :key="group.key">
          <RFormGroup
            :title="group.title ? $t(group.title) : undefined"
            :icon="group.icon"
            :cols="group.cols ?? 1"
            :collapsible="group.collapsible"
            :collapsed="group.collapsed"
          >
            <RFormField
              v-for="field in group.fields"
              :key="field.key"
              :field="field"
              :model-value="formData[field.key]"
              @update:model-value="formData[field.key] = $event"
            />
          </RFormGroup>
        </template>
      </RForm>
    </div>

    <!-- ── Footer ── -->
    <template #footer>
      <div class="r-form-builder__footer">
        <RButton variant="ghost" @click="handleCancel">
          {{ cancelLabel ? $t(cancelLabel) : $t('common.cancel') }}
        </RButton>
        <RButton
          variant="solid"
          type="submit"
          :loading="loading"
          icon="i-lucide-check"
          @click="handleSubmit(formData)"
        >
          {{ submitLabel ? $t(submitLabel) : $t('common.save') }}
        </RButton>
      </div>
    </template>
  </USlideover>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_mixin' as *;

.r-form-builder {
  /* Mobile: bottom sheet style */
  &--bottom :deep(.slideover-panel) {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-height:   90dvh;
  }

  &__header {
    @include flex-between;
    padding:     var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--c-border);
    gap:         var(--space-4);
  }

  &__title-wrap {
    display:     flex;
    align-items: center;
    gap:         var(--space-3);
  }

  &__icon-wrap {
    width:         40px;
    height:        40px;
    border-radius: var(--radius-md);
    background:    rgba(255,140,66,0.12);
    color:         var(--c-accent);
    @include flex-center;
    font-size:     1.1rem;
    flex-shrink:   0;
  }

  &__title {
    font-size:   1rem;
    font-weight: 600;
    color:       var(--c-text);
  }

  &__subtitle {
    font-size: 0.8rem;
    color:     var(--c-muted);
    margin-top: 2px;
  }

  &__close {
    width:         32px;
    height:        32px;
    border:        none;
    border-radius: var(--radius-md);
    background:    transparent;
    color:         var(--c-muted);
    cursor:        pointer;
    @include flex-center;
    @include transition(fast);
    flex-shrink:   0;

    &:hover {
      background: rgba(255,140,66,0.1);
      color:      var(--c-accent);
    }
  }

  &__body {
    flex:      1;
    overflow-y: auto;
    padding:   var(--space-5) var(--space-6);
    display:   flex;
    flex-direction: column;
    gap:       var(--space-5);

    @include mobile-only {
      padding: var(--space-4);
    }
  }

  &__footer {
    display:       flex;
    align-items:   center;
    justify-content: flex-end;
    gap:           var(--space-3);
    padding:       var(--space-4) var(--space-6);
    border-top:    1px solid var(--c-border);
    background:    var(--c-surface);

    @include mobile-only {
      padding:      var(--space-4);
      flex-direction: column;
      > * { width: 100%; }
    }
  }
}
</style>
