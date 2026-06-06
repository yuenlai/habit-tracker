import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveData, loadData } from '../utils/storage'
import { formatDate, getDaysAgo, calculateStreak, calculateLongestStreak, calculateCompletionRate, countTotalCheckins, isWithinCatchUpWindow } from '../utils/date'

// Categories
export const HABIT_CATEGORIES = {
  health: { id: 'health', name: '健康', icon: '💪', color: '#FF6B6B' },
  learning: { id: 'learning', name: '学习', icon: '📚', color: '#4ECDC4' },
  life: { id: 'life', name: '生活', icon: '🏠', color: '#45B7D1' },
  work: { id: 'work', name: '工作', icon: '💼', color: '#96CEB4' },
  social: { id: 'social', name: '社交', icon: '👥', color: '#DDA0DD' },
  other: { id: 'other', name: '其他', icon: '🎯', color: '#FFEAA7' }
}

export const CATEGORY_LIST = Object.values(HABIT_CATEGORIES)

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Generate check-in data for past 30 days with given completion rate
function generateCheckins(completionRate) {
  const checkins = {}
  for (let i = 0; i < 30; i++) {
    const dateStr = getDaysAgo(i)
    checkins[dateStr] = Math.random() < completionRate
  }
  return checkins
}

// Generate sample diary entries for seed data
function generateSampleDiaries() {
  const diaries = {}
  const sampleFeelings = [
    '今天状态不错，完成得很顺利',
    '有点累但还是坚持下来了',
    '今天心情很好，做事效率很高',
    '感觉身体有点不适但完成了',
    '今天特别有成就感'
  ]
  const sampleDifficulties = [
    '早上起不来，差点放弃了',
    '工作太忙，时间不够',
    '天气不好，影响了状态',
    '今天状态不佳，差点没完成',
    '没有困难，很轻松'
  ]
  const sampleGains = [
    '学会了更好地管理时间',
    '感受到了坚持的力量',
    '身体感觉更有活力了',
    '心态变得更积极了',
    '养成了很好的习惯'
  ]
  
  for (let i = 0; i < 30; i++) {
    const dateStr = getDaysAgo(i)
    if (Math.random() < 0.4) {
      diaries[dateStr] = {
        feeling: sampleFeelings[Math.floor(Math.random() * sampleFeelings.length)],
        difficulty: sampleDifficulties[Math.floor(Math.random() * sampleDifficulties.length)],
        gain: sampleGains[Math.floor(Math.random() * sampleGains.length)],
        createdAt: Date.now() - i * 86400000
      }
    }
  }
  return diaries
}

// Pre-seeded habits
function createSeedHabits() {
  return [
    {
      id: generateId(),
      name: '晨跑',
      icon: '🏃',
      color: '#FF6B6B',
      category: 'health',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.70),
      catchUps: {},
      diaries: generateSampleDiaries()
    },
    {
      id: generateId(),
      name: '阅读30分钟',
      icon: '📚',
      color: '#4ECDC4',
      category: 'learning',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.85),
      catchUps: {},
      diaries: generateSampleDiaries()
    },
    {
      id: generateId(),
      name: '喝8杯水',
      icon: '💧',
      color: '#45B7D1',
      category: 'health',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.90),
      catchUps: {},
      diaries: generateSampleDiaries()
    },
    {
      id: generateId(),
      name: '冥想',
      icon: '🧘',
      color: '#96CEB4',
      category: 'health',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.60),
      catchUps: {},
      diaries: generateSampleDiaries()
    },
    {
      id: generateId(),
      name: '写日记',
      icon: '📝',
      color: '#FFEAA7',
      category: 'life',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.50),
      catchUps: {},
      diaries: generateSampleDiaries()
    }
  ]
}

export const useHabitsStore = defineStore('habits', () => {
  // State
  const habits = ref([])
  const initialized = ref(false)

  // Initialize store from localStorage or seed data
  function init() {
    if (initialized.value) return
    
    const savedData = loadData()
    if (savedData && Array.isArray(savedData) && savedData.length > 0) {
      habits.value = savedData.map(habit => ({
        ...habit,
        category: habit.category || 'other',
        catchUps: habit.catchUps || {},
        diaries: habit.diaries || {}
      }))
      persist()
    } else {
      habits.value = createSeedHabits()
      persist()
    }
    initialized.value = true
  }

  // Persist to localStorage
  function persist() {
    saveData(habits.value)
  }

  // Getters
  const todayStr = computed(() => formatDate(new Date()))

  const todayCompletedCount = computed(() => {
    return habits.value.filter(h => h.checkins[todayStr.value] === true).length
  })

  const totalCount = computed(() => habits.value.length)

  const todayCompletionRate = computed(() => {
    if (habits.value.length === 0) return 0
    return Math.round((todayCompletedCount.value / habits.value.length) * 100)
  })

  const longestStreakOverall = computed(() => {
    let longest = 0
    habits.value.forEach(h => {
      const streak = calculateLongestStreak(h.checkins)
      longest = Math.max(longest, streak)
    })
    return longest
  })

  const totalCheckinsOverall = computed(() => {
    return habits.value.reduce((sum, h) => sum + countTotalCheckins(h.checkins), 0)
  })

  const overallCompletionRate = computed(() => {
    if (habits.value.length === 0) return 0
    const rates = habits.value.map(h => calculateCompletionRate(h.checkins, 30))
    return Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length)
  })

  const habitsByCategory = computed(() => {
    const grouped = {}
    CATEGORY_LIST.forEach(cat => {
      grouped[cat.id] = habits.value.filter(h => h.category === cat.id)
    })
    return grouped
  })

  const categoryStats = computed(() => {
    return CATEGORY_LIST.map(cat => {
      const categoryHabits = habits.value.filter(h => h.category === cat.id)
      const total = categoryHabits.length
      const completedToday = categoryHabits.filter(h => h.checkins[todayStr.value] === true).length
      const rates = categoryHabits.map(h => calculateCompletionRate(h.checkins, 30))
      const avgRate = total > 0 ? Math.round(rates.reduce((sum, r) => sum + r, 0) / total) : 0
      const totalCheckins = categoryHabits.reduce((sum, h) => sum + countTotalCheckins(h.checkins), 0)
      
      return {
        ...cat,
        total,
        completedToday,
        avgRate,
        totalCheckins,
        habits: categoryHabits
      }
    }).filter(cat => cat.total > 0)
  })

  function getHabitsByCategory(categoryId) {
    if (categoryId === 'all') return habits.value
    return habits.value.filter(h => h.category === categoryId)
  }

  function getCategoryStats(categoryId, days = 30) {
    const categoryHabits = habits.value.filter(h => h.category === categoryId)
    if (categoryHabits.length === 0) return null
    
    const rates = categoryHabits.map(h => calculateCompletionRate(h.checkins, days))
    const avgRate = Math.round(rates.reduce((sum, r) => sum + r, 0) / rates.length)
    const totalCheckins = categoryHabits.reduce((sum, h) => sum + countTotalCheckins(h.checkins), 0)
    
    const dayData = {}
    for (let i = days - 1; i >= 0; i--) {
      const dateStr = getDaysAgo(i)
      const completed = categoryHabits.filter(h => h.checkins[dateStr] === true).length
      dayData[dateStr] = {
        completed,
        total: categoryHabits.length,
        rate: categoryHabits.length > 0 ? Math.round((completed / categoryHabits.length) * 100) : 0
      }
    }
    
    return {
      ...HABIT_CATEGORIES[categoryId],
      total: categoryHabits.length,
      avgRate,
      totalCheckins,
      dayData
    }
  }

  // Actions
  function addHabit(habitData) {
    const newHabit = {
      id: generateId(),
      name: habitData.name,
      icon: habitData.icon || '🎯',
      color: habitData.color || '#6366f1',
      category: habitData.category || 'other',
      frequency: habitData.frequency || 'daily',
      weeklyTarget: habitData.weeklyTarget || 7,
      createdAt: todayStr.value,
      checkins: {},
      catchUps: {},
      diaries: {}
    }
    habits.value.push(newHabit)
    persist()
    return newHabit
  }

  function updateHabit(id, updates) {
    const index = habits.value.findIndex(h => h.id === id)
    if (index !== -1) {
      habits.value[index] = { ...habits.value[index], ...updates }
      persist()
    }
  }

  function deleteHabit(id) {
    habits.value = habits.value.filter(h => h.id !== id)
    persist()
  }

  function toggleCheckin(habitId, dateStr = null) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return
    
    const date = dateStr || todayStr.value
    habit.checkins[date] = !habit.checkins[date]
    persist()
  }

  function getHabit(id) {
    return habits.value.find(h => h.id === id)
  }

  function getHabitStreak(id) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return 0
    return calculateStreak(habit.checkins)
  }

  function getHabitLongestStreak(id) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return 0
    return calculateLongestStreak(habit.checkins)
  }

  function getHabitCompletionRate(id, days = 30) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return 0
    return calculateCompletionRate(habit.checkins, days)
  }

  function getHabitTotalCheckins(id) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return 0
    return countTotalCheckins(habit.checkins)
  }

  function isCheckedToday(habitId) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return false
    return habit.checkins[todayStr.value] === true
  }

  function catchUpCheckin(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return false
    if (!isWithinCatchUpWindow(dateStr)) return false
    
    habit.checkins[dateStr] = true
    habit.catchUps[dateStr] = true
    persist()
    return true
  }

  function cancelCatchUp(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return
    
    habit.checkins[dateStr] = false
    delete habit.catchUps[dateStr]
    persist()
  }

  function canCatchUp(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return false
    if (!isWithinCatchUpWindow(dateStr)) return false
    if (habit.checkins[dateStr] === true) return false
    return true
  }

  function isCatchUp(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return false
    return habit.catchUps && habit.catchUps[dateStr] === true
  }

  // Diary methods
  function saveDiary(habitId, dateStr, diaryData) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit) return false
    
    if (!habit.diaries) {
      habit.diaries = {}
    }
    
    habit.diaries[dateStr] = {
      feeling: diaryData.feeling || '',
      difficulty: diaryData.difficulty || '',
      gain: diaryData.gain || '',
      createdAt: Date.now()
    }
    
    persist()
    return true
  }

  function getDiary(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit || !habit.diaries) return null
    return habit.diaries[dateStr] || null
  }

  function getDiaries(habitId) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit || !habit.diaries) return []
    
    return Object.entries(habit.diaries)
      .map(([date, diary]) => ({
        date,
        ...diary
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  function deleteDiary(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit || !habit.diaries) return false
    
    if (habit.diaries[dateStr]) {
      delete habit.diaries[dateStr]
      persist()
      return true
    }
    return false
  }

  function hasDiary(habitId, dateStr) {
    const habit = habits.value.find(h => h.id === habitId)
    if (!habit || !habit.diaries) return false
    return !!habit.diaries[dateStr]
  }

  return {
    // State
    habits,
    initialized,
    // Getters
    todayStr,
    todayCompletedCount,
    totalCount,
    todayCompletionRate,
    longestStreakOverall,
    totalCheckinsOverall,
    overallCompletionRate,
    habitsByCategory,
    categoryStats,
    // Actions
    init,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCheckin,
    getHabit,
    getHabitStreak,
    getHabitLongestStreak,
    getHabitCompletionRate,
    getHabitTotalCheckins,
    isCheckedToday,
    catchUpCheckin,
    cancelCatchUp,
    canCatchUp,
    isCatchUp,
    saveDiary,
    getDiary,
    getDiaries,
    deleteDiary,
    hasDiary,
    getHabitsByCategory,
    getCategoryStats
  }
})
