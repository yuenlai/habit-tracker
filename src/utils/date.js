/**
 * Date utility functions for habit tracker
 */

/**
 * Format date to YYYY-MM-DD string
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse date string to Date object
 * @param {string} dateStr - YYYY-MM-DD format
 * @returns {Date}
 */
export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Get today's date string
 * @returns {string}
 */
export function getToday() {
  return formatDate(new Date())
}

/**
 * Get date string for N days ago
 * @param {number} daysAgo
 * @returns {string}
 */
export function getDaysAgo(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return formatDate(date)
}

/**
 * Get array of date strings for the last N days
 * @param {number} days
 * @returns {string[]}
 */
export function getLastNDays(days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    result.push(getDaysAgo(i))
  }
  return result
}

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 * @param {string} dateStr
 * @returns {number}
 */
export function getDayOfWeek(dateStr) {
  return parseDate(dateStr).getDay()
}

/**
 * Get month name in Chinese
 * @param {number} month - 0-11
 * @returns {string}
 */
export function getMonthName(month) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months[month]
}

/**
 * Get day of week name in Chinese
 * @param {number} day - 0-6 (Sunday-Saturday)
 * @returns {string}
 */
export function getDayName(day) {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return days[day]
}

/**
 * Format date for display (e.g., "5月31日 星期六")
 * @param {Date} date
 * @returns {string}
 */
export function formatDisplayDate(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = getDayName(date.getDay())
  return `${month}月${day}日 星期${dayName}`
}

/**
 * Calculate current streak from checkins
 * @param {Object} checkins - { 'YYYY-MM-DD': boolean }
 * @returns {number}
 */
export function calculateStreak(checkins) {
  let streak = 0
  let currentDate = new Date()
  
  while (true) {
    const dateStr = formatDate(currentDate)
    if (checkins[dateStr] === true) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }
  
  return streak
}

/**
 * Calculate longest streak in history
 * @param {Object} checkins - { 'YYYY-MM-DD': boolean }
 * @returns {number}
 */
export function calculateLongestStreak(checkins) {
  const dates = Object.keys(checkins)
    .filter(date => checkins[date] === true)
    .sort()
  
  if (dates.length === 0) return 0
  
  let longestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = parseDate(dates[i - 1])
    const currDate = parseDate(dates[i])
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24)
    
    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return longestStreak
}

/**
 * Calculate completion rate for last N days
 * @param {Object} checkins
 * @param {number} days
 * @returns {number} - percentage 0-100
 */
export function calculateCompletionRate(checkins, days = 30) {
  const lastDays = getLastNDays(days)
  const completed = lastDays.filter(date => checkins[date] === true).length
  return Math.round((completed / days) * 100)
}

/**
 * Count total check-ins
 * @param {Object} checkins
 * @returns {number}
 */
export function countTotalCheckins(checkins) {
  return Object.values(checkins).filter(v => v === true).length
}
