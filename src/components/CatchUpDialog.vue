<template>
  <el-dialog
    v-model="visible"
    title="漏打补签"
    width="480px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="catch-up-dialog">
      <p class="catch-up-tip">
        <el-icon><InfoFilled /></el-icon>
        可对过去7天未完成的习惯进行补签，补签后将计入连续天数和完成率统计
      </p>
      
      <div class="catch-up-list">
        <div
          v-for="day in catchUpDays"
          :key="day.date"
          class="catch-up-item"
          :class="{ 
            'is-checked': day.checked, 
            'is-catch-up': day.isCatchUp,
            'can-catch-up': day.canCatchUp
          }"
        >
          <div class="catch-up-date">
            <span class="date-main">{{ day.displayDate }}</span>
            <span class="date-week">{{ day.displayWeek }}</span>
          </div>
          <div class="catch-up-status">
            <span v-if="day.checked && day.isCatchUp" class="status-tag catch-up-tag">
              <el-icon><Refresh /></el-icon>
              已补签
            </span>
            <span v-else-if="day.checked" class="status-tag checked-tag">
              <el-icon><CircleCheckFilled /></el-icon>
              已完成
            </span>
            <span v-else class="status-tag missed-tag">
              <el-icon><CircleCloseFilled /></el-icon>
              未完成
            </span>
          </div>
          <div class="catch-up-action">
            <el-button
              v-if="day.checked && day.isCatchUp"
              size="small"
              type="danger"
              plain
              @click="handleCancelCatchUp(day.date)"
            >
              取消补签
            </el-button>
            <el-button
              v-else-if="!day.checked"
              size="small"
              type="primary"
              :disabled="!day.canCatchUp"
              @click="handleCatchUp(day.date)"
            >
              补签
            </el-button>
            <span v-else class="cannot-edit">已打卡</span>
          </div>
        </div>
      </div>
      
      <div v-if="catchUpDays.length === 0" class="empty-state">
        <el-empty description="暂无可补签的日期" :image-size="80" />
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { InfoFilled, Refresh, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useHabitsStore } from '../stores/habits'
import { getCatchUpDays, parseDate, getDayName } from '../utils/date'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  habitId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'success'])

const store = useHabitsStore()
const animating = ref(false)

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const catchUpDays = computed(() => {
  const days = getCatchUpDays()
  return days.map(dateStr => {
    const date = parseDate(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = date.getDay()
    
    return {
      date: dateStr,
      displayDate: `${month}月${day}日`,
      displayWeek: `星期${getDayName(dayOfWeek)}`,
      checked: store.getHabit(props.habitId)?.checkins[dateStr] === true,
      isCatchUp: store.isCatchUp(props.habitId, dateStr),
      canCatchUp: store.canCatchUp(props.habitId, dateStr)
    }
  })
})

function handleCatchUp(dateStr) {
  if (animating.value) return
  
  const success = store.catchUpCheckin(props.habitId, dateStr)
  if (success) {
    animating.value = true
    setTimeout(() => {
      animating.value = false
    }, 300)
    emit('success', { date: dateStr, action: 'catchup' })
  }
}

function handleCancelCatchUp(dateStr) {
  store.cancelCatchUp(props.habitId, dateStr)
  emit('success', { date: dateStr, action: 'cancel' })
}

function handleClose() {
  visible.value = false
}

watch(() => props.visible, (val) => {
  if (val) {
    animating.value = false
  }
})
</script>

<style scoped>
.catch-up-dialog {
  padding: 8px 0;
}

.catch-up-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #e6f7ff;
  border-radius: 8px;
  color: #1890ff;
  font-size: 13px;
  margin-bottom: 20px;
}

.catch-up-tip .el-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.catch-up-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.catch-up-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.catch-up-item.is-checked {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.catch-up-item.is-catch-up {
  background: #fefce8;
  border-color: #fde68a;
}

.catch-up-item.can-catch-up:hover {
  background: #fff;
  border-color: #e5e7eb;
}

.catch-up-date {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-main {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.date-week {
  font-size: 12px;
  color: #999;
}

.catch-up-status {
  flex: 1;
  text-align: center;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.status-tag .el-icon {
  font-size: 14px;
}

.checked-tag {
  background: #dcfce7;
  color: #16a34a;
}

.catch-up-tag {
  background: #fef9c3;
  color: #ca8a04;
}

.missed-tag {
  background: #fee2e2;
  color: #dc2626;
}

.cannot-edit {
  font-size: 13px;
  color: #999;
  padding: 0 12px;
}

.empty-state {
  padding: 40px 0;
}
</style>
