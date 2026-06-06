<template>
  <div ref="colorRef">
    <i class="ri-dropper-fill eye-dropper" @click="eyeDropper"></i>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  isNotEmpty,
  mounted,
  onUnmounted,
  colorPicker,
} from "#imports";
const dataColor = defineModel();
const colorRef = ref();
const props = defineProps({
  init: {
    type: Object,
    required: true,
    default: {
      type: "default",
      format: "hex",
      outputFormat: "hex",
      color: "#ffffff",
    },
  },
});

const initColor = computed(() => props.init?.color);
const initType = computed(() => props.init?.type);
const initFormat = computed(() => props.init?.format);
const initOutputFormat = computed(() => props.init?.outputFormat);
const setColor = computed(() =>
  isNotEmpty(dataColor.value)
    ? dataColor.value
    : isNotEmpty(initColor.value)
    ? initColor.value
    : "#ffffff"
);
const colorpick = colorPicker();
let instantPicker = "";
const emit = defineEmits(["onChange", "onPicker"]);
mounted(() => {
  initColorPicker();
});

onUnmounted(() => {
  instantPicker.destroy();
  $(document).off("click", ".eye-dropper");
});

function initColorPicker() {
  instantPicker = colorpick.create({
    color: setColor.value,
    position: "inline",
    container: colorRef.value,
    type: initType.value ?? "",
    swatchColors: [],
    useInformation: false,
    format: initFormat.value ?? "hex",
    outputFormat: initOutputFormat.value ?? "hex",
    paletteWidth: 100,
    paletteHeight: 100,
    paletteThickness: 12,
    onInit: (I) => {},
    onChange: (color) => {
      dataColor.value = color;
      emit("onChange", color);
    },
    onLastUpdate: (color) => {},
    onChangeFormat: (f) => {},
    onDestroy: (d) => {},
  });
}

async function eyeDropper() {
  emit("onPicker");
  if (!window.EyeDropper) {
    alert("Your browser does not support the EyeDropper API");
    return;
  }

  const eyeDropperInstance = new EyeDropper();

  try {
    const result = await eyeDropperInstance.open();
    instantPicker.initColor(result.sRGBHex, "hex");
  } catch (error) {
    console.error("Error picking color:", error);
    alert("Error picking color: " + error.message);
  }
}
</script>

<style lang="scss">
.eye-dropper {
  font-size: 18px;
  width: 18px;
  height: 18px;
  display: flex;
  color: var(--color-w-b-2);
  position: absolute;
  user-select: none;
  cursor: pointer;
  position: absolute;
  z-index: 1010;
  top: 170px;
  left: 18px;
}

.easylogic-colorpicker {
  border-radius: 10px;
  overflow: hidden;
  background-color: var(--bg-content);
  border: none;

  .arrow {
  }

  .colorpicker-body {
    background-color: var(--bg-content);
    .color {
      .saturation {
        .value {
          .drag-pointer {
            .left-saturation,
            .right-saturation,
            .top-value,
            .bottom-value {
              display: none;
            }
          }
        }
      }
    }

    .control {
      .empty {
      }

      .color {
      }

      .empty2 {
        display: none;
      }

      .color2 {
        display: none;
      }
    }

    .information {
    }

    .colorsets {
      .menu {
        display: none;
      }

      .color-list {
        margin-right: unset !important;
        display: none;
      }
    }

    .color-chooser {
    }

    .colorsets-contextmenu {
    }

    h6 {
      display: none !important;
    }
  }
}
.information-item {
  .input-field {
    .input {
      border: none !important;
      background-color: var(--bg-wrapper) !important;
      color: var(--color-w-b-1) !important;
    }
  }
}
</style>
