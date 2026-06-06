<template>
  <div class="weekly-chart">
    <div class="chart-header">
      <h4>本周完成情况</h4>
    </div>
    <div class="chart-body">
      <div class="chart-bars">
        <div
          v-for="(day, index) in weekData"
          :key="index"
          class="day-column"
        >
          <div class="bar-container">
            <div
              v-for="habit in day.habits"
              :key="habit.id"
              class="bar-segment"
              :style="{
                height: habit.checked ? segmentHeight + 'px' : '0px',
                background: habit.checked ? habit.color : 'transparent'
              }"
            ></div>
            <div class="bar-background"></div>
          </div>
          <span class="day-count">{{ day.completedCount }}/{{ day.totalCount }}</span>
          <span class="day-label">{{ day.dayName }}</span>
        </div>
      </div>
    </div>
    <div class="chart-legend">
      <span
        v-for="habit in habits"
        :key="habit.id"
        class="legend-item"
      >
        <span class="legend-dot" :style="{ background: habit.color }"></span>
        {{ habit.icon }} {{ habit.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getDaysAgo, getDayName, parseDate } from '../utils/date'

const props = defineProps({
  habits: {
    type: Array,
    default: () => []
  }
})

const segmentHeight = 12

const weekData = computed(() => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const dateStr = getDaysAgo(i)
    const date = parseDate(dateStr)
    const dayName = getDayName(date.getDay())
    
    const habitsData = props.habits.map(habit => ({
      id: habit.id,
      color: habit.color,
      checked: habit.checkins[dateStr] === true
    }))
    
    const completedCount = habitsData.filter(h => h.checked).length
    
    data.push({
      date: dateStr,
      dayName,
      habits: habitsData,
      completedCount,
      totalCount: props.habits.length
    })
  }
  return data
})
</script>

<style scoped>
.weekly-chart {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}

.chart-header h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.chart-body {
  padding: 10px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 140px;
  padding: 0 10px;
}

.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-container {
  width: 28px;
  height: 100px;
  display: flex;
  flex-direction: column-reverse;
  gap: 2px;
  position: relative;
}

.bar-background {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  background: #f5f5f5;
  border-radius: 4px;
  z-index: 0;
}

.bar-segment {
  width: 100%;
  border-radius: 3px;
  transition: height 0.3s ease;
  position: relative;
  z-index: 1;
}

.day-count {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.day-label {
  font-size: 12px;
  color: #999;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}
</style>
