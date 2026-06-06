<template>
  <div class="icon-selector">
    <div class="icon-grid">
      <button
        v-for="icon in icons"
        :key="icon"
        class="icon-option"
        :class="{ selected: modelValue === icon }"
        @click="$emit('update:modelValue', icon)"
        type="button"
      >
        {{ icon }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '🎯'
  }
})

defineEmits(['update:modelValue'])

const icons = [
  '🏃', '📚', '💧', '🧘', '📝',
  '💪', '🎵', '🎨', '💻', '🍎',
  '🥗', '😴', '🚶', '🏋️', '🧹',
  '💊', '📱', '🎯', '🌅', '🙏',
  '🎸', '🏊', '🚴', '🧠', '💰'
]
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.icon-option {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  background: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:hover {
  border-color: #6366f1;
  transform: scale(1.05);
}

.icon-option.selected {
  border-color: #6366f1;
  background: #eef2ff;
}
</style>
