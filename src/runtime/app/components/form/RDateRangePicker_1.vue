<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import type { CalendarDate } from '@internationalized/date'
import { defu } from 'defu'

type DateRange = {
  start?: CalendarDate | null
  end?: CalendarDate | null
}

interface Props {
  modelValue?: DateRange
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  ui?: Record<string, any>
  numberOfMonths?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  placeholder: 'Select date range',
  numberOfMonths: 2
})

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

const inputDate = useTemplateRef('inputDate')

const model = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const defaultUi = {
  root: 'w-full',
  base: `
    rounded-xl
    border
    transition-all
    duration-200
    bg-[var(--c-surface)]
    border-[var(--c-border)]
    text-[var(--c-text)]
    shadow-sm
    hover:border-[var(--c-accent)]
    focus-within:border-[var(--c-accent)]
    focus-within:ring-2
    focus-within:ring-[var(--c-accent)]/15
  `,
  trailing: 'pe-2',
    inputDate: {
      slots: {
        base: [
          'group relative inline-flex items-center rounded-md select-none',
          'transition-colors'
        ],
        leading: 'absolute inset-y-0 start-0 flex items-center',
        leadingIcon: 'shrink-0 text-dimmed',
        leadingAvatar: 'shrink-0',
        leadingAvatarSize: '',
        trailing: 'absolute inset-y-0 end-0 flex items-center',
        trailingIcon: 'shrink-0 text-dimmed',
        segment: [
          'rounded text-center outline-hidden data-placeholder:text-dimmed data-[segment=literal]:text-muted data-invalid:text-error data-disabled:cursor-not-allowed data-disabled:opacity-75',
          'transition-colors'
        ],
        separatorIcon: 'shrink-0 size-4 text-muted'
      },
      variants: {
        fieldGroup: {
          horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]',
          vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]'
        },
        size: {
          xs: {
            base: [
              'px-2 py-1 text-sm/4 gap-1',
              'gap-0.25'
            ],
            leading: 'ps-2',
            trailing: 'pe-2',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
            segment: 'data-[segment=day]:w-8 data-[segment=month]:w-8 data-[segment=year]:w-10'
          },
          sm: {
            base: [
              'px-2.5 py-1.5 text-sm/4 gap-1.5',
              'gap-0.5'
            ],
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-4',
            leadingAvatarSize: '3xs',
            trailingIcon: 'size-4',
            segment: 'data-[segment=day]:w-8 data-[segment=month]:w-8 data-[segment=year]:w-10'
          },
          md: {
            base: [
              'px-2.5 py-1.5 text-base/5 gap-1.5',
              'gap-0.5'
            ],
            leading: 'ps-2.5',
            trailing: 'pe-2.5',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
            segment: 'data-[segment=day]:w-9 data-[segment=month]:w-9 data-[segment=year]:w-11'
          },
          lg: {
            base: [
              'px-3 py-2 text-base/5 gap-2',
              'gap-0.75'
            ],
            leading: 'ps-3',
            trailing: 'pe-3',
            leadingIcon: 'size-5',
            leadingAvatarSize: '2xs',
            trailingIcon: 'size-5',
            segment: 'data-[segment=day]:w-9 data-[segment=month]:w-9 data-[segment=year]:w-11'
          },
          xl: {
            base: [
              'px-3 py-2 text-base gap-2',
              'gap-0.75'
            ],
            leading: 'ps-3',
            trailing: 'pe-3',
            leadingIcon: 'size-6',
            leadingAvatarSize: 'xs',
            trailingIcon: 'size-6',
            segment: 'data-[segment=day]:w-10 data-[segment=month]:w-10 data-[segment=year]:w-12'
          }
        },
        variant: {
          outline: 'text-highlighted bg-default ring ring-inset ring-accented',
          soft: 'text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50',
          subtle: 'text-highlighted bg-elevated ring ring-inset ring-accented',
          ghost: 'text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent',
          none: 'text-highlighted bg-transparent'
        },
        color: {
          primary: '',
          secondary: '',
          success: '',
          info: '',
          warning: '',
          error: '',
          neutral: ''
        },
        leading: {
          true: ''
        },
        trailing: {
          true: ''
        },
        loading: {
          true: ''
        },
        highlight: {
          true: ''
        },
        fixed: {
          false: ''
        },
        type: {
          file: 'file:me-1.5 file:font-medium file:text-muted file:outline-none'
        }
      },
      compoundVariants: [
        {
          variant: 'outline',
          class: {
            segment: 'focus:bg-elevated'
          }
        },
        {
          variant: 'soft',
          class: {
            segment: 'focus:bg-accented/50 group-hover:focus:bg-accented'
          }
        },
        {
          variant: 'subtle',
          class: {
            segment: 'focus:bg-accented'
          }
        },
        {
          variant: 'ghost',
          class: {
            segment: 'focus:bg-elevated group-hover:focus:bg-accented'
          }
        },
        {
          variant: 'none',
          class: {
            segment: 'focus:bg-elevated'
          }
        },
        {
          color: 'primary',
          variant: [
            'outline',
            'subtle'
          ],
          class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
        },
        {
          color: 'primary',
          highlight: true,
          class: 'ring ring-inset ring-primary'
        },
        {
          color: 'neutral',
          variant: [
            'outline',
            'subtle'
          ],
          class: 'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted'
        },
        {
          color: 'neutral',
          highlight: true,
          class: 'ring ring-inset ring-inverted'
        },
        {
          leading: true,
          size: 'xs',
          class: 'ps-7'
        },
        {
          leading: true,
          size: 'sm',
          class: 'ps-8'
        },
        {
          leading: true,
          size: 'md',
          class: 'ps-9'
        },
        {
          leading: true,
          size: 'lg',
          class: 'ps-10'
        },
        {
          leading: true,
          size: 'xl',
          class: 'ps-11'
        },
        {
          trailing: true,
          size: 'xs',
          class: 'pe-7'
        },
        {
          trailing: true,
          size: 'sm',
          class: 'pe-8'
        },
        {
          trailing: true,
          size: 'md',
          class: 'pe-9'
        },
        {
          trailing: true,
          size: 'lg',
          class: 'pe-10'
        },
        {
          trailing: true,
          size: 'xl',
          class: 'pe-11'
        },
        {
          loading: true,
          leading: true,
          class: {
            leadingIcon: 'animate-spin'
          }
        },
        {
          loading: true,
          leading: false,
          trailing: true,
          class: {
            trailingIcon: 'animate-spin'
          }
        },
        {
          fixed: false,
          size: 'xs',
          class: 'md:text-xs'
        },
        {
          fixed: false,
          size: 'sm',
          class: 'md:text-xs'
        },
        {
          fixed: false,
          size: 'md',
          class: 'md:text-sm'
        },
        {
          fixed: false,
          size: 'lg',
          class: 'md:text-sm'
        }
      ],
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'outline'
      }
    }
  }

const mergedUi = computed(() =>
  defu(props.ui ?? {}, defaultUi)
)

</script>

<template>
  <UInputDate
    ref="inputDate"
    v-model="model"
    range
    :disabled="disabled"
    :required="required"
    :size="size"
    :ui="mergedUi"
    class="r-date-range-picker"
  >
    <template #trailing>
      <UPopover
        :reference="inputDate?.inputsRef?.[0]?.$el"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-calendar-range"
          aria-label="Select date range"
          class="r-date-range-picker__trigger"
        />

        <template #content>
          <div class="r-date-range-picker__popover">
            <UCalendar
              v-model="model"
              range
              :number-of-months="numberOfMonths"
            />
          </div>
        </template>
      </UPopover>
    </template>
  </UInputDate>
</template>

<style scoped lang="scss">
.r-date-range-picker {
  width: 100%;

  :deep(input) {
    color: var(--c-text);
  }

  :deep(input::placeholder) {
    color: var(--c-muted);
  }

  :deep([data-invalid]) {
    border-color: var(--c-danger);
  }
}

.r-date-range-picker__trigger {
  color: var(--c-accent);

  &:hover {
    background: color-mix(
      in srgb,
      var(--c-accent) 12%,
      transparent
    );
  }
}

.r-date-range-picker__popover {
  padding: 12px;
  border-radius: 16px;

  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);

  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Calendar Customization */
:deep(.ui-calendar) {
  color: var(--c-text);
}

:deep(button[data-selected]) {
  background: var(--c-accent) !important;
  color: white !important;
}

:deep(button[data-highlighted]) {
  background: rgba(255, 140, 66, 0.14);
}

:deep(button[data-today]) {
  border-color: var(--c-accent);
}

:deep(button:hover) {
  background: rgba(255, 140, 66, 0.08);
}
</style>