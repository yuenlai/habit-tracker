/**
 * localStorage helper with JSON serialization
 */

const STORAGE_KEY = 'habit-tracker-data'

/**
 * Save data to localStorage
 * @param {any} data
 */
export function saveData(data) {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Failed to save data to localStorage:', error)
  }
}

/**
 * Load data from localStorage
 * @returns {any}
 */
export function loadData() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY)
    if (serialized === null) {
      return null
    }
    return JSON.parse(serialized)
  } catch (error) {
    console.error('Failed to load data from localStorage:', error)
    return null
  }
}

/**
 * Clear all data from localStorage
 */
export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error)
  }
}

/**
 * Check if data exists in localStorage
 * @returns {boolean}
 */
export function hasData() {
  return localStorage.getItem(STORAGE_KEY) !== null
}
