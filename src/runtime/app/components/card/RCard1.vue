<template>
  <div class="r-card" :class="[variant && `r-card--${variant}`, { clickable }]" @click="handleClick">
    <div v-if="$slots.header || title" class="r-card__header">
      <slot name="header">
        <h3 class="r-card__title">{{ title }}</h3>
      </slot>
    </div>

    <div class="r-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="r-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'gold'
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (props.clickable) emit('click')
}
</script>

<style lang="scss" scoped>
.r-card {
  border: 1px solid var(--border-card);
  border-radius: 12px;
  background: var(--bg-content);
  padding: 16px;
  transition: 0.2s ease;
}

.r-card__header {
  margin-bottom: 10px;
}

.r-card__title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.r-card__body {
  font-size: 14px;
  color: var(--color-w-b-1);
}

.r-card__footer {
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-w-b-1);
}

.r-card.clickable {
  cursor: pointer;
}

.r-card.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 2px var(--bg-hover);
}

.r-card {
  overflow: hidden;

  transition:
    all 0.25s ease;

  border: 1px solid var(--border);

  background: var(--card-bg);

  border-radius: 20px;

  position: relative;

  /* -----------------------------
   * HOVER
   * ----------------------------- */
  &--hover {
    &:hover {
      border-color: var(--border-2);

      transform: translateY(-3px);

      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.06);
    }
  }

  /* -----------------------------
   * GOLD
   * ----------------------------- */
  &--gold {
    border-color: rgba(201, 134, 42, 0.35);

    background: linear-gradient(
      135deg,
      rgba(201, 134, 42, 0.06),
      rgba(232, 168, 62, 0.03)
    );
  }

  /* -----------------------------
   * GLOW
   * ----------------------------- */
  &--glow {
    border-color: var(--border);

    background: linear-gradient(
      135deg,
      rgba(201, 134, 42, 0.06),
      rgba(232, 168, 62, 0.03)
    );

    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.02),
      0 0 20px rgba(201, 134, 42, 0.12);
  }

  /* -----------------------------
   * PRIMARY
   * ----------------------------- */
  &--primary {
    border-color: rgba(59, 130, 246, 0.3);

    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.08),
      rgba(37, 99, 235, 0.03)
    );
  }

  /* -----------------------------
   * SUCCESS
   * ----------------------------- */
  &--success {
    border-color: rgba(16, 185, 129, 0.3);

    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.08),
      rgba(5, 150, 105, 0.03)
    );
  }

  /* -----------------------------
   * WARNING
   * ----------------------------- */
  &--warning {
    border-color: rgba(245, 158, 11, 0.35);

    background: linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.08),
      rgba(217, 119, 6, 0.03)
    );
  }

  /* -----------------------------
   * DANGER
   * ----------------------------- */
  &--danger {
    border-color: rgba(239, 68, 68, 0.3);

    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.08),
      rgba(220, 38, 38, 0.03)
    );
  }

  /* -----------------------------
   * INFO
   * ----------------------------- */
  &--info {
    border-color: rgba(6, 182, 212, 0.3);

    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.08),
      rgba(14, 116, 144, 0.03)
    );
  }

  /* -----------------------------
   * PURPLE
   * ----------------------------- */
  &--purple {
    border-color: rgba(168, 85, 247, 0.3);

    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.08),
      rgba(126, 34, 206, 0.03)
    );
  }

  /* -----------------------------
   * PINK
   * ----------------------------- */
  &--pink {
    border-color: rgba(236, 72, 153, 0.3);

    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.08),
      rgba(190, 24, 93, 0.03)
    );
  }

  /* -----------------------------
   * DARK
   * ----------------------------- */
  &--dark {
    border-color: rgba(51, 65, 85, 0.7);

    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.95),
      rgba(15, 23, 42, 0.92)
    );

    color: #e2e8f0;
  }

  /* -----------------------------
   * GLASS
   * ----------------------------- */
  &--glass {
    background: rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(16px);

    -webkit-backdrop-filter: blur(16px);

    border: 1px solid rgba(255, 255, 255, 0.12);

    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.08);
  }

  /* -----------------------------
   * OUTLINE
   * ----------------------------- */
  &--outline {
    background: transparent;

    border: 1px solid var(--border-2);
  }

  /* -----------------------------
   * SOFT
   * ----------------------------- */
  &--soft {
    background: var(--bg-soft);

    border-color: transparent;
  }

  /* -----------------------------
   * FLAT
   * ----------------------------- */
  &--flat {
    box-shadow: none;

    border-color: transparent;

    background: var(--bg-soft);
  }

  /* -----------------------------
   * NEUMORPHISM
   * ----------------------------- */
  &--neo {
    background: #e5e7eb;

    border: none;

    box-shadow:
      8px 8px 18px rgba(163, 177, 198, 0.45),
      -8px -8px 18px rgba(255, 255, 255, 0.8);
  }

  /* -----------------------------
   * GRADIENT
   * ----------------------------- */
  &--gradient {
    border: none;

    color: white;

    background: linear-gradient(
      135deg,
      #6366f1,
      #8b5cf6,
      #ec4899
    );
  }

  /* -----------------------------
   * BORDER LEFT
   * ----------------------------- */
  &--left-accent {
    border-left: 4px solid #6366f1;
  }

  /* -----------------------------
   * BORDER TOP
   * ----------------------------- */
  &--top-accent {
    border-top: 4px solid #8b5cf6;
  }

  /* -----------------------------
   * SHADOW XL
   * ----------------------------- */
  &--shadow-xl {
    box-shadow:
      0 20px 45px rgba(0, 0, 0, 0.12);
  }
}

.card-head {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 1px;
}

.card-action {
  font-size: 12px;
  color: var(--gold-2);
  cursor: pointer;
  transition: 0,2ms;
  white-space: nowrap;

  &:hover { color: var(--gold-1); }
}

.card-body {
  padding: 16px 20px;

}

.card-body--no-pad { padding: 0; }
.card-body--tight  { padding: 12px 16px; }

// ── Ceremony card variant
.ceremony-card {
  padding: 20px;
  cursor: pointer;
  transition: 0,2ms;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--gold-3), var(--gold-2));
  }

  &:hover { border-color: var(--border-2); }

  &.selected {
    border-color: var(--gold-3);
    background: var(--gold-glow);
  }

  .cc-icon { font-size: 30px; margin-bottom: 10px; }

  .cc-name {
    color: var(--text-1);
  }

  .cc-desc {
    font-size: 12px;
    color: var(--text-3);
    margin-top: 4px;
  }

  .cc-count {
    font-size: 11px;
    color: var(--gold-2);
    margin-top: 8px;
  }

  &--add {
    border-style: dashed;
    opacity: 0.6;
    flex-direction: column;
    min-height: 140px;

    .add-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .add-label {
      font-size: 13px;
      color: var(--text-3);
    }
  }
}
</style>

<!-- 
Usage
<RCard variant="gold" />
<RCard variant="primary" />
<RCard variant="success" />
<RCard variant="danger" />
<RCard variant="glass" />
<RCard variant="neo" />
<RCard variant="gradient" />
<RCard variant="top-accent" />
<RCard variant="shadow-xl" /> -->