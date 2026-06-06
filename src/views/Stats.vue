<template>
  <div class="stats-view">
    <h1 class="page-title">数据统计</h1>

    <!-- Summary Cards -->
    <section class="summary-cards">
      <StatsCard
        label="总习惯数"
        :value="store.totalCount"
        :icon="List"
        color="#6366f1"
      />
      <StatsCard
        label="总打卡次数"
        :value="store.totalCheckinsOverall"
        :icon="Checked"
        color="#52c41a"
      />
      <StatsCard
        label="整体完成率"
        :value="store.overallCompletionRate + '%'"
        :icon="TrendCharts"
        color="#faad14"
      />
      <StatsCard
        label="最长连续天数"
        :value="store.longestStreakOverall"
        :icon="Trophy"
        color="#ff6b6b"
      />
    </section>

    <!-- Weekly Chart -->
    <section class="chart-section">
      <WeeklyChart :habits="store.habits" />
    </section>

    <!-- Habit Ranking -->
    <section class="ranking-section">
      <h2>习惯排行</h2>
      <div class="ranking-list">
        <div
          v-for="(habit, index) in rankedHabits"
          :key="habit.id"
          class="ranking-item"
          :class="{
            'top-habit': index === 0,
            'needs-attention': index === rankedHabits.length - 1 && rankedHabits.length > 1
          }"
        >
          <div class="ranking-position">
            <span v-if="index === 0" class="trophy">🏆</span>
            <span v-else class="position-number">{{ index + 1 }}</span>
          </div>
          <div class="ranking-icon">{{ habit.icon }}</div>
          <div class="ranking-info">
            <span class="ranking-name">{{ habit.name }}</span>
            <div class="ranking-bar-container">
              <div
                class="ranking-bar"
                :style="{
                  width: habit.rate + '%',
                  background: habit.color
                }"
              ></div>
            </div>
          </div>
          <span class="ranking-rate">{{ habit.rate }}%</span>
        </div>
      </div>
    </section>

    <!-- Category Comparison -->
    <section class="category-section" v-if="store.categoryStats.length > 0">
      <h2>分类对比</h2>
      <div class="category-stats-grid">
        <div
          v-for="cat in rankedCategories"
          :key="cat.id"
          class="category-stat-card"
          :style="{ '--cat-color': cat.color }"
        >
          <div class="cat-header">
            <span class="cat-icon">{{ cat.icon }}</span>
            <span class="cat-name">{{ cat.name }}</span>
          </div>
          <div class="cat-stats">
            <div class="cat-stat-item">
              <span class="cat-stat-value">{{ cat.avgRate }}%</span>
              <span class="cat-stat-label">平均完成率</span>
            </div>
            <div class="cat-stat-item">
              <span class="cat-stat-value">{{ cat.total }}</span>
              <span class="cat-stat-label">习惯数</span>
            </div>
            <div class="cat-stat-item">
              <span class="cat-stat-value">{{ cat.totalCheckins }}</span>
              <span class="cat-stat-label">总打卡</span>
            </div>
          </div>
          <div class="cat-progress-bar-container">
            <div
              class="cat-progress-bar"
              :style="{ width: cat.avgRate + '%', background: cat.color }"
            ></div>
          </div>
          <div class="cat-habits-list">
            <div
              v-for="habit in cat.habits.slice(0, 3)"
              :key="habit.id"
              class="cat-habit-item"
            >
              <span class="cat-habit-icon">{{ habit.icon }}</span>
              <span class="cat-habit-name">{{ habit.name }}</span>
              <span class="cat-habit-rate">{{ store.getHabitCompletionRate(habit.id, 30) }}%</span>
            </div>
            <div v-if="cat.habits.length > 3" class="cat-habit-more">
              还有 {{ cat.habits.length - 3 }} 个习惯...
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Category Weekly Comparison Chart -->
    <section class="category-chart-section" v-if="store.categoryStats.length >= 2">
      <h2>分类周对比</h2>
      <div class="category-weekly-chart">
        <div class="chart-week-bars">
          <div
            v-for="(day, dayIndex) in weekDays"
            :key="dayIndex"
            class="chart-day-column"
          >
            <div class="day-bar-container">
              <div
                v-for="(catStat, catIndex) in categoryWeekData"
                :key="catStat.id"
                class="day-bar-segment"
                :style="{
                  height: catStat.days[dayIndex].rate + '%',
                  background: catStat.color,
                  bottom: getSegmentBottom(catIndex, dayIndex) + '%'
                }"
                :title="`${catStat.name}: ${catStat.days[dayIndex].completed}/${catStat.days[dayIndex].total}`"
              ></div>
            </div>
            <span class="chart-day-label">{{ day }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <span
            v-for="catStat in categoryWeekData"
            :key="catStat.id"
            class="legend-item"
          >
            <span class="legend-dot" :style="{ background: catStat.color }"></span>
            {{ catStat.icon }} {{ catStat.name }}
          </span>
        </div>
      </div>
    </section>

    <!-- Highlights -->
    <section class="highlights-section" v-if="store.habits.length >= 2">
      <div class="highlight-card best">
        <span class="highlight-badge">最稳定</span>
        <span class="highlight-icon">{{ bestHabit?.icon }}</span>
        <span class="highlight-name">{{ bestHabit?.name }}</span>
        <span class="highlight-detail">完成率 {{ bestHabitRate }}%</span>
      </div>
      <div class="highlight-card attention">
        <span class="highlight-badge">需关注</span>
        <span class="highlight-icon">{{ worstHabit?.icon }}</span>
        <span class="highlight-name">{{ worstHabit?.name }}</span>
        <span class="highlight-detail">完成率 {{ worstHabitRate }}%</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { List, Checked, TrendCharts, Trophy } from '@element-plus/icons-vue'
import { useHabitsStore } from '../stores/habits'
import { getDaysAgo, getDayName, parseDate } from '../utils/date'
import StatsCard from '../components/StatsCard.vue'
import WeeklyChart from '../components/WeeklyChart.vue'

const store = useHabitsStore()

const rankedHabits = computed(() => {
  return store.habits
    .map(h => ({
      ...h,
      rate: store.getHabitCompletionRate(h.id, 30)
    }))
    .sort((a, b) => b.rate - a.rate)
})

const bestHabit = computed(() => rankedHabits.value[0])
const bestHabitRate = computed(() => bestHabit.value?.rate || 0)
const worstHabit = computed(() => rankedHabits.value[rankedHabits.value.length - 1])
const worstHabitRate = computed(() => worstHabit.value?.rate || 0)

const rankedCategories = computed(() => {
  return [...store.categoryStats].sort((a, b) => b.avgRate - a.avgRate)
})

const weekDays = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const dateStr = getDaysAgo(i)
    const date = parseDate(dateStr)
    days.push(getDayName(date.getDay()))
  }
  return days
})

const categoryWeekData = computed(() => {
  return store.categoryStats.map(cat => {
    const catStats = store.getCategoryStats(cat.id, 7)
    if (!catStats) return null
    
    const days = []
    for (let i = 6; i >= 0; i--) {
      const dateStr = getDaysAgo(i)
      days.push(catStats.dayData[dateStr] || { completed: 0, total: 0, rate: 0 })
    }
    
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      days
    }
  }).filter(Boolean)
})

function getSegmentBottom(catIndex, dayIndex) {
  let bottom = 0
  for (let i = 0; i < catIndex; i++) {
    const prevCat = categoryWeekData.value[i]
    if (prevCat) {
      bottom += prevCat.days[dayIndex].rate
    }
  }
  return Math.min(bottom, 100)
}

onMounted(() => {
  store.init()
})
</script>

<style scoped>
.stats-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.chart-section {
  margin-bottom: 24px;
}

.ranking-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ranking-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f9f9f9;
  transition: all 0.2s;
}

.ranking-item:hover {
  background: #f0f0f0;
}

.ranking-item.top-habit {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.ranking-item.needs-attention {
  background: #fefce8;
  border: 1px solid #fde68a;
}

.ranking-position {
  width: 32px;
  text-align: center;
}

.trophy {
  font-size: 20px;
}

.position-number {
  font-size: 14px;
  font-weight: 600;
  color: #999;
}

.ranking-icon {
  font-size: 24px;
}

.ranking-info {
  flex: 1;
  min-width: 0;
}

.ranking-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.ranking-bar-container {
  height: 6px;
  background: #e8e8e8;
  border-radius: 3px;
  overflow: hidden;
}

.ranking-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.ranking-rate {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  min-width: 48px;
  text-align: right;
}

.highlights-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.highlight-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.highlight-card.best {
  border: 2px solid #bbf7d0;
}

.highlight-card.attention {
  border: 2px solid #fde68a;
}

.highlight-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 20px;
}

.highlight-card.best .highlight-badge {
  background: #dcfce7;
  color: #16a34a;
}

.highlight-card.attention .highlight-badge {
  background: #fef9c3;
  color: #ca8a04;
}

.highlight-icon {
  font-size: 36px;
}

.highlight-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.highlight-detail {
  font-size: 13px;
  color: #666;
}

.category-section,
.category-chart-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-section h2,
.category-chart-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.category-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.category-stat-card {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
}

.category-stat-card:hover {
  border-color: var(--cat-color);
  transform: translateY(-2px);
}

.cat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.cat-icon {
  font-size: 24px;
}

.cat-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.cat-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.cat-stat-item {
  text-align: center;
}

.cat-stat-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: var(--cat-color);
}

.cat-stat-label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.cat-progress-bar-container {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.cat-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.cat-habits-list {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.cat-habit-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
}

.cat-habit-icon {
  font-size: 16px;
}

.cat-habit-name {
  flex: 1;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cat-habit-rate {
  font-weight: 600;
  color: #1a1a1a;
}

.cat-habit-more {
  font-size: 12px;
  color: #999;
  padding: 6px 0;
}

.category-weekly-chart {
  width: 100%;
}

.chart-week-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  padding: 0 20px;
  margin-bottom: 20px;
}

.chart-day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.day-bar-container {
  width: 40px;
  height: 160px;
  position: relative;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
}

.day-bar-segment {
  position: absolute;
  left: 0;
  right: 0;
  transition: height 0.3s ease, bottom 0.3s ease;
}

.day-bar-segment:first-child {
  border-radius: 6px 6px 0 0;
}

.chart-day-label {
  font-size: 12px;
  color: #999;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
</style>
