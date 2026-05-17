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
  
  _mapCourse: (course) => {
    const allowedPlan = course.allowed_plan || '1month';
    // API returns either flat price_1month fields OR a nested prices object — handle both
    const prices = course.prices || {};
    const p1 = parseFloat(course.price_1month) || parseFloat(prices['1month']) || 0;
    const p3 = parseFloat(course.price_3months) || parseFloat(prices['3months']) || 0;
    const p6 = parseFloat(course.price_6months) || parseFloat(prices['6months']) || 0;
    const pGeneric = parseFloat(course.price) || 0;
    let displayPrice = 0;

    // Select price based on allowed plan
    if (allowedPlan === '1month') displayPrice = p1;
    else if (allowedPlan === '3months') displayPrice = p3 || p1;
    else if (allowedPlan === '6months') displayPrice = p6 || p3 || p1;

    // Final safety fallback
    displayPrice = displayPrice || p1 || p3 || p6 || pGeneric || 0;


    return {
      id: course.id,
      title: course.title || 'Untitled Course',
      description: course.description || '',
      image: course.thumbnail || course.imageUrl || null,
      instructor: course.instructor || 'Expert Instructor',
      price: displayPrice,
      originalPrice: parseFloat(course.price_6months) || null,
      price_1month: parseFloat(course.price_1month) || 0,
      price_3months: parseFloat(course.price_3months) || 0,
      price_6months: parseFloat(course.price_6months) || 0,
      category: course.category || (course.course_type === 'mega' ? 'development' : course.course_type === 'mini' ? 'design' : 'business'),
      course_type: course.course_type,
      allowed_plan: course.allowed_plan,
      level: course.level || 'intermediate',
      duration: course.lessons && course.lessons.length > 0 
        ? Math.round(course.lessons.reduce((acc, l) => acc + (Number(l.duration) || 0), 0) / 60) 
        : (course.duration || 20),
      rating: course.rating || 4.5,
      reviewCount: course.review_count || 0,
      enrolled: course.enrolled > 1000 ? course.enrolled : ((parseInt(course.id) || 1) * 7391 % 90000) + 1000,
      createdAt: course.createdAt,
      userAccess: course.userAccess || { hasAccess: false },
      modules: course.modules || []
    };
  },
  
  getCourses: async (forceRefresh = false) => {
    try {
      const now = Date.now()
      if (!forceRefresh && _cache.courses && (now - _cache.lastFetched < CACHE_DURATION)) {
        return _cache.courses
      }

      const data = await api.courses.getAll()
      const raw = data.data || []

      const mappedCourses = raw.map(course => StorageService._mapCourse(course))

      _cache.courses = mappedCourses
      _cache.lastFetched = now
      return mappedCourses
    } catch (error) {
      console.error('Error fetching courses:', error)
      return _cache.courses || []
    }
  },
  
  getCourseById: async (id, forceRefresh = false) => {
    const courseId = parseInt(id)
    
    if (!forceRefresh && _cache.courseDetails[courseId]) {
      return _cache.courseDetails[courseId]
    }

    if (!forceRefresh && _cache.courses) {
      const cached = _cache.courses.find(c => c.id === courseId)
      if (cached) return cached
    }

    try {
      const token = StorageService.getToken()
      const data = await api.courses.getById(courseId, token)
      
      if (data && data.success) {
        const mapped = StorageService._mapCourse(data.data)
        _cache.courseDetails[courseId] = mapped
        return mapped
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
          modal: {
            ondismiss: function () {
              // User closed Razorpay popup without paying — resolve so the button unlocks
              resolve({ success: false, message: 'cancelled' })
            }
          },
          prefill: {
            name: StorageService.getUser()?.name || "",
            email: StorageService.getUser()?.email || ""
          },
          theme: { color: "#0052cc" }
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
    window.dispatchEvent(new Event(`storage-update-${FAVORITES_KEY}`))
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