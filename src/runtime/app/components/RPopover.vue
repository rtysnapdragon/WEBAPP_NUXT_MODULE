<template>
  <div class="ocs-wrapper-popover">

    <!-- use = nuxtui -->
    <UPopover v-model:open="model" :closeDelay="closeDelay" :mode="mode"
      :ui="{ wrapper: 'flex', ring: '', background: '' }" :popper="{ placement: placement ?? 'left-start' }"
      v-if="use == 'nuxtui'">
      <slot name="trigger" v-if="$slots.trigger"></slot>
      <div class="btn-leading" v-else><i class="ri-more-2-fill"></i></div>
      <template #panel>
        <div class="dialog" :class="nClass" @click.stop>
          <slot></slot>
        </div>
      </template>
    </UPopover>

    <!-- use = flowbite -->
    <fwb-dropdown :placement="placement ?? 'right'" closeInside="closeInside" class="popup-flowbite" v-else-if="use == 'flowbite'">
      <template #trigger>
        <slot name="trigger" v-if="$slots.trigger"></slot>
        <div class="btn-leading" v-else @click.stop><i class="ri-more-2-fill"></i></div>
      </template>
      <div @click.stop>
        <slot></slot>
      </div>
    </fwb-dropdown>

    <!-- use = headless -->
    <Popover v-slot="{ open }" class="relative popup-headless" v-else-if="use == 'headless'">
      <PopoverButton>
        <slot name="trigger" v-if="$slots.trigger"></slot>
        <div class="btn-leading" v-else><i class="ri-more-2-fill"></i></div>
      </PopoverButton>
      <PopoverPanel class="absolute" v-slot="{ close }">
        <slot :close="close"></slot>
      </PopoverPanel>
    </Popover>

  </div>
</template>

<script setup>
import { FwbDropdown } from 'flowbite-vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
const props = defineProps(['mode', 'closeDelay', 'use', 'placement', 'class', 'closeInside']) // use : nuxtui , flowbite , headless
const model = defineModel()
const mode = computed(() => props.mode ?? 'click')
const closeDelay = computed(() => props.closeDelay)
const use = computed(() => props.use ?? 'nuxtui')
const placement = computed(() => props.placement)
const nClass = computed(() => props.class)
const closeInside = computed(() => props.closeInside)
const emit = defineEmits(['click'])

</script>

<style lang="scss" scoped>
.ocs-wrapper-popover ::v-deep {

  // nuxtui
  .btn-leading {
    font-size: 13px;
    cursor: pointer;
  }

  .dialog {
    background: var(--bg-wrapper);
    padding: 10px;
    border-radius: 10px;
  }

  //flowbiy 
  .popup-flowbite {
    width: 100%;
    .absolute {
      width: fit-content;
      background: var(--bg-wrapper) !important;
      border-radius: 10px;
      padding: 10px;
      animation: ani_show 0.25s ease-in-out;
      transform: translateY(0px);

      @keyframes ani_show {
        from {
          transform: translateY(6px);
          opacity: 0;
        }

        to {
          transform: translateY(0px);
          opacity: 1;
        }
      }

    }
  }

  //headless
  .popup-headless {
    button {
      outline: none;
    }

    .absolute {
      right: 14px;
      background: var(--bg-wrapper);
      border-radius: 10px;
      padding: 10px;
      animation: ani_show 0.25s ease-in-out;
      transform: translateY(0px);

      @keyframes ani_show {
        from {
          transform: translateY(6px);
          opacity: 0;
        }

        to {
          transform: translateY(0px);
          opacity: 1;
        }
      }

    }
  }

}
</style>