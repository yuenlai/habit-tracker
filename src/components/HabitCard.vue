<template>
  <div class="habit-card" :style="{ '--habit-color': habit.color }">
    <div class="card-border"></div>
    <div class="card-content">
      <div class="card-header">
        <span class="habit-icon">{{ habit.icon }}</span>
        <div class="header-right">
          <StreakBadge :streak="streak" />
          <span v-if="hasTodayDiary" class="diary-indicator" title="今天已写日记">📝</span>
        </div>
      </div>
      <h3 class="habit-name">{{ habit.name }}</h3>
      <div class="card-footer">
        <span class="completion-rate">{{ completionRate }}%</span>
        <button
          class="check-button"
          :class="{ checked: isChecked }"
          @click.stop="handleCheck"
          :disabled="animating"
        >
          <span v-if="isChecked" class="check-icon">✓</span>
          <span v-else class="check-circle"></span>
        </button>
      </div>
    </div>
    <!-- Confetti animation -->
    <div v-if="showConfetti" class="confetti-container">
      <span v-for="i in 8" :key="i" class="confetti-piece" :style="{ '--i': i }"></span>
    </div>

    <!-- Diary Dialog -->
    <DiaryDialog
      v-model:visible="showDiaryDialog"
      :habit-id="habit.id"
      @success="handleDiarySuccess"
      @skip="handleDiarySkip"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useHabitsStore } from '../stores/habits'
import StreakBadge from './StreakBadge.vue'
import DiaryDialog from './DiaryDialog.vue'
import { formatDate } from '../utils/date'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'checkin'])

const store = useHabitsStore()
const animating = ref(false)
const showConfetti = ref(false)
const showDiaryDialog = ref(false)

const todayStr = computed(() => formatDate(new Date()))
const isChecked = computed(() => store.isCheckedToday(props.habit.id))
const streak = computed(() => store.getHabitStreak(props.habit.id))
const completionRate = computed(() => store.getHabitCompletionRate(props.habit.id, 7))
const hasTodayDiary = computed(() => store.hasDiary(props.habit.id, todayStr.value))

function handleCheck() {
  if (animating.value) return
  
  const wasChecked = isChecked.value
  store.toggleCheckin(props.habit.id)
  emit('checkin', { habitId: props.habit.id, checked: !wasChecked })
  
  if (!wasChecked) {
    animating.value = true
    showConfetti.value = true
    
    setTimeout(() => {
      showConfetti.value = false
      animating.value = false
      if (!hasTodayDiary.value) {
        showDiaryDialog.value = true
      }
    }, 800)
  }
}

function handleDiarySuccess(result) {
  if (result.action === 'create') {
    ElMessage.success('日记已保存')
  } else if (result.action === 'edit') {
    ElMessage.success('日记已更新')
  }
}

function handleDiarySkip() {
}
</script>

<style scoped>
.habit-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.habit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: var(--habit-color);
}

.card-content {
  padding: 20px 20px 20px 26px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diary-indicator {
  font-size: 18px;
  cursor: help;
}

.habit-icon {
  font-size: 36px;
}

.habit-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.completion-rate {
  font-size: 13px;
  color: #999;
}

.check-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #ddd;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.check-button:hover {
  border-color: var(--habit-color);
}

.check-button.checked {
  border-color: var(--habit-color);
  background: var(--habit-color);
  animation: checkPulse 0.4s ease-out;
}

.check-icon {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.check-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ddd;
}

@keyframes checkPulse {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Confetti animation */
.confetti-container {
  position: absolute;
  top: 50%;
  right: 30px;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 2px;
  animation: confetti 0.8s ease-out forwards;
  animation-delay: calc(var(--i) * 0.05s);
}

.confetti-piece:nth-child(1) { background: #FF6B6B; }
.confetti-piece:nth-child(2) { background: #4ECDC4; }
.confetti-piece:nth-child(3) { background: #45B7D1; }
.confetti-piece:nth-child(4) { background: #96CEB4; }
.confetti-piece:nth-child(5) { background: #FFEAA7; }
.confetti-piece:nth-child(6) { background: #DDA0DD; }
.confetti-piece:nth-child(7) { background: #98D8C8; }
.confetti-piece:nth-child(8) { background: #F7DC6F; }

@keyframes confetti {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(cos(calc(var(--i) * 45deg)) * 60px),
      calc(sin(calc(var(--i) * 45deg)) * 60px)
    ) rotate(720deg) scale(0);
    opacity: 0;
  }
}
</style>
