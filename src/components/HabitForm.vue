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

      <el-form-item label="习惯分类" prop="category">
        <div class="category-grid">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ selected: formData.category === cat.id }"
            :style="{ '--cat-color': cat.color }"
            @click="formData.category = cat.id"
          >
            <span class="category-icon">{{ cat.icon }}</span>
            <span class="category-name">{{ cat.name }}</span>
          </div>
        </div>
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
import { CATEGORY_LIST } from '../stores/habits'

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

const categories = CATEGORY_LIST

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

const formData = ref({
  name: '',
  icon: '🎯',
  color: '#6366f1',
  category: 'other',
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
      category: 'other',
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
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.category-item:hover {
  border-color: var(--cat-color);
  background: #fff;
}

.category-item.selected {
  border-color: var(--cat-color);
  background: var(--cat-color);
  color: #fff;
  transform: scale(1.05);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.category-name {
  font-size: 12px;
  font-weight: 500;
}

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
