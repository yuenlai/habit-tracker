import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { saveData, loadData } from '../utils/storage'
import { formatDate, getDaysAgo, calculateStreak, calculateLongestStreak, calculateCompletionRate, countTotalCheckins } from '../utils/date'

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

// Pre-seeded habits
function createSeedHabits() {
  return [
    {
      id: generateId(),
      name: '晨跑',
      icon: '🏃',
      color: '#FF6B6B',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.70)
    },
    {
      id: generateId(),
      name: '阅读30分钟',
      icon: '📚',
      color: '#4ECDC4',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.85)
    },
    {
      id: generateId(),
      name: '喝8杯水',
      icon: '💧',
      color: '#45B7D1',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.90)
    },
    {
      id: generateId(),
      name: '冥想',
      icon: '🧘',
      color: '#96CEB4',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.60)
    },
    {
      id: generateId(),
      name: '写日记',
      icon: '📝',
      color: '#FFEAA7',
      frequency: 'daily',
      weeklyTarget: 7,
      createdAt: getDaysAgo(30),
      checkins: generateCheckins(0.50)
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
      habits.value = savedData
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

  // Actions
  function addHabit(habitData) {
    const newHabit = {
      id: generateId(),
      name: habitData.name,
      icon: habitData.icon || '🎯',
      color: habitData.color || '#6366f1',
      frequency: habitData.frequency || 'daily',
      weeklyTarget: habitData.weeklyTarget || 7,
      createdAt: todayStr.value,
      checkins: {}
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
    isCheckedToday
  }
})
