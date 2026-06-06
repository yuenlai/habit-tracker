<template>
  <div class="heatmap-container">
    <svg :width="svgWidth" :height="svgHeight" class="heatmap-svg">
      <!-- Month labels -->
      <g class="month-labels">
        <text
          v-for="(label, index) in monthLabels"
          :key="'month-' + index"
          :x="label.x"
          y="10"
          class="month-text"
        >
          {{ label.text }}
        </text>
      </g>

      <!-- Day labels (Mon, Wed, Fri) -->
      <g class="day-labels">
        <text x="0" :y="dayLabelY(1)" class="day-text">一</text>
        <text x="0" :y="dayLabelY(3)" class="day-text">三</text>
        <text x="0" :y="dayLabelY(5)" class="day-text">五</text>
      </g>

      <!-- Heatmap cells -->
      <g class="heatmap-cells" :transform="`translate(28, 18)`">
        <g v-for="(week, weekIndex) in weeks" :key="'week-' + weekIndex">
          <rect
            v-for="(day, dayIndex) in week"
            :key="'day-' + weekIndex + '-' + dayIndex"
            :x="weekIndex * (cellSize + cellGap)"
            :y="dayIndex * (cellSize + cellGap)"
            :width="cellSize"
            :height="cellSize"
            :fill="getCellColor(day)"
            :rx="2"
            :ry="2"
            class="heatmap-cell"
            :class="{ 
              'clickable': day && interactive && canInteract(day),
              'catch-up': day && day.isCatchUp
            }"
            @mouseenter="showTooltip($event, day)"
            @mouseleave="hideTooltip"
            @click="handleCellClick(day)"
          />
          <!-- Catch-up indicator -->
          <circle
            v-for="(day, dayIndex) in week"
            :key="'catchup-' + weekIndex + '-' + dayIndex"
            v-if="day && day.isCatchUp"
            :cx="weekIndex * (cellSize + cellGap) + cellSize - 2"
            :cy="dayIndex * (cellSize + cellGap) + 2"
            :r="3"
            fill="#f59e0b"
            stroke="#fff"
            stroke-width="1"
          />
        </g>
      </g>
    </svg>

    <!-- Legend -->
    <div v-if="interactive" class="heatmap-legend">
      <div class="legend-item">
        <span class="legend-dot normal"></span>
        <span class="legend-text">正常打卡</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot catch-up"></span>
        <span class="legend-text">补签</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot available"></span>
        <span class="legend-text">可补签</span>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="heatmap-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <span class="tooltip-date">{{ tooltip.date }}</span>
      <span class="tooltip-status" :class="{ checked: tooltip.checked, 'catch-up': tooltip.isCatchUp }">
        {{ tooltip.isCatchUp ? '已补签' : (tooltip.checked ? '已完成' : (tooltip.canCatchUp ? '可补签' : '未完成')) }}
      </span>
      <span v-if="tooltip.canCatchUp && !tooltip.checked" class="tooltip-hint">点击补签</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDaysAgo, parseDate, getMonthName, formatDate, isWithinCatchUpWindow } from '../utils/date'
import { useHabitsStore } from '../stores/habits'

const props = defineProps({
  checkins: {
    type: Object,
    default: () => ({})
  },
  color: {
    type: String,
    default: '#4ECDC4'
  },
  days: {
    type: Number,
    default: 90
  },
  habitId: {
    type: String,
    default: null
  },
  interactive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['cell-click', 'catchup'])

const store = useHabitsStore()
const cellSize = 12
const cellGap = 2
const tooltip = ref({ visible: false, x: 0, y: 0, date: '', checked: false, isCatchUp: false, canCatchUp: false })

// Generate date data for the heatmap
const dateData = computed(() => {
  const data = []
  for (let i = props.days - 1; i >= 0; i--) {
    const dateStr = getDaysAgo(i)
    const date = parseDate(dateStr)
    const isCatchUp = props.habitId ? store.isCatchUp(props.habitId, dateStr) : false
    const canCatchUp = props.habitId ? store.canCatchUp(props.habitId, dateStr) : false
    data.push({
      date: dateStr,
      dateObj: date,
      dayOfWeek: date.getDay(),
      month: date.getMonth(),
      checked: props.checkins[dateStr] === true,
      isCatchUp,
      canCatchUp
    })
  }
  return data
})

// Organize data into weeks (columns)
const weeks = computed(() => {
  const result = []
  let currentWeek = []
  
  // Fill initial empty slots to align with correct day of week
  if (dateData.value.length > 0) {
    const firstDay = dateData.value[0].dayOfWeek
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
  }
  
  dateData.value.forEach(day => {
    currentWeek.push(day)
    if (day.dayOfWeek === 6) {
      result.push(currentWeek)
      currentWeek = []
    }
  })
  
  // Add remaining days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null)
    }
    result.push(currentWeek)
  }
  
  return result
})

// Calculate SVG dimensions
const svgWidth = computed(() => {
  return weeks.value.length * (cellSize + cellGap) + 28 + 10
})

const svgHeight = 110

// Generate month labels
const monthLabels = computed(() => {
  const labels = []
  let lastMonth = -1
  
  weeks.value.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d !== null)
    if (firstValidDay && firstValidDay.month !== lastMonth) {
      labels.push({
        x: weekIndex * (cellSize + cellGap) + 28,
        text: getMonthName(firstValidDay.month)
      })
      lastMonth = firstValidDay.month
    }
  })
  
  return labels
})

// Y position for day labels
function dayLabelY(dayIndex) {
  return 18 + dayIndex * (cellSize + cellGap) + cellSize - 2
}

// Get cell color based on check-in status
function getCellColor(day) {
  if (!day) return 'transparent'
  if (!day.checked) {
    if (props.interactive && day.canCatchUp) {
      return '#fef3c7'
    }
    return '#ebedf0'
  }
  if (day.isCatchUp) {
    return '#fbbf24'
  }
  return props.color
}

// Check if cell can be interacted with
function canInteract(day) {
  return day && day.canCatchUp
}

// Handle cell click
function handleCellClick(day) {
  if (!day) return
  
  emit('cell-click', day)
  
  if (props.interactive && props.habitId && day.canCatchUp) {
    const success = store.catchUpCheckin(props.habitId, day.date)
    if (success) {
      emit('catchup', { date: day.date, action: 'catchup' })
    }
  } else if (props.interactive && props.habitId && day.isCatchUp && day.checked) {
    store.cancelCatchUp(props.habitId, day.date)
    emit('catchup', { date: day.date, action: 'cancel' })
  }
}

// Tooltip handlers
function showTooltip(event, day) {
  if (!day) return
  const rect = event.target.getBoundingClientRect()
  const containerRect = event.target.closest('.heatmap-container').getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left - containerRect.left + cellSize / 2,
    y: rect.top - containerRect.top - 50,
    date: day.date,
    checked: day.checked,
    isCatchUp: day.isCatchUp,
    canCatchUp: day.canCatchUp
  }
}

function hideTooltip() {
  tooltip.value.visible = false
}
</script>

<style scoped>
.heatmap-container {
  position: relative;
  overflow-x: auto;
  padding: 10px 0;
}

.heatmap-svg {
  display: block;
}

.month-text {
  font-size: 10px;
  fill: #767676;
}

.day-text {
  font-size: 9px;
  fill: #767676;
}

.heatmap-cell {
  cursor: default;
  transition: all 0.15s ease;
  stroke: rgba(27, 31, 35, 0.06);
  stroke-width: 0;
}

.heatmap-cell.clickable {
  cursor: pointer;
}

.heatmap-cell:hover {
  stroke: rgba(27, 31, 35, 0.3);
  stroke-width: 1;
}

.heatmap-cell.clickable:hover {
  stroke: #f59e0b;
  stroke-width: 2;
}

.heatmap-legend {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 12px;
  padding-right: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-dot.normal {
  background: #4ECDC4;
}

.legend-dot.catch-up {
  background: #fbbf24;
}

.legend-dot.available {
  background: #fef3c7;
  border: 1px solid #fcd34d;
}

.heatmap-tooltip {
  position: absolute;
  background: #24292e;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.heatmap-tooltip::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #24292e;
}

.tooltip-date {
  color: #959da5;
  font-size: 10px;
}

.tooltip-status {
  font-weight: 600;
}

.tooltip-status.checked {
  color: #2ea043;
}

.tooltip-status.catch-up {
  color: #fbbf24;
}

.tooltip-hint {
  color: #fbbf24;
  font-size: 10px;
  margin-top: 2px;
}
</style>
