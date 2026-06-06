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
            @mouseenter="showTooltip($event, day)"
            @mouseleave="hideTooltip"
          />
        </g>
      </g>
    </svg>

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible"
      class="heatmap-tooltip"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <span class="tooltip-date">{{ tooltip.date }}</span>
      <span class="tooltip-status" :class="{ checked: tooltip.checked }">
        {{ tooltip.checked ? '已完成' : '未完成' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDaysAgo, parseDate, getMonthName, formatDate } from '../utils/date'

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
  }
})

const cellSize = 12
const cellGap = 2
const tooltip = ref({ visible: false, x: 0, y: 0, date: '', checked: false })

// Generate date data for the heatmap
const dateData = computed(() => {
  const data = []
  for (let i = props.days - 1; i >= 0; i--) {
    const dateStr = getDaysAgo(i)
    const date = parseDate(dateStr)
    data.push({
      date: dateStr,
      dateObj: date,
      dayOfWeek: date.getDay(),
      month: date.getMonth(),
      checked: props.checkins[dateStr] === true
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
  if (!day.checked) return '#ebedf0'
  return props.color
}

// Tooltip handlers
function showTooltip(event, day) {
  if (!day) return
  const rect = event.target.getBoundingClientRect()
  const containerRect = event.target.closest('.heatmap-container').getBoundingClientRect()
  tooltip.value = {
    visible: true,
    x: rect.left - containerRect.left + cellSize / 2,
    y: rect.top - containerRect.top - 40,
    date: day.date,
    checked: day.checked
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
  cursor: pointer;
  transition: stroke 0.15s ease;
  stroke: rgba(27, 31, 35, 0.06);
  stroke-width: 0;
}

.heatmap-cell:hover {
  stroke: rgba(27, 31, 35, 0.3);
  stroke-width: 1;
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
</style>
