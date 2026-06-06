<template>
  <div v-if="Array.isArray(src) && src?.length > 0" class="group-avatar">
    <div
      v-for="(item, index) in visibleSrc"
      :key="index"
      :class="`avatar ${avatarClasses} ${src?.length > 1 ? 'border-none' : ''}`"
    >
      <img :src="getSrc(item)" @error="handleError" />
      <RPreviewFile
        v-if="props.src.length == 1 && !props.notUsePreviewImage"
        :pathUrl="getSrc(item)"
        :errorType="errorType"
        v-model="isPreviewImage"
        :isBGClose="true"
      />
    </div>
    <div v-if="extraCount > 0" :class="'avatar show-plus ' + avatarClasses">
      +{{ extraCount }}
    </div>
  </div>
  <div
    v-else
    :class="'avatar cursor-pointer ' + avatarClasses"
    @click="isShowModal = !isShowModal"
  >
    <img
      :src="getSrc(src)"
      @error="handleError"
      @click.stop.prevent="isPreviewImage = true  && !props.notUsePreviewImage"
    />
    <slot></slot>
    <RPreviewFile
      v-if="isPreviewImage && !props.notUsePreviewImage"
      :pathUrl="getSrc(src)"
      :errorType="errorType"
      v-model="isPreviewImage"
      :isBGClose="true"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
const defaultImg = UseDefaultImagStore();
const isPreviewImage = ref(false);
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
  defaultImg.get(e, props.errorType);
};useScannerInput

const isShowModal = ref(false);

const onImageClick = (src) => {
  console.log("------>>>", getSrc(src));
};
</script>

<style lang="scss" scoped>
.avatar {
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
    border-color: var(--ocs-c-nenoBlue) !important;
  }

  &.borderColor-green {
    border-color: var(--ocs-c-green) !important;
  }

  &.borderColor-orange {
    border-color: var(--ocs-c-orange) !important;
  }

  &.borderColor-purple {
    border-color: var(--ocs-c-purple) !important;
  }

  &.borderColor-purpleBlack {
    border-color: var(--ocs-c-purpleBlack) !important;
  }

  &.borderColor-red {
    border-color: var(--ocs-c-red) !important;
  }

  &.borderColor-orangeRed {
    border-color: var(--ocs-c-orangeRed) !important;
  }

  &.borderColor-blue {
    border-color: var(--ocs-c-blue) !important;
  }

  &.borderColor-capture {
    border-color: var(--ocs-c-capture) !important;
  }

  &.borderColor-male {
    border-color: var(--ocs-c-male) !important;
  }

  &.borderColor-female {
    border-color: var(--ocs-c-female) !important;
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
