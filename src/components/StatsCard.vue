<template>
  <div class="stats-card" :style="{ '--accent-color': color }">
    <div class="stats-icon">
      <el-icon :size="28" :color="color"><component :is="icon" /></el-icon>
    </div>
    <div class="stats-content">
      <div class="stats-value">{{ value }}</div>
      <div class="stats-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: [String, Object],
    default: 'TrendCharts'
  },
  color: {
    type: String,
    default: '#6366f1'
  }
})
</script>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent-color) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-content {
  flex: 1;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stats-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}
</style>
