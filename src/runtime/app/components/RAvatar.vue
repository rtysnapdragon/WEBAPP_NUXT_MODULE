<template>
  <div v-if="Array.isArray(src) && src?.length > 0" class="group-avatar">
    <div
      v-for="(item, index) in visibleSrc"
      :key="index"
      :class="`avatar ${avatarClasses} ${src?.length > 1 ? 'border-none' : ''} ${
        hasBadge && index === visibleSrc.length - 1 && extraCount === 0 ? 'has-badge' : ''
      }`"
    >
      <img :src="getSrc(item)" @error="handleError" @click.stop.prevent="handlePreviewClick"/>
      <RPreviewFile
        v-if="props.src.length == 1 && !props.notUsePreviewImage"
        :pathUrl="getSrc(item)"
        :errorType="errorType"
        v-model="isPreviewImage"
        :isBGClose="true"
      />
      <slot
        name="badge"
        v-if="hasBadge && index === visibleSrc.length - 1 && extraCount === 0"
      >
        <span
          v-if="props.online !== undefined"
          class="badge"
          :class="props.online ? 'av-online' : 'av-offline'"
        />
        <span
          v-else-if="props.badge !== undefined"
          class="badge"
          :class="typeof props.badge === 'boolean' ? (props.badge ? 'av-online' : 'av-offline') : 'av-badge-text'"
        >
          <template v-if="typeof props.badge !== 'boolean'">{{ props.badge }}</template>
        </span>
      </slot>
    </div>
    <div v-if="extraCount > 0" :class="`avatar show-plus ${avatarClasses} ${hasBadge ? 'has-badge' : ''}`">
      +{{ extraCount }}
      <slot name="badge" v-if="hasBadge">
        <span
          v-if="props.online !== undefined"
          class="badge"
          :class="props.online ? 'av-online' : 'av-offline'"
        />
        <span
          v-else-if="props.badge !== undefined"
          class="badge"
          :class="typeof props.badge === 'boolean' ? (props.badge ? 'av-online' : 'av-offline') : 'av-badge-text'"
        >
          <template v-if="typeof props.badge !== 'boolean'">{{ props.badge }}</template>
        </span>
      </slot>
    </div>
  </div>
  <div
    v-else
    :class="`avatar cursor-pointer ${avatarClasses} ${hasBadge ? 'has-badge' : ''}`"
  >
    <img
      :src="getSrc(src)"
      @error="handleError"
      @click.stop.prevent="handlePreviewClick"
    />
    <slot></slot>
    <RPreviewFile
      v-if="isPreviewImage && !props.notUsePreviewImage && !isError"
      :pathUrl="getSrc(src)"
      :errorType="errorType"
      v-model="isPreviewImage"
      :isBGClose="true"
    />
    <!-- Custom badge slot or online/badge indicator -->
    <slot name="badge">
      <span
        v-if="props.online !== undefined"
        class="badge"
        :class="props.online ? 'av-online' : 'av-offline'"
      />
      <span
        v-else-if="props.badge !== undefined"
        class="badge"
        :class="typeof props.badge === 'boolean' ? (props.badge ? 'av-online' : 'av-offline') : 'av-badge-text'"
      >
        <template v-if="typeof props.badge !== 'boolean'">{{ props.badge }}</template>
      </span>
    </slot>
  </div>
</template>

<script setup>
import { computed, ref, watch, useSlots } from "vue";
import { UseDefaultImageStore } from "../stores/defaultImage";
// import { UseDefaultImageStore } from "@/stores/defaultImage"
import RPreviewFile from './RPreviewFile.vue'

const slots = useSlots();
const defaultImg = UseDefaultImageStore();
const isPreviewImage = ref(false);
const isError = ref(false);


const props = defineProps({
  notUsePreviewImage: {
    type: Boolean,
    default: false,
  },
  src: {
    type: [String, Array],
    required: true,
  },
  size: {
    type: String,
    default: "s",
  },
  round: {
    type: String,
    default: "l",
  },
  border: {
    type: String,
    default: "l",
  },
  borderColor: {
    type: String,
    default: "default",
  },
  background: {
    type: String,
    default: "content",
  },
  newClass: {
    type: String,
    default: "",
  },
  errorType: {
    type: String,
    default: "user",
  },
  isUrl: {
    type: Boolean,
    default: true,
  },
  maxSrc: {
    type: Number,
    default: 5,
  },
  online: {
    type: Boolean,
    default: undefined,
  },
  gender: {
    type: String,
    default: "female",
  },
  badge: {
    type: [Boolean, String, Number, Object],
    default: undefined,
  },
});

const resolvedErrorType = computed(() => {
  if (props.gender) {
    const g = String(props.gender).toLowerCase();
    if (g === "male" || g === "m") return "male";
    if (g === "female" || g === "f") return "female";
  }
  if (props.errorType && props.errorType !== "user") {
    return props.errorType;
  }
  return "female";
});

const hasBadge = computed(() => {
  if (props.online !== undefined) return true;
  if (!!slots.badge) return true;
  if (props.badge === undefined || props.badge === null) return false;
  if (typeof props.badge === "boolean") return true;
  if (typeof props.badge === "number") return props.badge > 0;
  if (typeof props.badge === "string") return props.badge.length > 0;
  return true; // Object case — assume intentional
});

const getSrc = (src) => {
  return props.isUrl ? getUrl(src, true) : src;
};

const avatarClasses = computed(() => {
  return [
    `size-${props.size}`,
    `round-${props.round}`,
    `border-${props.border}`,
    `borderColor-${typeof props.borderColor === "string" ? props.borderColor.toLowerCase() : ""}`,
    `background-${props.background}`,
    props.newClass,
  ].join(" ");
});


const visibleSrc = computed(() => {
  return Array.isArray(props.src) ? props.src.slice(0, props.maxSrc) : [];
});

const extraCount = computed(() => {
  return Array.isArray(props.src) ? props.src.length - props.maxSrc : 0;
});

const handleError = (e) => {
  isError.value = true;
  // defaultImg.get(e, props.errorType);
  defaultImg.get(e, resolvedErrorType.value);
};

const handlePreviewClick = () => {
  if (props.notUsePreviewImage || isError.value) return;
  isPreviewImage.value = true;
};
watch(() => props.src, () => {
  isError.value = false;
});

const isShowModal = ref(false);

const onImageClick = (src) => {
  console.log("------>>>", getSrc(src));
};
</script>

<style lang="scss" scoped>
.avatar {
  position: relative;
  user-select: none;
  overflow: hidden;

  &.size-3xs {
    width: 22px;
    height: 22px;
    min-width: 22px;
    min-height: 22px;
  }

  &.size-2xs {
    width: 26px;
    height: 26px;
    min-width: 26px;
    min-height: 26px;
  }

  &.size-xs {
    width: 30px;
    height: 30px;
    min-width: 30px;
    min-height: 30px;
  }

  &.size-s {
    width: 35px;
    height: 35px;
    min-width: 35px;
    min-height: 35px;
  }

  &.size-sm {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
  }

  &.size-m {
    width: 50px;
    height: 50px;
    min-width: 50px;
    min-height: 50px;
  }

  &.size-ml {
    width: 80px;
    height: 80px;
    min-width: 80px;
    min-height: 80px;
  }

  &.size-l {
    width: 100px;
    height: 100px;
    min-width: 100px;
    min-height: 100px;
  }

  &.size-ss {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
  }

  &.round-s {
    border-radius: 10px;

    img {
      border-radius: 9px;
    }
  }

  &.round-m {
    border-radius: 20px;

    img {
      border-radius: 19px;
    }
  }

  &.round-l {
    border-radius: 100px;

    img {
      border-radius: 100px;
    }
  }

  &.border-s {
    border: 1px solid var(--color-w-b-4);

    img {
      padding: 2px;
    }
  }

  &.border-m {
    border: 1.5px solid var(--color-w-b-4);

    img {
      padding: 2.5px;
    }
  }

  &.border-l {
    border: 2px solid var(--color-w-b-4);

    img {
      padding: 3px;
    }
  }

  &.borderColor-default {
    border-color: var(--color-w-b-4) !important;
  }

  &.borderColor-nenoBlue {
    border-color: var(--rs-c-nenoBlue) !important;
  }

  &.borderColor-green {
    border-color: var(--rs-c-green) !important;
  }

  &.borderColor-orange {
    border-color: var(--rs-c-orange) !important;
  }

  &.borderColor-purple {
    border-color: var(--rs-c-purple) !important;
  }

  &.borderColor-purpleBlack {
    border-color: var(--rs-c-purpleBlack) !important;
  }

  &.borderColor-red {
    border-color: var(--rs-c-red) !important;
  }

  &.borderColor-orangeRed {
    border-color: var(--rs-c-orangeRed) !important;
  }

  &.borderColor-blue {
    border-color: var(--rs-c-blue) !important;
  }

  &.borderColor-capture {
    border-color: var(--rs-c-capture) !important;
  }

  &.borderColor-male {
    border-color: var(--rs-c-male) !important;
  }

  &.borderColor-female {
    border-color: var(--rs-c-female) !important;
  }

  &.borderColor-content {
    border-color: var(--bg-content) !important;
  }

  &.borderColor-transparent {
    border-color: transparent !important;
  }

  &.background-content {
    background-color: var(--bg-content) !important;
  }

  &.background-wrapper {
    background-color: var(--bg-wrapper) !important;
  }


  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.border-none {
    border: unset !important;
  }

  &.has-badge {
    overflow: visible;
  }

  // Online/offline badge
  .badge {
    position: absolute;
    top: 2px;
    right: -5px;
    /* width: 26%;
    height: 26%; */
    width: 12px !important;
    height: 12px !important;
    min-width: 6px !important;
    min-height: 6px !important;
    border-radius: 50%;
    border: 2px solid var(--c-surface, #fff) !important;
    z-index: 1 !important;

    &.av-online {
      background: #22c55e !important;
    }

    &.av-offline {
      background: #94a3b8 !important;
    }

    &.av-badge-text {
      width: auto;
      height: auto;
      max-width: none;
      max-height: none;
      min-width: 16px !important;
      min-height: 16px !important;
      padding: 0 4px !important;
      border-radius: 10px !important;
      background: #ef4444 !important;
      color: #ffffff !important;
      font-size: 10px !important;
      font-weight: 600 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  }
}

.group-avatar {
  display: flex;
  align-items: center;

  :not(:first-child) {
    margin-left: -15px;
  }
}

.show-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-content);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: bold;
  user-select: none;
  text-align: center;
}

.avatar {
  &.fade-enter-active {
    animation: s_wrapper 0.3s ease-in-out;
    opacity: 1;

    @keyframes s_wrapper {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }
  }

  &.fade-leave-active {
    animation: h_wrapper 0.3s ease-in-out;
    opacity: 0;

    @keyframes h_wrapper {
      from {
        opacity: 1;
      }

      to {
        opacity: 0;
      }
    }
  }
}
</style>