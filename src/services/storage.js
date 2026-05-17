// src/services/storage.js
import { api } from './api'
import { getStorage, setStorage, removeStorage } from '../utils/storage'
import { authStore } from '../utils/authStore'

// Keys for localStorage
export const TOKEN_KEY = 'lms_token'
export const USER_KEY = 'lms_user'
export const FAVORITES_KEY = 'lms_favorites'
export const AUTH_KEY = 'lms_auth'
export const ENROLLMENTS_KEY = 'lms_enrollments'

const _cache = {
  courses: null,
  courseDetails: {}, // Cache for individual course details
  lastFetched: 0
}
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export const StorageService = {
  // ============ AUTHENTICATION ============
  
  setToken: (token) => {
    if (token) setStorage(TOKEN_KEY, token)
  },
  
  getToken: () => getStorage(TOKEN_KEY),
  
  removeToken: () => removeStorage(TOKEN_KEY),
  
  setUser: (user) => {
    if (user) setStorage(USER_KEY, user)
  },
  
  getUser: () => {
    const user = getStorage(USER_KEY)
    if (!user) return null
    
    if (user && typeof user.coins === 'undefined') {
      user.coins = 0 // Default coins
    }
    return user
  },
  
  updateUser: (updates) => {
    const user = StorageService.getUser()
    if (user) {
      const updatedUser = { ...user, ...updates }
      StorageService.setUser(updatedUser)
      // Signal auth update via store
      authStore.notify(updatedUser)
    }
  },

  getCoins: () => {
    return StorageService.getUser()?.coins || 0
  },

  addCoins: (amount) => {
    const user = StorageService.getUser()
    if (user) {
      StorageService.updateUser({ coins: (user.coins || 0) + amount })
    }
  },

  useCoins: (amount) => {
    const user = StorageService.getUser()
    if (user && (user.coins || 0) >= amount) {
      StorageService.updateUser({ coins: user.coins - amount })
      return true
    }
    return false
  },
  
  removeUser: () => removeStorage(USER_KEY),
  
  isAuthenticated: () => {
    return !!StorageService.getToken()
  },
  
  getAuthState: () => ({
    isAuthenticated: StorageService.isAuthenticated(),
    user: StorageService.getUser()
  }),
  
  login: async (email, password) => {
    try {
      const data = await api.auth.login(email, password)
      
      if (data.success) {
        StorageService.setToken(data.token)
        StorageService.setUser(data.user)
        authStore.notify(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  },
  
  register: async (userData) => {
    try {
      const data = await api.auth.register(userData)
      
      if (data.success) {
        StorageService.setToken(data.token)
        StorageService.setUser(data.user)
        authStore.notify(data.user)
        return { success: true, user: data.user }
      } else {
        return { success: false, message: data.message || 'Registration failed' }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  },

  forgotPassword: async (email) => {
    try {
      return await api.auth.forgotPassword(email)
    } catch (error) {
      console.error('Forgot password error:', error)
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      return await api.auth.resetPassword(token, newPassword)
    } catch (error) {
      console.error('Reset password error:', error)
      return { success: false, message: error.message || 'Network error. Please try again.' }
    }
  },
  
  logout: () => {
    StorageService.removeToken()
    StorageService.removeUser()
    authStore.notify(null)
  },

  // ============ COURSES ============
  
  getCourses: async (forceRefresh = false) => {
    try {
      const now = Date.now()
      if (!forceRefresh && _cache.courses && (now - _cache.lastFetched < CACHE_DURATION)) {
        return _cache.courses
      }

      const data = await api.courses.getAll()
      const raw = data.data || []

      const mappedCourses = raw.map(course => {
        // Find the most appropriate price to display as the default
        const p1 = parseFloat(course.price_1month) || 0
        const p3 = parseFloat(course.price_3months) || 0
        const p6 = parseFloat(course.price_6months) || 0
        
        // Use 3 months as default if available, else 1 month
        const displayPrice = p3 > 0 ? p3 : (p1 > 0 ? p1 : 0)
        
        return {
          id: course.id,
          title: course.title || 'Untitled Course',
          description: course.description || '',
          image: course.thumbnail || null,
          instructor: course.instructor || 'Expert Instructor',
          price: displayPrice,
          originalPrice: p6 > 0 ? p6 : null,
          price_1month: p1,
          price_3months: p3,
          price_6months: p6,
          category: course.category || (course.course_type === 'mega' ? 'development' : 'general'),
          course_type: course.course_type || 'mega',
          allowed_plan: course.allowed_plan || '1month',
          level: course.level || 'intermediate',
          duration: course.duration || 20,
          rating: course.rating || 4.5,
          reviewCount: course.review_count || 0,
          enrolled: course.enrolled || 0,
          createdAt: course.createdAt,
          userAccess: course.userAccess || { hasAccess: false }
        }
      })

      _cache.courses = mappedCourses
      _cache.lastFetched = now
      return mappedCourses
    } catch (error) {
      console.error('Error fetching courses:', error)
      return _cache.courses || []
    }
  },
  
  getCourseById: async (id) => {
    const courseId = parseInt(id)
    
    if (_cache.courseDetails[courseId]) {
      return _cache.courseDetails[courseId]
    }

    try {
      const token = StorageService.getToken()
      const data = await api.courses.getById(courseId, token)
      
      if (data && data.success) {
        _cache.courseDetails[courseId] = data.data
        return data.data
      }
      
      return null
    } catch (error) {
      console.error('Error fetching course:', error)
      return null
    }
  },
  
  getEnrolledCourses: async () => {
    try {
      const token = StorageService.getToken()
      if (!token) return []
      const data = await api.courses.getMyCourses(token)
      return data.data || []
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      return []
    }
  },
  
  isEnrolled: async (courseId) => {
    try {
      const token = StorageService.getToken()
      if (!token) return false
      const data = await api.enrollments.checkAccess(courseId, token)
      return data.hasAccess || false
    } catch (error) {
      console.error('Error checking enrollment:', error)
      return false
    }
  },

  // Enroll (purchase) now uses the api logic
  enroll: async (courseId, plan = '3months', price = 0, coinsUsed = 0) => {
    // Keep the Razorpay logic here as it's a mix of API and UI
    // But update the fetch calls to use api wrapper if applicable
    // For now, I'll keep it mostly as is but clean it up to use handleResponse patterns via api.js eventually
    return new Promise(async (resolve) => {
      try {
        const token = StorageService.getToken()
        if (!token) return resolve({ success: false, message: 'Please login first' })
        
        // This part should probably be in api.js too, but let's keep it here for now to avoid breaking Razorpay flow
        const orderData = await api.payments.createOrder({ 
          courseId: parseInt(courseId), 
          plan, 
          coinsUsed: coinsUsed || 0 
        }, token)
        
        if (!orderData.success) {
          return resolve(orderData)
        }

        if (orderData.isFree) {
          const verifyData = await api.payments.verify({ 
            courseId: parseInt(courseId), 
            plan, 
            coinsUsed: coinsUsed || 0 
          }, token)
          if (verifyData.success) {
            if (coinsUsed > 0) StorageService.useCoins(coinsUsed)
            window.dispatchEvent(new Event(`storage-update-${ENROLLMENTS_KEY}`))
          }
          return resolve(verifyData)
        }

        if (typeof window === 'undefined' || !window.Razorpay) {
          return resolve({ success: false, message: 'Payment system not ready' })
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Adhoc Network Tech",
          description: "Course Enrollment",
          order_id: orderData.order.id,
          handler: async function (response) {
            try {
              const verifyData = await api.payments.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: parseInt(courseId),
                plan,
                coinsUsed: coinsUsed || 0
              }, token)
              if (verifyData.success) {
                if (coinsUsed > 0) StorageService.useCoins(coinsUsed)
                window.dispatchEvent(new Event(`storage-update-${ENROLLMENTS_KEY}`))
              }
              resolve(verifyData)
            } catch (err) {
              resolve({ success: false, message: 'Payment verification failed' })
            }
          },
          prefill: {
            name: StorageService.getUser()?.name || "",
            email: StorageService.getUser()?.email || ""
          },
          theme: { color: "#0052cc" },
          modal: {
            ondismiss: function () {
              resolve({ success: false, message: 'cancelled' })
            }
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
        
      } catch (error) {
        resolve({ success: false, message: 'Network error' })
      }
    })
  },
  
  // ============ PROGRESS ============
  
  getProgress: async (courseId) => {
    try {
      const token = StorageService.getToken()
      if (!token) return {}
      const data = await api.progress.getCourseProgress(courseId, token)
      
      const progressMap = {}
      if (data.data?.lessons) {
        data.data.lessons.forEach(lesson => {
          if (lesson.completed) progressMap[lesson.id] = 'completed'
        })
      }
      return progressMap
    } catch (error) {
      console.error('Error fetching progress:', error)
      return {}
    }
  },
  
  updateProgress: async (courseId, lessonId) => {
    try {
      const token = StorageService.getToken()
      if (!token) return null
      return await api.progress.markComplete(lessonId, token)
    } catch (error) {
      console.error('Error updating progress:', error)
      return null
    }
  },
  
  // ============ FAVORITES (Local only) ============
  
  getFavorites: () => getStorage(FAVORITES_KEY, []),
  
  toggleFavorite: (courseId) => {
    const favs = StorageService.getFavorites()
    const index = favs.indexOf(courseId)
    if (index === -1) {
      favs.push(courseId)
    } else {
      favs.splice(index, 1)
    }
    setStorage(FAVORITES_KEY, favs)
  },
  
  isBookmarked: (courseId) => {
    const favs = StorageService.getFavorites()
    return favs.includes(courseId)
  },
  
  getEnrollments: () => getStorage(ENROLLMENTS_KEY, []),
  
  addEnrollment: (courseId) => {
    const enrollments = StorageService.getEnrollments()
    if (!enrollments.includes(courseId)) {
      enrollments.push(courseId)
      setStorage(ENROLLMENTS_KEY, enrollments)
    }
  }
}

export const getToken = () => StorageService.getToken()
export const getUser = () => StorageService.getUser()
export const isAuthenticated = () => StorageService.isAuthenticated()
export const logout = () => StorageService.logout()