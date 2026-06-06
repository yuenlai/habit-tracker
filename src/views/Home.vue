<template>
  <div class="home-view">
    <!-- Greeting Section -->
    <section class="greeting-section">
      <div class="greeting-text">
        <h1>{{ greeting }}，加油！</h1>
        <p class="date-text">{{ todayDisplay }}</p>
      </div>
      <el-button type="primary" @click="showAddForm = true" round>
        <el-icon><Plus /></el-icon>
        添加习惯
      </el-button>
    </section>

    <!-- Progress Section -->
    <section class="progress-section">
      <div class="progress-card">
        <div class="progress-ring-container">
          <el-progress
            type="circle"
            :percentage="store.todayCompletionRate"
            :width="100"
            :stroke-width="10"
            :color="progressColor"
          >
            <template #default>
              <span class="progress-text">
                {{ store.todayCompletedCount }}/{{ store.totalCount }}
              </span>
            </template>
          </el-progress>
        </div>
        <div class="progress-info">
          <h3>今日进度</h3>
          <p>已完成 {{ store.todayCompletedCount }} 个习惯</p>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="quick-stats">
      <div class="stat-item">
        <span class="stat-value">{{ store.totalCount }}</span>
        <span class="stat-label">总习惯数</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ store.todayCompletionRate }}%</span>
        <span class="stat-label">今日完成率</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ store.longestStreakOverall }}</span>
        <span class="stat-label">最长连续</span>
      </div>
    </section>

    <!-- Habits Grid -->
    <section class="habits-section">
      <h2 class="section-title">我的习惯</h2>
      <div v-if="store.habits.length === 0" class="empty-state">
        <el-empty description="还没有习惯，点击添加开始打卡吧！" />
      </div>
      <div v-else class="habits-grid">
        <div
          v-for="habit in store.habits"
          :key="habit.id"
          class="habit-link"
          @click="goToDetail(habit.id)"
        >
          <HabitCard :habit="habit" @checkin="handleCheckin" />
        </div>
      </div>
    </section>

    <!-- Add Habit Dialog -->
    <HabitForm
      v-model:visible="showAddForm"
      @submit="handleAddHabit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { useHabitsStore } from '../stores/habits'
import { formatDisplayDate } from '../utils/date'
import HabitCard from '../components/HabitCard.vue'
import HabitForm from '../components/HabitForm.vue'

const router = useRouter()
const store = useHabitsStore()

const showAddForm = ref(false)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const todayDisplay = computed(() => formatDisplayDate(new Date()))

const progressColor = computed(() => {
  const rate = store.todayCompletionRate
  if (rate === 100) return '#52c41a'
  if (rate >= 60) return '#1890ff'
  return '#faad14'
})

function handleAddHabit(habitData) {
  store.addHabit(habitData)
}

function goToDetail(id) {
  router.push(`/habit/${id}`)
}

function handleCheckin() {
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.home-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.greeting-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.greeting-text h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.date-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.progress-ring-container {
  flex-shrink: 0;
}

.progress-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.progress-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.progress-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.quick-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.habits-section {
  margin-top: 8px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.habit-link {
  text-decoration: none;
  display: block;
}

.empty-state {
  padding: 60px 0;
}
</style>
