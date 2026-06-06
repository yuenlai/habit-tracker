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
</style>
