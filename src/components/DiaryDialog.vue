<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="560px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="diary-dialog">
      <div class="diary-header" v-if="habit">
        <span class="habit-icon">{{ habit.icon }}</span>
        <div class="habit-meta">
          <h4>{{ habit.name }}</h4>
          <span class="diary-date">{{ displayDate }}</span>
        </div>
      </div>

      <div class="diary-form">
        <div class="form-item">
          <label class="form-label">
            <span class="label-icon">😊</span>
            今日感受
          </label>
          <el-input
            v-model="formData.feeling"
            type="textarea"
            :rows="3"
            placeholder="记录一下完成习惯时的心情和状态..."
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="form-item">
          <label class="form-label">
            <span class="label-icon">💪</span>
            遇到的困难
          </label>
          <el-input
            v-model="formData.difficulty"
            type="textarea"
            :rows="2"
            placeholder="今天在坚持过程中遇到了什么挑战？"
            maxlength="200"
            show-word-limit
          />
        </div>

        <div class="form-item">
          <label class="form-label">
            <span class="label-icon">🌟</span>
            收获与感悟
          </label>
          <el-input
            v-model="formData.gain"
            type="textarea"
            :rows="2"
            placeholder="今天有什么收获或感悟想记录下来？"
            maxlength="200"
            show-word-limit
          />
        </div>
      </div>

      <div class="diary-tip">
        <el-icon><InfoFilled /></el-icon>
        记录打卡日记可以帮你回顾成长轨迹，坚持下来会有惊喜哦！
      </div>
    </div>

    <template #footer>
      <el-button @click="handleSkip">跳过</el-button>
      <el-button type="primary" @click="handleSave" :disabled="!hasContent">保存日记</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { useHabitsStore } from '../stores/habits'
import { parseDate, getDayName, formatDate } from '../utils/date'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  habitId: {
    type: String,
    required: true
  },
  dateStr: {
    type: String,
    default: () => formatDate(new Date())
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success', 'skip'])

const store = useHabitsStore()

const formData = ref({
  feeling: '',
  difficulty: '',
  gain: ''
})

const habit = computed(() => store.getHabit(props.habitId))

const title = computed(() => {
  if (props.isEdit) return '编辑打卡日记'
  return '写点什么？'
})

const displayDate = computed(() => {
  const date = parseDate(props.dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = getDayName(date.getDay())
  return `${month}月${day}日 星期${dayName}`
})

const hasContent = computed(() => {
  return formData.value.feeling.trim() || 
         formData.value.difficulty.trim() || 
         formData.value.gain.trim()
})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

function resetForm() {
  formData.value = {
    feeling: '',
    difficulty: '',
    gain: ''
  }
}

function loadExistingDiary() {
  const diary = store.getDiary(props.habitId, props.dateStr)
  if (diary) {
    formData.value = {
      feeling: diary.feeling || '',
      difficulty: diary.difficulty || '',
      gain: diary.gain || ''
    }
  }
}

function handleSave() {
  const success = store.saveDiary(props.habitId, props.dateStr, formData.value)
  if (success) {
    emit('success', { 
      date: props.dateStr, 
      action: props.isEdit ? 'edit' : 'create',
      diary: { ...formData.value }
    })
    visible.value = false
  }
}

function handleSkip() {
  emit('skip', { date: props.dateStr })
  visible.value = false
}

function handleClose() {
  resetForm()
  visible.value = false
}

watch(() => props.visible, (val) => {
  if (val) {
    if (props.isEdit) {
      loadExistingDiary()
    } else {
      resetForm()
      loadExistingDiary()
    }
  }
})
</script>

<style scoped>
.diary-dialog {
  padding: 8px 0;
}

.diary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.habit-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.habit-meta h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.diary-date {
  font-size: 13px;
  color: #666;
}

.diary-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.label-icon {
  font-size: 16px;
}

.diary-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fff7e6;
  border-radius: 8px;
  color: #d48806;
  font-size: 13px;
  margin-top: 20px;
}

.diary-tip .el-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}
</style>
