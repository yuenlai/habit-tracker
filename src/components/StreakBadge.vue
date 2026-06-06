<template>
  <span class="streak-badge" :class="{ 'has-streak': streak > 0 }">
    <span v-if="streak > 0" class="streak-fire">🔥</span>
    <span class="streak-text">连续 {{ streak }} 天</span>
  </span>
</template>

<script setup>
defineProps({
  streak: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #f5f5f5;
  font-size: 12px;
  color: #999;
}

.streak-badge.has-streak {
  background: #fff3e0;
  color: #e65100;
}

.streak-fire {
  font-size: 14px;
}

.streak-text {
  font-weight: 600;
}
</style>
