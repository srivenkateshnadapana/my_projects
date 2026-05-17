/**
 * Base localStorage utilities
 */

export const getStorage = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback
  const item = localStorage.getItem(key)
  if (!item) return fallback
  try {
    return JSON.parse(item)
  } catch {
    return item // Return as string if not JSON
  }
}

export const setStorage = (key, value) => {
  if (typeof window !== "undefined") {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, stringValue)
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new CustomEvent(`storage-update-${key}`, { detail: value }))
  }
}

export const removeStorage = (key) => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent(`storage-update-${key}`, { detail: null }))
  }
}
