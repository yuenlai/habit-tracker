<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑习惯' : '添加习惯'"
    width="480px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-position="top"
    >
      <el-form-item label="习惯名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="例如：每天跑步30分钟"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="选择图标">
        <HabitIcon v-model="formData.icon" />
      </el-form-item>

      <el-form-item label="主题颜色">
        <div class="color-palette">
          <button
            v-for="color in colors"
            :key="color"
            class="color-option"
            :class="{ selected: formData.color === color }"
            :style="{ background: color }"
            @click="formData.color = color"
            type="button"
          ></button>
        </div>
      </el-form-item>

      <el-form-item label="频率" prop="frequency">
        <el-radio-group v-model="formData.frequency">
          <el-radio value="daily">每天</el-radio>
          <el-radio value="weekly">每周</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.frequency === 'weekly'" label="每周目标天数">
        <el-slider
          v-model="formData.weeklyTarget"
          :min="1"
          :max="7"
          :step="1"
          show-stops
          :marks="{ 1: '1天', 3: '3天', 5: '5天', 7: '7天' }"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">
        {{ isEdit ? '保存' : '添加' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import HabitIcon from './HabitIcon.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  habit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref(null)

const isEdit = computed(() => !!props.habit)

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const formData = ref({
  name: '',
  icon: '🎯',
  color: '#6366f1',
  frequency: 'daily',
  weeklyTarget: 7
})

const rules = {
  name: [
    { required: true, message: '请输入习惯名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ]
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.habit) {
    formData.value = { ...props.habit }
  } else if (newVal) {
    formData.value = {
      name: '',
      icon: '🎯',
      color: colors[0],
      frequency: 'daily',
      weeklyTarget: 7
    }
  }
})

function handleClose() {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    handleClose()
  } catch (e) {
    // validation failed
  }
}
</script>

<style scoped>
.color-palette {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #333;
  transform: scale(1.15);
}
</style>
