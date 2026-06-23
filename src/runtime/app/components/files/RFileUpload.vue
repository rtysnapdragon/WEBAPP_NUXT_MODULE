<script setup>
// RFileUpload — SARIKA
// Full UFileUpload wrapper: all props/slots/emits/exposes
// Extras: per-file progress, error+retry, crop popup, frontend compress,
//         remove one / remove all, dimension + size warnings, glass UI
// No lang="ts" — plain <script setup>

import {
  ref, computed, watch, nextTick, useTemplateRef, defineExpose, defineSlots
} from 'vue'
import { useI18n } from 'vue-i18n'

// ── Props ─────────────────────────────────────────────────────────────────
const props = defineProps({
  // ── UFileUpload passthrough ──────────────────────────
  modelValue:   { type: Array,   default: () => [] },       // File[]
  multiple:     { type: Boolean, default: false },
  accept:       { type: String,  default: null  },
  maxSize:      { type: Number,  default: null  },           // bytes
  maxFiles:     { type: Number,  default: null  },
  label:        { type: String,  default: 'Drop files here' },
  description:  { type: String,  default: null  },
  icon:         { type: String,  default: 'i-lucide-upload-cloud' },
  layout:       { type: String,  default: 'grid' },         // 'grid'|'list'
  interactive:  { type: Boolean, default: true  },
  disabled:     { type: Boolean, default: false },
  ui:           { type: Object,  default: () => ({}) },

  // ── SARIKA extras ────────────────────────────────────
  // Dimension limits (images only)
  maxWidth:     { type: Number,  default: null  },          // px
  maxHeight:    { type: Number,  default: null  },          // px
  minWidth:     { type: Number,  default: null  },
  minHeight:    { type: Number,  default: null  },

  // Compression
  compress:     { type: Boolean, default: false },
  compressQuality: { type: Number, default: 0.82 },         // 0–1
  compressMaxPx:   { type: Number, default: 1920 },         // longest edge

  // Crop
  crop:         { type: Boolean, default: false },
  cropAspect:   { type: Number,  default: null  },          // e.g. 16/9

  // Upload handler (optional — triggers progress simulation or real upload)
  uploadFn:     { type: Function, default: null },          // async (file) => void

  // Labels bilingual
  labelKm:      { type: String, default: null },
  descriptionKm:{ type: String, default: null },
})

const emit = defineEmits([
  'update:modelValue',
  'change',           // File[]
  'add',              // File
  'remove',           // File
  'clear',            // all removed
  'error',            // { file, message }
  'upload-start',     // { file }
  'upload-progress',  // { file, percent }
  'upload-success',   // { file }
  'upload-error',     // { file, error }
  'upload-complete',  // all done
  'crop-open',        // { file }
  'crop-save',        // { original, cropped }
  'compress-done',    // { original, compressed }
])

const { locale } = useI18n()
const fileUploadRef = useTemplateRef('fuRef')

// ── File entry state ───────────────────────────────────────────────────────
// Each entry: { file, id, preview, status, progress, error, compressed, cropped }
const entries = ref([])
let _nextId = 1

function makeEntry(file) {
  return {
    id:         _nextId++,
    file,
    preview:    null,
    status:     'idle',   // idle|compressing|uploading|success|error
    progress:   0,
    error:      null,
    compressed: null,     // File after compression
    cropped:    null,     // File after crop
    dimError:   null,     // dimension warning message
  }
}

// ── modelValue sync ────────────────────────────────────────────────────────
const internalFiles = computed(() => props.modelValue)

watch(() => props.modelValue, (files) => {
  // sync any new files not yet in entries
  files.forEach(f => {
    if (!entries.value.find(e => e.file === f)) {
      const entry = makeEntry(f)
      entries.value.push(entry)
      initEntry(entry)
    }
  })
  // remove entries whose files are gone
  entries.value = entries.value.filter(e => files.includes(e.file))
})

// ── Warning / error state ──────────────────────────────────────────────────
const globalWarnings = ref([])

function addWarning(msg) {
  const id = _nextId++
  globalWarnings.value.push({ id, msg })
  setTimeout(() => {
    globalWarnings.value = globalWarnings.value.filter(w => w.id !== id)
  }, 5000)
}

// ── Init entry: preview + dimension check + compress + upload ─────────────
async function initEntry(entry) {
  const file = entry.file
  const isImage = file.type.startsWith('image/')

  // ── Preview
  if (isImage) {
    entry.preview = URL.createObjectURL(file)
  }

  // ── Dimension check
  if (isImage && (props.maxWidth || props.maxHeight || props.minWidth || props.minHeight)) {
    const dims = await getImageDimensions(file)
    const errs = []
    if (props.maxWidth  && dims.w > props.maxWidth)  errs.push(`Max width ${props.maxWidth}px (got ${dims.w}px)`)
    if (props.maxHeight && dims.h > props.maxHeight) errs.push(`Max height ${props.maxHeight}px (got ${dims.h}px)`)
    if (props.minWidth  && dims.w < props.minWidth)  errs.push(`Min width ${props.minWidth}px (got ${dims.w}px)`)
    if (props.minHeight && dims.h < props.minHeight) errs.push(`Min height ${props.minHeight}px (got ${dims.h}px)`)
    if (errs.length) {
      entry.dimError = errs.join(' · ')
      entry.status   = 'error'
      entry.error    = entry.dimError
      emit('error', { file, message: entry.dimError })
      return
    }
  }

  // ── Compress
  if (props.compress && isImage && file.type !== 'image/gif') {
    entry.status = 'compressing'
    try {
      const compressed = await compressImage(file, props.compressQuality, props.compressMaxPx)
      entry.compressed = compressed
      emit('compress-done', { original: file, compressed })
    } catch (e) {
      // non-fatal — proceed with original
    }
    entry.status = 'idle'
  }

  // ── Crop popup (if crop=true, pause until user saves)
  if (props.crop && isImage) {
    openCrop(entry)
    return  // upload starts after crop save
  }

  // ── Upload
  if (props.uploadFn) {
    await uploadEntry(entry)
  }
}

// ── Image helpers ─────────────────────────────────────────────────────────
function getImageDimensions(file) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = URL.createObjectURL(file)
  })
}

async function compressImage(file, quality, maxPx) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img
      const ratio = Math.min(maxPx / w, maxPx / h, 1)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => {
          if (!blob) { reject(new Error('compress failed')); return }
          resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }))
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// ── Upload per entry ──────────────────────────────────────────────────────
async function uploadEntry(entry) {
  const fileToUpload = entry.cropped ?? entry.compressed ?? entry.file
  entry.status   = 'uploading'
  entry.progress = 0
  entry.error    = null
  emit('upload-start', { file: fileToUpload })

  try {
    // If uploadFn accepts a progress callback
    await props.uploadFn(fileToUpload, (pct) => {
      entry.progress = Math.min(pct, 99)
      emit('upload-progress', { file: fileToUpload, percent: pct })
    })
    entry.progress = 100
    entry.status   = 'success'
    emit('upload-success', { file: fileToUpload })
  } catch (err) {
    entry.status = 'error'
    entry.error  = err?.message ?? 'Upload failed'
    emit('upload-error', { file: fileToUpload, error: err })
  }

  // Check if all done
  const remaining = entries.value.filter(e => e.status === 'uploading')
  if (remaining.length === 0) {
    emit('upload-complete')
  }
}

async function retryEntry(entry) {
  if (!props.uploadFn) return
  await uploadEntry(entry)
}

async function retryAll() {
  const failed = entries.value.filter(e => e.status === 'error')
  for (const e of failed) {
    await retryEntry(e)
  }
}

const hasAnyError = computed(() => entries.value.some(e => e.status === 'error'))
const allUploading = computed(() => entries.value.some(e => e.status === 'uploading'))
const successCount = computed(() => entries.value.filter(e => e.status === 'success').length)

// ── Remove ────────────────────────────────────────────────────────────────
function removeEntry(entry) {
  const idx = entries.value.indexOf(entry)
  if (idx !== -1) entries.value.splice(idx, 1)
  const newFiles = entries.value.map(e => e.file)
  emit('update:modelValue', newFiles)
  emit('remove', entry.file)
}

function removeAll() {
  entries.value = []
  emit('update:modelValue', [])
  emit('clear')
}

// ── File size display ─────────────────────────────────────────────────────
function fmtSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fmtName(name, max = 28) {
  if (!name) return ''
  if (name.length <= max) return name
  const ext  = name.includes('.') ? name.split('.').pop() : ''
  const base = name.slice(0, max - ext.length - 4)
  return `${base}…${ext ? `.${ext}` : ''}`
}

// ── Crop popup state ──────────────────────────────────────────────────────
const cropEntry   = ref(null)
const cropCanvas  = ref(null)
const cropOpen    = ref(false)
const cropImg     = ref(null)

// Simple crop state: drag rectangle
const cropRect = ref({ x: 0, y: 0, w: 0, h: 0 })
const isDragging = ref(false)
const dragStart  = ref({ x: 0, y: 0 })

function openCrop(entry) {
  cropEntry.value = entry
  cropOpen.value  = true
  emit('crop-open', { file: entry.file })
  nextTick(() => drawCropPreview())
}

function drawCropPreview() {
  if (!cropImg.value) return
  const img = cropImg.value
  const { naturalWidth: w, naturalHeight: h } = img
  const aspect = props.cropAspect ?? (w / h)
  // default full image crop rect
  if (cropRect.value.w === 0) {
    if (aspect >= w / h) {
      cropRect.value = { x: 0, y: 0, w: w, h: Math.round(w / aspect) }
    } else {
      cropRect.value = { x: 0, y: 0, w: Math.round(h * aspect), h }
    }
  }
}

async function saveCrop() {
  if (!cropEntry.value || !cropImg.value) return
  const img    = cropImg.value
  const r      = cropRect.value
  const canvas = document.createElement('canvas')
  canvas.width  = r.w
  canvas.height = r.h
  canvas.getContext('2d').drawImage(img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h)
  const entry  = cropEntry.value
  const cropped = await new Promise(res =>
    canvas.toBlob(b => res(new File([b], entry.file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.92)
  )
  entry.cropped  = cropped
  entry.preview  = URL.createObjectURL(cropped)
  cropOpen.value = false
  emit('crop-save', { original: entry.file, cropped })
  if (props.uploadFn) await uploadEntry(entry)
}

function cancelCrop() {
  cropOpen.value = false
  // remove the pending entry since user cancelled
  if (cropEntry.value) removeEntry(cropEntry.value)
  cropEntry.value = null
}

// ── Merged NuxtUI ui (SARIKA tokens over defaults) ────────────────────────
const mergedUi = computed(() => ({
  root:        'rfu__root',
  dropzone:    'rfu__dropzone',
  icon:        'rfu__drop-icon',
  label:       'rfu__drop-label',
  description: 'rfu__drop-desc',
  files:       'rfu__files-area',
  ...props.ui,
}))

// ── Resolved labels ───────────────────────────────────────────────────────
const resolvedLabel = computed(() =>
  locale.value === 'km' && props.labelKm ? props.labelKm : props.label
)
const resolvedDesc = computed(() =>
  locale.value === 'km' && props.descriptionKm ? props.descriptionKm : props.description
)

// ── Change handler (from UFileUpload) ────────────────────────────────────
function onFileChange(files) {
  emit('change', files)
  files.forEach(f => {
    emit('add', f)
  })
}

// ── Expose ────────────────────────────────────────────────────────────────
defineExpose({
  open:       () => fileUploadRef.value?.open?.(),
  clear:      removeAll,
  retry:      retryAll,
  retryFile:  retryEntry,
  entries,
  getCompressed: () => entries.value.map(e => e.compressed ?? e.file),
})
</script>

<template>
  <div class="rfu-wrap">

    <!-- ══ Global warnings ══════════════════════════════ -->
    <TransitionGroup name="rfu-warn" tag="div" class="rfu-warnings">
      <div
        v-for="w in globalWarnings"
        :key="w.id"
        class="rfu-warnings__item"
      >
        <i class="ri-error-warning-line" aria-hidden="true" />
        {{ w.msg }}
      </div>
    </TransitionGroup>

    <!-- ══ UFileUpload core ═════════════════════════════ -->
    <UFileUpload
      ref="fuRef"
      :model-value="modelValue"
      :multiple="multiple"
      :accept="accept"
      :max-size="maxSize"
      :max-files="maxFiles"
      :label="resolvedLabel"
      :description="resolvedDesc"
      :icon="icon"
      :layout="layout"
      :interactive="interactive"
      :disabled="disabled"
      :ui="mergedUi"
      class="rfu"
      @update:model-value="$emit('update:modelValue', $event)"
      @change="onFileChange"
    >

      <!-- ── #actions slot ─────────────────────────────── -->
      <template #actions="scope">
        <slot name="actions" v-bind="scope">
          <button type="button" class="rfu__action-btn" @click="scope.open?.()">
            <i class="ri-upload-cloud-2-line" aria-hidden="true" />
            {{ locale === 'km' ? 'ជ្រើសរើសឯកសារ' : 'Select files' }}
          </button>
        </slot>
      </template>

      <!-- ── #files slot — the full list override ─────── -->
      <template #files="scope">
        <slot name="files" v-bind="scope">

          <div v-if="entries.length" class="rfu__file-list">

            <!-- Header row -->
            <div class="rfu__file-list-head">
              <span class="rfu__file-count">
                {{ entries.length }} {{ entries.length === 1 ? 'file' : 'files' }}
                <template v-if="props.uploadFn">
                  · <span class="rfu__file-ok">{{ successCount }} done</span>
                </template>
              </span>

              <div class="rfu__file-list-actions">
                <!-- Retry all -->
                <button
                  v-if="hasAnyError && props.uploadFn"
                  type="button"
                  class="rfu__icon-btn rfu__icon-btn--warn"
                  title="Retry all failed"
                  @click="retryAll"
                >
                  <i class="ri-refresh-line" aria-hidden="true" />
                  <span>{{ locale === 'km' ? 'ព្យាយាមទាំងអស់' : 'Retry all' }}</span>
                </button>

                <!-- Remove all -->
                <button
                  type="button"
                  class="rfu__icon-btn rfu__icon-btn--danger"
                  title="Remove all files"
                  @click="removeAll"
                >
                  <i class="ri-delete-bin-2-line" aria-hidden="true" />
                  <span>{{ locale === 'km' ? 'លុបទាំងអស់' : 'Remove all' }}</span>
                </button>
              </div>
            </div>

            <!-- File rows -->
            <TransitionGroup name="rfu-entry" tag="div" class="rfu__entries">
              <div
                v-for="entry in entries"
                :key="entry.id"
                :class="[
                  'rfu__entry',
                  `rfu__entry--${entry.status}`,
                ]"
              >
                <!-- Preview / icon -->
                <div class="rfu__entry-thumb">
                  <img
                    v-if="entry.preview"
                    :src="entry.preview"
                    :alt="entry.file.name"
                    class="rfu__thumb-img"
                  />
                  <span v-else class="rfu__thumb-icon">
                    <i class="ri-file-line" aria-hidden="true" />
                  </span>

                  <!-- Status overlay on thumb -->
                  <div
                    v-if="entry.status === 'uploading' || entry.status === 'success' || entry.status === 'error'"
                    class="rfu__thumb-status"
                  >
                    <i
                      v-if="entry.status === 'success'"
                      class="ri-checkbox-circle-fill rfu__status-ok"
                      aria-hidden="true"
                    />
                    <i
                      v-else-if="entry.status === 'error'"
                      class="ri-error-warning-fill rfu__status-err"
                      aria-hidden="true"
                    />
                    <i
                      v-else-if="entry.status === 'compressing'"
                      class="ri-loader-4-line animate-spin rfu__status-spin"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <!-- Info -->
                <div class="rfu__entry-info">
                  <div class="rfu__entry-name" :title="entry.file.name">
                    {{ fmtName(entry.file.name) }}
                  </div>

                  <div class="rfu__entry-meta">
                    <span>{{ fmtSize(entry.compressed?.size ?? entry.file.size) }}</span>
                    <template v-if="entry.compressed">
                      <span class="rfu__compress-badge">
                        <i class="ri-arrow-down-line" aria-hidden="true" />
                        {{ Math.round((1 - entry.compressed.size / entry.file.size) * 100) }}%
                      </span>
                    </template>
                  </div>

                  <!-- Dimension / upload error -->
                  <div v-if="entry.error" class="rfu__entry-error">
                    <i class="ri-error-warning-line" aria-hidden="true" />
                    {{ entry.error }}
                  </div>

                  <!-- Progress bar -->
                  <div v-if="entry.status === 'uploading' || entry.status === 'success'" class="rfu__progress-track">
                    <div
                      class="rfu__progress-fill"
                      :class="{ 'rfu__progress-fill--done': entry.status === 'success' }"
                      :style="{ width: entry.progress + '%' }"
                    />
                  </div>
                </div>

                <!-- Actions -->
                <div class="rfu__entry-btns">
                  <!-- Crop -->
                  <button
                    v-if="crop && entry.file.type.startsWith('image/') && entry.status !== 'uploading'"
                    type="button"
                    class="rfu__btn-sm"
                    title="Crop"
                    @click="openCrop(entry)"
                  >
                    <i class="ri-crop-line" aria-hidden="true" />
                  </button>

                  <!-- Retry -->
                  <button
                    v-if="entry.status === 'error' && uploadFn"
                    type="button"
                    class="rfu__btn-sm rfu__btn-sm--warn"
                    title="Retry upload"
                    @click="retryEntry(entry)"
                  >
                    <i class="ri-refresh-line" aria-hidden="true" />
                  </button>

                  <!-- Remove -->
                  <button
                    v-if="entry.status !== 'uploading'"
                    type="button"
                    class="rfu__btn-sm rfu__btn-sm--danger"
                    title="Remove file"
                    @click="removeEntry(entry)"
                  >
                    <i class="ri-delete-bin-line" aria-hidden="true" />
                  </button>
                </div>

              </div><!-- /entry -->
            </TransitionGroup>

          </div>
        </slot>
      </template>

      <!-- ── #files-bottom slot ────────────────────────── -->
      <template #files-bottom="scope">
        <slot name="files-bottom" v-bind="scope" />
      </template>

      <!-- ── Passthrough remaining slots ──────────────── -->
      <template
        v-for="(_, name) in $slots"
        #[name]="slotProps"
      >
        <slot
          v-if="!['actions','files','files-bottom'].includes(name)"
          :name="name"
          v-bind="slotProps ?? {}"
        />
      </template>

    </UFileUpload>

    <!-- ══ Crop popup ═══════════════════════════════════ -->
    <Transition name="rfu-modal">
      <div v-if="cropOpen" class="rfu-crop-overlay" @click.self="cancelCrop">
        <div class="rfu-crop-panel">

          <!-- Header -->
          <div class="rfu-crop-panel__head">
            <div class="rfu-crop-panel__title">
              <i class="ri-crop-line" aria-hidden="true" />
              {{ locale === 'km' ? 'កាត់រូបភាព' : 'Crop image' }}
            </div>
            <button type="button" class="rfu-crop-panel__close" @click="cancelCrop">
              <i class="ri-close-line" aria-hidden="true" />
            </button>
          </div>

          <!-- Preview area -->
          <div class="rfu-crop-panel__body">
            <div class="rfu-crop-panel__preview">
              <img
                v-if="cropEntry"
                ref="cropImg"
                :src="cropEntry.preview"
                class="rfu-crop-panel__img"
                @load="drawCropPreview"
              />
              <div class="rfu-crop-panel__guide">
                <i class="ri-scissors-cut-line" aria-hidden="true" />
                <p>{{ locale === 'km' ? 'ការកាត់រូបភាពអនឡាញ' : 'Adjust crop via the inputs below' }}</p>
              </div>
            </div>

            <!-- Crop rect inputs -->
            <div class="rfu-crop-panel__inputs">
              <label class="rfu-crop-input">
                <span>X</span>
                <input v-model.number="cropRect.x" type="number" min="0" />
              </label>
              <label class="rfu-crop-input">
                <span>Y</span>
                <input v-model.number="cropRect.y" type="number" min="0" />
              </label>
              <label class="rfu-crop-input">
                <span>W</span>
                <input v-model.number="cropRect.w" type="number" min="1" />
              </label>
              <label class="rfu-crop-input">
                <span>H</span>
                <input v-model.number="cropRect.h" type="number" min="1" />
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="rfu-crop-panel__foot">
            <button type="button" class="rfu__icon-btn" @click="cancelCrop">
              <i class="ri-close-line" aria-hidden="true" />
              {{ locale === 'km' ? 'បោះបង់' : 'Cancel' }}
            </button>
            <button type="button" class="rfu__icon-btn rfu__icon-btn--accent" @click="saveCrop">
              <i class="ri-check-line" aria-hidden="true" />
              {{ locale === 'km' ? 'រក្សាទុក' : 'Apply crop' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>

// ─────────────────────────────────────────────────────────
// WRAPPER
// ─────────────────────────────────────────────────────────
.rfu-wrap {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-3, 12px);
  font-family:    var(--font-fallback, 'Inter', system-ui, sans-serif);
  position:       relative;
}

// ─────────────────────────────────────────────────────────
// GLOBAL WARNINGS STRIP
// ─────────────────────────────────────────────────────────
.rfu-warnings {
  display:        flex;
  flex-direction: column;
  gap:            6px;

  &__item {
    display:       flex;
    align-items:   center;
    gap:           8px;
    padding:       10px 14px;
    background:    rgba(248, 113, 113, 0.1);
    border:        1px solid rgba(248, 113, 113, 0.25);
    border-radius: var(--radius-md, 10px);
    font-size:     0.78rem;
    color:         var(--c-danger, #f87171);
    font-weight:   500;

    i { font-size: 1rem; flex-shrink: 0; }
  }
}

.rfu-warn-enter-active, .rfu-warn-leave-active { transition: all 0.2s ease; }
.rfu-warn-enter-from,  .rfu-warn-leave-to      { opacity: 0; transform: translateY(-6px); }

// ─────────────────────────────────────────────────────────
// ACTION BUTTON (replaces UButton in actions slot)
// ─────────────────────────────────────────────────────────
.rfu__action-btn {
  display:       inline-flex;
  align-items:   center;
  gap:           8px;
  padding:       8px 18px;
  border:        1px solid var(--c-border, rgba(255,140,66,0.16));
  border-radius: var(--radius-md, 10px);
  background:    transparent;
  color:         var(--c-text, #1a1510);
  font-size:     0.875rem;
  font-weight:   500;
  font-family:   inherit;
  cursor:        pointer;
  @include transition(fast);

  i { font-size: 1rem; color: var(--c-accent, #ff8c42); }

  &:hover {
    border-color: var(--c-accent, #ff8c42);
    color:        var(--c-accent, #ff8c42);
    background:   rgba(255, 140, 66, 0.06);
  }
}

// ─────────────────────────────────────────────────────────
// FILE LIST
// ─────────────────────────────────────────────────────────
.rfu__file-list {
  display:        flex;
  flex-direction: column;
  gap:            var(--space-2, 8px);
  margin-top:     var(--space-3, 12px);

  &-head {
    @include flex-between;
    padding:       0 var(--space-1, 4px);
    margin-bottom: var(--space-1, 4px);
  }

  &-actions {
    display:     flex;
    align-items: center;
    gap:         var(--space-2, 8px);
  }
}

.rfu__file-count {
  font-size:   0.75rem;
  color:       var(--c-muted, #8a7f72);
  font-weight: 500;
}

.rfu__file-ok {
  color:       var(--c-success, #4ade80);
  font-weight: 600;
}

// ─────────────────────────────────────────────────────────
// FILE ENTRY ROW
// ─────────────────────────────────────────────────────────
.rfu__entries { display: flex; flex-direction: column; gap: 8px; }

.rfu__entry {
  display:       flex;
  align-items:   center;
  gap:           var(--space-3, 12px);
  padding:       var(--space-3, 12px);
  background:    var(--glass-bg, rgba(255,255,255,0.72));
  border:        1px solid var(--c-border, rgba(255,140,66,0.16));
  border-radius: var(--radius-md, 10px);
  backdrop-filter: var(--glass-blur-sm, blur(12px) saturate(150%));
  -webkit-backdrop-filter: var(--glass-blur-sm, blur(12px) saturate(150%));
  @include transition;

  &--success { border-color: rgba(74, 222, 128, 0.3); }
  &--error   { border-color: rgba(248, 113, 113, 0.35); background: rgba(248,113,113,0.04); }
  &--uploading { border-color: rgba(255,140,66,0.3); }
  &--compressing { opacity: 0.8; }
}

.rfu-entry-enter-active { transition: all 0.25s ease; }
.rfu-entry-leave-active { transition: all 0.2s ease; }
.rfu-entry-enter-from   { opacity: 0; transform: translateX(-10px); }
.rfu-entry-leave-to     { opacity: 0; transform: translateX(10px); max-height: 0; }

// Thumbnail
.rfu__entry-thumb {
  position:      relative;
  width:         48px;
  height:        48px;
  flex-shrink:   0;
  border-radius: var(--radius-md, 10px);
  overflow:      hidden;
  background:    var(--bg-tertiary, #f1f3f6);
  @include flex-center;
}

.rfu__thumb-img {
  width:       100%;
  height:      100%;
  object-fit:  cover;
  border-radius: inherit;
}

.rfu__thumb-icon {
  font-size: 1.4rem;
  color:     var(--c-muted, #8a7f72);
  i { display: flex; }
}

.rfu__thumb-status {
  position:  absolute;
  inset:     0;
  @include flex-center;
  background: rgba(0,0,0,0.35);
  border-radius: inherit;
}

.rfu__status-ok   { font-size: 1.3rem; color: var(--c-success, #4ade80); }
.rfu__status-err  { font-size: 1.3rem; color: var(--c-danger, #f87171); }
.rfu__status-spin { font-size: 1.3rem; color: var(--c-accent, #ff8c42); }

// Info block
.rfu__entry-info {
  flex:    1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap:     4px;
}

.rfu__entry-name {
  font-size:   0.82rem;
  font-weight: 500;
  color:       var(--c-text, #1a1510);
  @include truncate;
}

.rfu__entry-meta {
  display:     flex;
  align-items: center;
  gap:         8px;
  font-size:   0.72rem;
  color:       var(--c-muted, #8a7f72);
}

.rfu__compress-badge {
  display:       inline-flex;
  align-items:   center;
  gap:           2px;
  padding:       1px 6px;
  background:    rgba(74, 222, 128, 0.12);
  color:         var(--c-success, #4ade80);
  border-radius: var(--radius-full, 9999px);
  font-size:     0.68rem;
  font-weight:   700;
}

.rfu__entry-error {
  display:     flex;
  align-items: center;
  gap:         4px;
  font-size:   0.72rem;
  color:       var(--c-danger, #f87171);
  font-weight: 500;
  i { font-size: 0.85rem; }
}

// Progress bar
.rfu__progress-track {
  height:        4px;
  background:    var(--c-border, rgba(255,140,66,0.16));
  border-radius: 999px;
  overflow:      hidden;
  margin-top:    2px;
}

.rfu__progress-fill {
  height:     100%;
  background: var(--c-accent, #ff8c42);
  border-radius: 999px;
  @include transition(slow);
  box-shadow: 0 0 8px rgba(255,140,66,0.4);

  &--done { background: var(--c-success, #4ade80); box-shadow: 0 0 8px rgba(74,222,128,0.4); }
}

// Entry action buttons
.rfu__entry-btns {
  display:     flex;
  align-items: center;
  gap:         6px;
  flex-shrink: 0;
}

.rfu__btn-sm {
  width:         28px;
  height:        28px;
  border:        1px solid var(--c-border, rgba(255,140,66,0.16));
  border-radius: var(--radius-sm, 6px);
  background:    transparent;
  color:         var(--c-muted, #8a7f72);
  cursor:        pointer;
  @include flex-center;
  @include transition(fast);
  font-size:     0.9rem;

  &:hover { border-color: var(--c-accent, #ff8c42); color: var(--c-accent, #ff8c42); }

  &--warn {
    &:hover { border-color: var(--color-yellow, #ffb347); color: var(--color-yellow, #ffb347); }
  }

  &--danger {
    &:hover { border-color: var(--c-danger, #f87171); color: var(--c-danger, #f87171); }
  }
}

// Icon buttons (list header)
.rfu__icon-btn {
  display:       inline-flex;
  align-items:   center;
  gap:           6px;
  padding:       5px 12px;
  border:        1px solid var(--c-border, rgba(255,140,66,0.16));
  border-radius: var(--radius-md, 10px);
  background:    transparent;
  color:         var(--c-muted, #8a7f72);
  font-size:     0.75rem;
  font-weight:   500;
  font-family:   inherit;
  cursor:        pointer;
  @include transition(fast);

  i { font-size: 0.88rem; }

  &:hover { border-color: var(--c-accent, #ff8c42); color: var(--c-accent, #ff8c42); }

  &--warn   { &:hover { border-color: var(--color-yellow, #ffb347); color: var(--color-yellow, #ffb347); } }
  &--danger { color: var(--c-muted); &:hover { border-color: var(--c-danger, #f87171); color: var(--c-danger, #f87171); } }
  &--accent {
    border-color: var(--c-accent, #ff8c42);
    background:   var(--c-accent, #ff8c42);
    color:        #fff;
    box-shadow:   0 0 16px rgba(255,140,66,0.25);
    &:hover { background: var(--c-accent-2, #ffb347); border-color: var(--c-accent-2, #ffb347); }
  }
}

// ─────────────────────────────────────────────────────────
// CROP MODAL
// ─────────────────────────────────────────────────────────
.rfu-crop-overlay {
  position:       fixed;
  inset:          0;
  z-index:        1000;
  background:     rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  @include flex-center;
  padding:        var(--space-4, 16px);
}

.rfu-crop-panel {
  width:          min(560px, 100%);
  background:     var(--glass-bg, rgba(255,255,255,0.92));
  backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  -webkit-backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  border:         1px solid var(--glass-border, rgba(255,140,66,0.16));
  border-radius:  var(--radius-xl, 24px);
  box-shadow:     var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.08));
  overflow:       hidden;
  display:        flex;
  flex-direction: column;

  &__head {
    @include flex-between;
    padding:       var(--space-4, 16px) var(--space-5, 20px);
    border-bottom: 1px solid var(--c-border, rgba(255,140,66,0.16));
  }

  &__title {
    display:     flex;
    align-items: center;
    gap:         8px;
    font-size:   0.95rem;
    font-weight: 700;
    color:       var(--c-text, #1a1510);
    i { color: var(--c-accent, #ff8c42); font-size: 1.1rem; }
  }

  &__close {
    width:         32px;
    height:        32px;
    border:        1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius: var(--radius-md, 10px);
    background:    transparent;
    color:         var(--c-muted, #8a7f72);
    cursor:        pointer;
    @include flex-center;
    @include transition(fast);
    font-size:     1rem;
    &:hover { border-color: var(--c-accent, #ff8c42); color: var(--c-accent, #ff8c42); }
  }

  &__body {
    display:        flex;
    flex-direction: column;
    gap:            var(--space-4, 16px);
    padding:        var(--space-5, 20px);
  }

  &__preview {
    position:      relative;
    width:         100%;
    background:    var(--bg-tertiary, #f1f3f6);
    border-radius: var(--radius-lg, 16px);
    overflow:      hidden;
    min-height:    200px;
    @include flex-center;
  }

  &__img {
    max-width:  100%;
    max-height: 320px;
    object-fit: contain;
    display:    block;
  }

  &__guide {
    position:       absolute;
    inset:          0;
    @include flex-center;
    flex-direction: column;
    gap:            8px;
    color:          var(--c-muted, #8a7f72);
    font-size:      0.8rem;
    pointer-events: none;
    opacity:        0.6;
    i { font-size: 1.8rem; color: var(--c-accent, #ff8c42); }
  }

  &__inputs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap:     var(--space-3, 12px);
  }

  &__foot {
    @include flex-between;
    padding:    var(--space-4, 16px) var(--space-5, 20px);
    border-top: 1px solid var(--c-border, rgba(255,140,66,0.16));
    background: rgba(0,0,0,0.02);
  }
}

.rfu-crop-input {
  display:        flex;
  flex-direction: column;
  gap:            4px;

  span {
    font-size:      0.68rem;
    font-weight:    700;
    color:          var(--c-muted, #8a7f72);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  input {
    width:         100%;
    height:        34px;
    padding:       0 10px;
    font-family:   inherit;
    font-size:     0.82rem;
    color:         var(--c-text, #1a1510);
    background:    var(--c-surface, #ffffff);
    border:        1px solid var(--c-border, rgba(255,140,66,0.16));
    border-radius: var(--radius-sm, 6px);
    outline:       none;
    @include transition(fast);
    &:focus { border-color: var(--c-accent, #ff8c42); box-shadow: 0 0 0 3px rgba(255,140,66,0.12); }
  }
}

// Crop modal transition
.rfu-modal-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rfu-modal-leave-active { transition: all 0.18s ease; }
.rfu-modal-enter-from   { opacity: 0; transform: scale(0.95); }
.rfu-modal-leave-to     { opacity: 0; transform: scale(0.96); }
</style>

<!-- ─────────────────────────────────────────────────────────
     GLOBAL — override NuxtUI UFileUpload portal tokens
     All UFileUpload :ui slot classes mapped here
────────────────────────────────────────────────────────── -->
<style lang="scss">
// ── Dropzone root ──────────────────────────────────────────
.rfu__root {
  width:         100%;
  font-family:   var(--font-fallback, 'Inter', system-ui, sans-serif) !important;
}

// ── Drop area ─────────────────────────────────────────────
.rfu__dropzone {
  position:        relative;
  display:         flex !important;
  flex-direction:  column !important;
  align-items:     center !important;
  justify-content: center !important;
  padding:         var(--space-8, 32px) var(--space-6, 24px) !important;
  border:          2px dashed var(--c-border, rgba(255,140,66,0.16)) !important;
  border-radius:   var(--radius-xl, 24px) !important;
  background:      var(--glass-bg, rgba(255,255,255,0.72)) !important;
  backdrop-filter: var(--glass-blur-sm, blur(12px) saturate(150%)) !important;
  -webkit-backdrop-filter: var(--glass-blur-sm, blur(12px) saturate(150%)) !important;
  box-shadow:      var(--glass-shadow, 0 8px 32px rgba(0,0,0,0.08)) !important;
  gap:             var(--space-3, 12px) !important;
  text-align:      center !important;
  @include transition;

  // Drag-over glow
  &[data-drag-over="true"],
  &:focus-within {
    border-color: var(--c-accent, #ff8c42) !important;
    background:   rgba(255, 140, 66, 0.04) !important;
    box-shadow:   0 0 40px rgba(255,140,66,0.12), var(--glass-shadow) !important;
  }
}

// ── Drop icon ─────────────────────────────────────────────
.rfu__drop-icon {
  font-size: 2.5rem !important;
  color:     var(--c-accent, #ff8c42) !important;
  filter:    drop-shadow(0 0 12px rgba(255,140,66,0.3)) !important;
  margin-bottom: var(--space-1, 4px) !important;
}

// ── Label + description ───────────────────────────────────
.rfu__drop-label {
  font-size:   1rem !important;
  font-weight: 600 !important;
  color:       var(--c-text, #1a1510) !important;
  font-family: var(--font-fallback, 'Inter', system-ui, sans-serif) !important;
}

.rfu__drop-desc {
  font-size: 0.78rem !important;
  color:     var(--c-muted, #8a7f72) !important;
  font-family: var(--font-fallback, 'Inter', system-ui, sans-serif) !important;
}

// ── Files area ────────────────────────────────────────────
.rfu__files-area {
  margin-top: var(--space-2, 8px) !important;
}

// ── Dark mode ─────────────────────────────────────────────
.dark {
  .rfu__dropzone {
    background: rgba(19,19,26,0.72) !important;
    border-color: var(--c-border, rgba(255,140,66,0.12)) !important;
  }

  .rfu__entry {
    background: rgba(19,19,26,0.72) !important;
  }

  .rfu-crop-panel {
    background: rgba(19,19,26,0.95) !important;
  }
}
</style>
