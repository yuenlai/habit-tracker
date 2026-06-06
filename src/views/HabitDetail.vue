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
      <div class="section-header">
        <h3>打卡日历</h3>
        <el-button size="small" type="warning" @click="showCatchUpDialog = true" round>
          <el-icon><Refresh /></el-icon>
          漏打补签
        </el-button>
      </div>
      <HeatmapCalendar 
        :checkins="habit.checkins" 
        :color="habit.color" 
        :days="90" 
        :habit-id="habit.id"
        :interactive="true"
        @catchup="handleCatchup"
      />
    </section>

    <!-- Weekly Chart -->
    <section class="section-card">
      <WeeklyChart :habits="[habit]" />
    </section>

    <!-- Diaries Section -->
    <section class="section-card">
      <div class="section-header">
        <h3>📝 打卡日记</h3>
        <div class="diary-stats">
          <el-tag size="small" type="success">共 {{ diaries.length }} 篇</el-tag>
        </div>
      </div>

      <div v-if="diaries.length === 0" class="diaries-empty">
        <el-empty description="还没有日记，每次打卡后可以记录下当日的感受哦" :image-size="100">
          <template #image>
            <div class="empty-icon">📖</div>
          </template>
        </el-empty>
      </div>

      <div v-else class="diaries-list">
        <div
          v-for="diary in diaries"
          :key="diary.date"
          class="diary-card"
          :class="{ 'is-expanded': expandedDate === diary.date }"
        >
          <div class="diary-card-header" @click="toggleExpand(diary.date)">
            <div class="diary-date-info">
              <div class="diary-date-main">{{ formatDiaryDate(diary.date) }}</div>
              <div class="diary-date-sub">{{ formatDiaryWeekday(diary.date) }}</div>
            </div>
            <div class="diary-actions">
              <el-button size="small" type="primary" plain @click.stop="handleEditDiary(diary.date)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="danger" plain @click.stop="handleDeleteDiary(diary.date)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
              <el-icon class="expand-icon" :class="{ 'is-expanded': expandedDate === diary.date }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>

          <div class="diary-card-content" v-show="expandedDate === diary.date">
            <div class="diary-item" v-if="diary.feeling">
              <div class="diary-item-label">
                <span class="diary-icon">😊</span>
                今日感受
              </div>
              <div class="diary-item-text">{{ diary.feeling }}</div>
            </div>

            <div class="diary-item" v-if="diary.difficulty">
              <div class="diary-item-label">
                <span class="diary-icon">💪</span>
                遇到的困难
              </div>
              <div class="diary-item-text">{{ diary.difficulty }}</div>
            </div>

            <div class="diary-item" v-if="diary.gain">
              <div class="diary-item-label">
                <span class="diary-icon">🌟</span>
                收获与感悟
              </div>
              <div class="diary-item-text">{{ diary.gain }}</div>
            </div>

            <div class="diary-time">
              <el-icon><Clock /></el-icon>
              记录于 {{ formatDiaryTime(diary.createdAt) }}
            </div>
          </div>

          <div class="diary-card-preview" v-show="expandedDate !== diary.date">
            <span v-if="diary.feeling" class="diary-preview-text">
              {{ diary.feeling.length > 60 ? diary.feeling.substring(0, 60) + '...' : diary.feeling }}
            </span>
            <span v-else class="diary-preview-empty">点击展开查看详情</span>
          </div>
        </div>
      </div>
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

    <!-- Catch-up Dialog -->
    <CatchUpDialog
      v-model:visible="showCatchUpDialog"
      :habit-id="habit.id"
      @success="handleCatchup"
    />

    <!-- Diary Dialog -->
    <DiaryDialog
      v-model:visible="showDiaryDialog"
      :habit-id="route.params.id"
      :date-str="currentDiaryDate"
      :is-edit="isEditingDiary"
      @success="handleDiarySuccess"
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
import { ArrowLeft, Edit, Delete, Refresh, ArrowDown, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHabitsStore } from '../stores/habits'
import { parseDate, getDayName } from '../utils/date'
import HeatmapCalendar from '../components/HeatmapCalendar.vue'
import WeeklyChart from '../components/WeeklyChart.vue'
import HabitForm from '../components/HabitForm.vue'
import CatchUpDialog from '../components/CatchUpDialog.vue'
import DiaryDialog from '../components/DiaryDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useHabitsStore()

const showEditForm = ref(false)
const showCatchUpDialog = ref(false)
const showDiaryDialog = ref(false)
const expandedDate = ref(null)
const currentDiaryDate = ref('')
const isEditingDiary = ref(false)

const habit = computed(() => store.getHabit(route.params.id))
const streak = computed(() => store.getHabitStreak(route.params.id))
const longestStreak = computed(() => store.getHabitLongestStreak(route.params.id))
const totalCheckins = computed(() => store.getHabitTotalCheckins(route.params.id))
const completionRate = computed(() => store.getHabitCompletionRate(route.params.id, 30))
const diaries = computed(() => store.getDiaries(route.params.id))

function handleEdit(habitData) {
  store.updateHabit(route.params.id, habitData)
}

function handleDelete() {
  store.deleteHabit(route.params.id)
  router.push('/')
}

function handleCatchup(result) {
  if (result.action === 'catchup') {
    ElMessage.success(`补签成功：${result.date}`)
  } else if (result.action === 'cancel') {
    ElMessage.info(`已取消补签：${result.date}`)
  }
}

function toggleExpand(date) {
  expandedDate.value = expandedDate.value === date ? null : date
}

function formatDiaryDate(dateStr) {
  const date = parseDate(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function formatDiaryWeekday(dateStr) {
  const date = parseDate(dateStr)
  return `星期${getDayName(date.getDay())}`
}

function formatDiaryTime(timestamp) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`
}

function handleEditDiary(dateStr) {
  currentDiaryDate.value = dateStr
  isEditingDiary.value = true
  showDiaryDialog.value = true
}

async function handleDeleteDiary(dateStr) {
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇日记吗？删除后无法恢复。',
      '删除日记',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const success = store.deleteDiary(route.params.id, dateStr)
    if (success) {
      ElMessage.success('日记已删除')
      if (expandedDate.value === dateStr) {
        expandedDate.value = null
      }
    }
  } catch {
  }
}

function handleDiarySuccess(result) {
  if (result.action === 'create') {
    ElMessage.success('日记已保存')
  } else if (result.action === 'edit') {
    ElMessage.success('日记已更新')
  }
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
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

.diary-stats {
  display: flex;
  align-items: center;
}

.diaries-empty {
  padding: 40px 0;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.diaries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.diary-card {
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
  transition: all 0.3s ease;
}

.diary-card:hover {
  background: #fff;
  border-color: #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.diary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
}

.diary-date-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.diary-date-main {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.diary-date-sub {
  font-size: 12px;
  color: #999;
}

.diary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  font-size: 18px;
  color: #999;
  transition: transform 0.3s ease;
  margin-left: 4px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.diary-card-content {
  padding: 0 20px 20px 20px;
  border-top: 1px solid #eee;
}

.diary-item {
  margin-top: 16px;
}

.diary-item-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.diary-icon {
  font-size: 16px;
}

.diary-item-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  padding-left: 22px;
}

.diary-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
}

.diary-card-preview {
  padding: 0 20px 16px 20px;
}

.diary-preview-text {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.diary-preview-empty {
  font-size: 13px;
  color: #aaa;
  font-style: italic;
}
</style>
