// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'

/**
 * Custom Error class for API failures
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Unauthorized - clear session
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    window.dispatchEvent(new CustomEvent('storage-update-lms_auth', { detail: null }));
    throw new ApiError('Session expired. Please login again.', 401);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || response.statusText || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
};

/**
 * Centered request helper for standard headers and error handling
 */
const request = async (endpoint, options = {}) => {
  const { token, body, method = 'GET', ...customOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...customOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    ...customOptions,
  });

  return handleResponse(response);
};

export const api = {
  // Auth endpoints
  auth: {
    login: (email, password) => 
      request('/auth/login', { method: 'POST', body: { email, password } }),
    
    register: (userData) => 
      request('/auth/register', { method: 'POST', body: userData }),
    
    getMe: (token) => 
      request('/auth/me', { token }),
    
    changePassword: (currentPassword, newPassword, token) => 
      request('/password/change', { 
        method: 'POST', 
        token, 
        body: { currentPassword, newPassword } 
      }),

    forgotPassword: (email) => 
      request('/password/forgot', { method: 'POST', body: { email } }),

    resetPassword: (token, newPassword) => 
      request(`/password/reset/${token}`, { method: 'POST', body: { newPassword } })
  },

  // Course endpoints
  courses: {
    getAll: () => request('/courses'),
    getById: (id, token) => request(`/courses/${id}`, { token }),
    getMyCourses: (token) => request('/courses/my-courses', { token })
  },

  // Progress endpoints
  progress: {
    getCourseProgress: (courseId, token) => 
      request(`/progress/course/${courseId}`, { token }),
    
    markComplete: (lessonId, token) => 
      request(`/progress/lesson/${lessonId}/complete`, { method: 'POST', token })
  },

  // Enrollment/Purchase
  enrollments: {
    purchase: (courseId, plan, token) => 
      request('/subscriptions/create', { 
        method: 'POST', 
        token, 
        body: { courseId, plan, paymentId: 'web_' + Date.now() } 
      }),
    
    checkAccess: (courseId, token) => 
      request(`/subscriptions/course/${courseId}/access`, { token })
  },

  // Payments
  payments: {
    createOrder: (data, token) => 
      request('/payments/create-order', { method: 'POST', token, body: data }),
    
    verify: (data, token) => 
      request('/payments/verify', { method: 'POST', token, body: data })
  },

  // Certificates
  certificates: {
    getMyCertificates: (token) => 
      request('/certificates/my', { token }),
    
    verify: (code) => 
      request(`/certificates/verify/${code}`),

    download: async (certificateId, token) => {
      const response = await fetch(`${API_URL}/certificates/${certificateId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new ApiError(response.statusText || 'Download failed', response.status);
      return response.blob()
    },
    
    generate: (courseId, quizScore, token) => 
      request(`/certificates/generate/${courseId}`, { 
        method: 'POST', 
        token, 
        body: { quizScore } 
      }),
    
    verifyByCode: (verificationCode) => 
      request(`/certificates/verify/${verificationCode}`)
  },

  // Quizzes (Student)
  quizzes: {
    getCourseQuizzes: (courseId, token) => 
      request(`/quizzes/course/${courseId}`, { token }),
    
    getQuiz: (quizId, token) => 
      request(`/quizzes/${quizId}`, { token }),
    
    submitQuiz: (quizId, answers, token) => 
      request(`/quizzes/${quizId}/submit`, { 
        method: 'POST', 
        token, 
        body: { answers } 
      }),
    
    getMyAttempts: (token) => 
      request('/quizzes/attempts/my', { token })
  },

  // Admin endpoints
  admin: {
    getStats: (token) => request('/admin/stats', { token }),
    getAnalytics: (token) => request('/admin/analytics', { token }),
    
    createCourse: (data, token) => 
      request('/admin/courses', { method: 'POST', token, body: data }),
    
    updateCourse: (id, data, token) => 
      request(`/admin/courses/${id}`, { method: 'PUT', token, body: data }),
    
    deleteCourse: (id, token) => 
      request(`/admin/courses/${id}`, { method: 'DELETE', token }),
    
    createModule: (courseId, data, token) => 
      request(`/admin/courses/${courseId}/modules`, { method: 'POST', token, body: data }),
    
    updateModule: (id, data, token) => 
      request(`/admin/modules/${id}`, { method: 'PUT', token, body: data }),
    
    deleteModule: (id, token) => 
      request(`/admin/modules/${id}`, { method: 'DELETE', token }),
    
    reorderModules: (items, token) => 
      request('/admin/modules/reorder', { method: 'PUT', token, body: { items } }),

    // Lessons
    createLesson: (moduleId, data, token) => 
      request(`/admin/modules/${moduleId}/lessons`, { method: 'POST', token, body: data }),
    
    updateLesson: (id, data, token) => 
      request(`/admin/lessons/${id}`, { method: 'PUT', token, body: data }),
    
    deleteLesson: (id, token) => 
      request(`/admin/lessons/${id}`, { method: 'DELETE', token }),
    
    reorderLessons: (items, token) => 
      request('/admin/lessons/reorder', { method: 'PUT', token, body: { items } }),
    
    // Quizzes
    createQuiz: (data, token) => 
      request('/quizzes', { method: 'POST', token, body: data }),
    
    updateQuiz: (id, data, token) => 
      request(`/quizzes/${id}`, { method: 'PUT', token, body: data }),
    
    deleteQuiz: (id, token) => 
      request(`/quizzes/${id}`, { method: 'DELETE', token }),
    
    reorderQuizzes: (items, token) => 
      request('/admin/quizzes/reorder', { method: 'PUT', token, body: { items } }),
    
    // Questions
    createQuestion: (quizId, data, token) => 
      request(`/quizzes/${quizId}/questions`, { method: 'POST', token, body: { questions: [data] } }),
    
    updateQuestion: (id, data, token) => 
      request(`/quizzes/questions/${id}`, { method: 'PUT', token, body: data }),
    
    deleteQuestion: (id, token) => 
      request(`/quizzes/questions/${id}`, { method: 'DELETE', token })
  },

  // Tickets / Doubts
  tickets: {
    create: (data, token) => 
      request('/tickets', { method: 'POST', token, body: data }),
    
    getMy: (token) => 
      request('/tickets/my', { token }),
    
    getById: (ticketId, token) => 
      request(`/tickets/my/${ticketId}`, { token }),
    
    getAll: (token, filters = {}) => {
      const params = new URLSearchParams(filters).toString()
      return request(`/tickets/all?${params}`, { token })
    },
    
    respond: (ticketId, data, token) => 
      request(`/tickets/${ticketId}/respond`, { method: 'PUT', token, body: data }),
    
    updateStatus: (ticketId, status, token) => 
      request(`/tickets/${ticketId}/status`, { method: 'PUT', token, body: { status } }),
    
    getStats: (token) => 
      request('/tickets/stats', { token })
  },

  // Feedbacks
  feedbacks: {
    submit: (data, token) => 
      request('/feedbacks', { method: 'POST', token, body: data }),
    
    getAll: (token) => 
      request('/feedbacks', { token }),
    
    updateDisplay: (id, showOnHome, token) => 
      request(`/feedbacks/${id}/display`, { method: 'PUT', token, body: { showOnHome } }),
    
    getHome: () => 
      request('/feedbacks/home'),
    
    delete: (id, token) => 
      request(`/feedbacks/${id}`, { method: 'DELETE', token })
  },

  // Blogs
  blogs: {
    getAll: () => request('/blogs'),
    getBySlug: (slug) => request(`/blogs/slug/${slug}`),
    adminGetAll: (token) => request('/blogs/admin/all', { token }),
    create: (data, token) => request('/blogs', { method: 'POST', token, body: data }),
    update: (id, data, token) => request(`/blogs/${id}`, { method: 'PUT', token, body: data }),
    delete: (id, token) => request(`/blogs/${id}`, { method: 'DELETE', token })
  }
}