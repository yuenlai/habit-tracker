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

    <!-- Category Filter -->
    <section class="category-filter" v-if="store.habits.length > 0">
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          全部
          <span class="count">{{ store.totalCount }}</span>
        </button>
        <button
          v-for="cat in categoryTabs"
          :key="cat.id"
          class="filter-tab"
          :class="{ active: activeCategory === cat.id }"
          :style="{ '--cat-color': cat.color }"
          @click="activeCategory = cat.id"
        >
          {{ cat.icon }} {{ cat.name }}
          <span class="count">{{ cat.total }}</span>
        </button>
      </div>
    </section>

    <!-- Habits Grid -->
    <section class="habits-section">
      <h2 class="section-title">{{ activeCategory === 'all' ? '我的习惯' : categoryDisplayName }}</h2>
      <div v-if="filteredHabits.length === 0" class="empty-state">
        <el-empty :description="emptyDescription" />
      </div>
      <template v-else>
        <template v-if="activeCategory === 'all'">
          <div v-for="cat in groupedHabits" :key="cat.id" class="category-group">
            <div class="category-header" :style="{ borderColor: cat.color }">
              <span class="category-title">
                <span class="cat-icon">{{ cat.icon }}</span>
                {{ cat.name }}
              </span>
              <span class="category-progress">
                {{ cat.completedToday }}/{{ cat.total }} 已完成
              </span>
            </div>
            <div class="habits-grid">
              <div
                v-for="habit in cat.habits"
                :key="habit.id"
                class="habit-link"
                @click="goToDetail(habit.id)"
              >
                <HabitCard :habit="habit" @checkin="handleCheckin" />
              </div>
            </div>
          </div>
        </template>
        <div v-else class="habits-grid">
          <div
            v-for="habit in filteredHabits"
            :key="habit.id"
            class="habit-link"
            @click="goToDetail(habit.id)"
          >
            <HabitCard :habit="habit" @checkin="handleCheckin" />
          </div>
        </div>
      </template>
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
import { useHabitsStore, HABIT_CATEGORIES } from '../stores/habits'
import { formatDisplayDate } from '../utils/date'
import HabitCard from '../components/HabitCard.vue'
import HabitForm from '../components/HabitForm.vue'

const router = useRouter()
const store = useHabitsStore()

const showAddForm = ref(false)
const activeCategory = ref('all')

const categoryTabs = computed(() => {
  return store.categoryStats
})

const filteredHabits = computed(() => {
  return store.getHabitsByCategory(activeCategory.value)
})

const groupedHabits = computed(() => {
  return store.categoryStats
})

const categoryDisplayName = computed(() => {
  const cat = HABIT_CATEGORIES[activeCategory.value]
  return cat ? `${cat.icon} ${cat.name}` : '我的习惯'
})

const emptyDescription = computed(() => {
  if (store.habits.length === 0) return '还没有习惯，点击添加开始打卡吧！'
  if (activeCategory.value === 'all') return '还没有习惯，点击添加开始打卡吧！'
  const cat = HABIT_CATEGORIES[activeCategory.value]
  return `${cat?.name || '该'}分类下还没有习惯`
})

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

.category-filter {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 20px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab:hover {
  border-color: #ccc;
}

.filter-tab.active {
  background: var(--cat-color, #6366f1);
  border-color: var(--cat-color, #6366f1);
  color: #fff;
}

.filter-tab .count {
  background: rgba(0, 0, 0, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.filter-tab.active .count {
  background: rgba(255, 255, 255, 0.2);
}

.category-group {
  margin-bottom: 28px;
}

.category-group:last-child {
  margin-bottom: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-left: 12px;
  border-left: 4px solid;
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cat-icon {
  font-size: 18px;
}

.category-progress {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}
</style>
