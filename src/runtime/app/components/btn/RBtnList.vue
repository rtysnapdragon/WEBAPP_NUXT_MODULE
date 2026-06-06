<template>
  <div v-if="showIfAllowed" class="ocs-btn-list" :class="disabled == true ? 'disabled' : ''" @click="fnClick">

    <div class="icon" :class="[color]">
      <slot :name="`${type}icon`">
        <i :class="[icon]"></i>
      </slot>
    </div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const dataMenu = useMenuStore();
const props = defineProps([
  'type',
  "icon",
  "color",
  "label",
  "disabled",
  "permission",
  "showIfAllowed",
]);
const icon = computed(() => {
  let icon = props.icon;
  if (props.icon?.toLowerCase() == "create") icon = "ri-add-circle-line";
  else if (props.icon.toLowerCase() == "print") icon = "ri-printer-line";
  else if (props.icon.toLowerCase() == "scan") icon = "ri-qr-code-line";
  else if (props.icon.toLowerCase() == "void") icon = "ri-forbid-2-line";
  else if (props.icon.toLowerCase() == "delete") icon = "ri-delete-bin-3-line";
  else if (props.icon.toLowerCase() == "approve") icon = "ri-check-line";
  else if (props.icon.toLowerCase() == "release")
    icon = "ri-corner-up-right-line";
  else if (props.icon.toLowerCase() == "hold") icon = "ri-hand";
  else if (props.icon.toLowerCase() == "share") icon = "ri-share-line";
  else if (props.icon.toLowerCase() == "setting") icon = "ri-settings-4-line";
  else if (props.icon.toLowerCase() == "copy") icon = "ri-file-copy-line";
  else if (props.icon.toLowerCase() == "cancel") icon = "ri-close-line";
  else if (props.icon.toLowerCase() == "apply") icon = "ri-check-line";
  else if (props.icon.toLowerCase() == "review") icon = "ri-phone-find-line";
  else if (props.icon.toLowerCase() == "update") icon = "ri-check-line";
  else if (props.icon.toLowerCase() == "save") icon = "ri-save-3-line";
  else if (props.icon.toLowerCase() == "save-update") icon = "ri-check-line";
  else if (props.icon.toLowerCase() == "reset") icon = "ri-refresh-line";
  else if (props.icon.toLowerCase() == "next") icon = "ri-arrow-right-s-line";
  else if (props.icon.toLowerCase() == "back") icon = "ri-arrow-left-s-line";
  else if (props.icon.toLowerCase() == "send") icon = "ri-send-plane-line";
  else if (props.icon.toLowerCase() == "email") icon = "ri-mail-line";
  else if (props.icon.toLowerCase() == "key") icon = "ri-key-2-line";
  else if (props.icon.toLowerCase() == "phone") icon = "ri-phone-line";
  else if (props.icon.toLowerCase() == "draft") icon = "ri-draft-line";
  else if (props.icon.toLowerCase() == "cash") icon = "ri-cash-line";
  return icon;
});
const type = computed(() => props.type)
const color = computed(() => props.color?.toLowerCase());
const label = computed(() => props.label);
const disabled = computed(() => isNotEmpty(props.disabled));
const permission = computed(() => props.permission);
const per = dataMenu.getActionPermission(permission.value);
const showIfAllowed = computed(() =>
  per == 1 ? true : props.showIfAllowed ?? true
);
const emit = defineEmits(["click"]);
const toast = useToast();
function fnClick() {
  if (per == 1) {
    emit("click");
  } else {
    toast.add({
      color: "yellow",
      title: `You don't have permission to ${label.value}.`,
      description: "Contact to administrator for permission.",
    });
  }
}
</script>

<style lang="scss" scoped>
.ocs-btn-list {
  height: 32px;
  padding: 0px 10px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: 0.15s ease-in-out;
  cursor: pointer;
  user-select: none;

  &.disabled {
    opacity: 0.5;
    pointer-events: none !important;

    .icon {
      color: var(--color-w-b-2) !important;
    }
  }

  &:hover {
    background: var(--bg-content);
  }

  .icon {
    width: 22px;
    font-size: 15px;
    line-height: 15px;

    // &.create,
    // &.view {
    //   color: var(--ocs-c-nenoBlue);
    // }
    // &.edit {
    //   color: var(--ocs-c-capture);
    // }
    // &.delete {
    //   color: var(--ocs-c-red);
    // }
    // &.approve {
    //   color: var(--ocs-c-green);
    // }
    // &.setting {
    //   color: var(--ocs-c-purple);
    // }
    // &.print {
    //   color: var(--ocs-c-orange);
    // }
    // &.release {
    //   color: var(--ocs-c-capture);
    // }

    &.more {
      color: var(--ocs-c-gray);
    }

    &.cash,
    &.create,
    &.apply,
    &.next,
    &.send {
      color: var(--ocs-c-nenoBlue);
    }

    &.print {
      color: var(--ocs-c-orange);
    }

    &.scan,
    &.cancel,
    &.back {
      color: var(--color-w-b-4);
    }

    &.hold {
      color: var(--ocs-c-gray);
    }

    &.approve,
    &.update,
    &.save,
    &.save-update {
      color: var(--ocs-c-green);
    }

    &.setting,
    &.copy,
    &.key {
      color: var(--ocs-c-purple);
    }

    &.email {
      color: var(--ocs-c-orangeRed);
    }

    &.phone,
    &.release {
      color: var(--ocs-c-capture);
    }

    &.void,
    &.delete {
      color: var(--ocs-c-red);
    }

    &.share {
      color: var(--ocs-c-blue);
    }

    &.reset {
      color: var(--ocs-c-purpleBlack);
    }

    &.employee {
      color: #659277 !important;
    }

    &.clone {
      color: #7c72ff;
    }

    &.change-en {
      color: #4395f1;
    }

    &.helper {
      color: #a7a7a7;
    }
  }

  .label {
    font-size: 14px;
    font-family: var(--font-400);
    line-height: 14px;
    color: var(--color-w-b-2);
    white-space: nowrap;
  }
}
</style>
