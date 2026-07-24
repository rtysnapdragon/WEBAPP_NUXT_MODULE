<template>
  <img
    :src="imageSrc"
    @error="handleError"
  />
</template>

<script setup>
import { computed } from 'vue';
import { UseDefaultImageStore } from '../stores/defaultImage';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  errorType: {
    type: String,
    default: 'img', // can be: img, user, avatar, banner, product
  },
  isUrl: {
    type: Boolean,
    default: true,
  },
});

const defaultImg = UseDefaultImageStore();

const imageSrc = computed(() => {
  if (!props.src) {
    const fallbackMap = {
      img: new URL('../assets/imgs/defaultProfile.png', import.meta.url).href,
      user: new URL('../assets/imgs/default-user.png', import.meta.url).href,
      avatar: new URL('../assets/imgs/default-avatar.png', import.meta.url).href,
      banner: new URL('../assets/imgs/default-banner.png', import.meta.url).href,
      product: new URL('../assets/imgs/default-product.png', import.meta.url).href,
    }

    const fallbackMap1 = {
      img: '/imgs/defaultProfile.png',
      user: '/imgs/default-user.png',
      avatar: '/imgs/default-avatar.png',
      banner: '/imgs/default-banner.png',
      product: '/imgs/default-product.png',
    };
    return fallbackMap[props.errorType] || fallbackMap.img;
  }
  return props.isUrl ? getUrl(props.src, true) : props.src;
});

const handleError = (e) => {
  defaultImg.get(e, props.errorType);
};
</script>
