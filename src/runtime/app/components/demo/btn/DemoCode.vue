<template>
  <div class="demo-code">
    <button type="button" class="demo-code__copy" @click="copy">
      <i :class="copied ? 'ri-check-line' : 'ri-file-copy-line'" />
      {{ copied ? 'Copied' : 'Copy' }}
    </button>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<script setup>
const props = defineProps({
  code: { type: String, required: true },
})

const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1400)
  } catch {
    /* clipboard blocked: ignore */
  }
}
</script>

<style lang="scss" scoped>
.demo-code {
  position: relative;
  border-radius: 12px;
  background: #151a2e;
  color: #d8dcf0;

  pre {
    margin: 0;
    padding: 16px 18px;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12.5px;
    line-height: 1.65;
    tab-size: 2;
  }

  &__copy {
    position: absolute;
    top: 8px;
    right: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.06);
    color: #c9cfee;
    font-size: 11.5px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  }
}
</style>
