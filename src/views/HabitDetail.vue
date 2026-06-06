<template>
  <div class="habit-detail-view" v-if="habit">
    <!-- Header -->
    <div class="detail-header" :style="{ '--habit-color': habit.color }">
      <router-link to="/" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </router-link>
      <div class="habit-header">
        <span class="habit-icon-large">{{ habit.icon }}</span>
        <div class="habit-info">
          <h1>{{ habit.name }}</h1>
          <el-tag :color="habit.color" effect="dark" size="small" round>
            {{ habit.frequency === 'daily' ? '每日' : `每周${habit.weeklyTarget}天` }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-box">
        <span class="stat-number">{{ streak }}</span>
        <span class="stat-label">🔥 当前连续</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ longestStreak }}</span>
        <span class="stat-label">🏆 最长连续</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ totalCheckins }}</span>
        <span class="stat-label">✅ 总打卡</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ completionRate }}%</span>
        <span class="stat-label">📊 完成率</span>
      </div>
    </div>

    <!-- Heatmap Section -->
    <section class="section-card">
      <h3>打卡日历</h3>
      <HeatmapCalendar :checkins="habit.checkins" :color="habit.color" :days="90" />
    </section>

    <!-- Weekly Chart -->
    <section class="section-card">
      <WeeklyChart :habits="[habit]" />
    </section>

    <!-- Actions -->
    <section class="actions-section">
      <el-button @click="showEditForm = true" round>
        <el-icon><Edit /></el-icon>
        编辑习惯
      </el-button>
      <el-popconfirm
        title="确定要删除这个习惯吗？所有打卡记录将丢失。"
        confirm-button-text="删除"
        cancel-button-text="取消"
        @confirm="handleDelete"
      >
        <template #reference>
          <el-button type="danger" plain round>
            <el-icon><Delete /></el-icon>
            删除习惯
          </el-button>
        </template>
      </el-popconfirm>
    </section>

    <!-- Edit Dialog -->
    <HabitForm
      v-model:visible="showEditForm"
      :habit="habit"
      @submit="handleEdit"
    />
  </div>

  <!-- Not Found -->
  <div v-else class="not-found">
    <el-empty description="习惯不存在">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, Delete } from '@element-plus/icons-vue'
import { useHabitsStore } from '../stores/habits'
import HeatmapCalendar from '../components/HeatmapCalendar.vue'
import WeeklyChart from '../components/WeeklyChart.vue'
import HabitForm from '../components/HabitForm.vue'

const route = useRoute()
const router = useRouter()
const store = useHabitsStore()

const showEditForm = ref(false)

const habit = computed(() => store.getHabit(route.params.id))
const streak = computed(() => store.getHabitStreak(route.params.id))
const longestStreak = computed(() => store.getHabitLongestStreak(route.params.id))
const totalCheckins = computed(() => store.getHabitTotalCheckins(route.params.id))
const completionRate = computed(() => store.getHabitCompletionRate(route.params.id, 30))

function handleEdit(habitData) {
  store.updateHabit(route.params.id, habitData)
}

function handleDelete() {
  store.deleteHabit(route.params.id)
  router.push('/')
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.habit-detail-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.back-link:hover {
  color: #333;
}

.habit-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.habit-icon-large {
  font-size: 56px;
}

.habit-info h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.section-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.actions-section {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-bottom: 40px;
}

.not-found {
  padding: 80px 24px;
  text-align: center;
}
</style>
