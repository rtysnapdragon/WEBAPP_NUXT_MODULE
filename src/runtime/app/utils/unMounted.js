import { onUnmounted } from "vue";

export default (handler) => {
  onUnmounted(() => {
    setTimeout(handler, 10);
  });
};
