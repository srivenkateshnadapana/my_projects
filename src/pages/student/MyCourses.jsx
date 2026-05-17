import React, { useEffect, useState } from 'react'
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { StorageService } from "../../services/storage"
import { BookOpen, Play, Loader2, Award, ChevronRight, Sparkles } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "../../services/api"

export default function MyCourses() {
  return (
    <ProtectedRoute>
      <MyCoursesContent />
    </ProtectedRoute>
  )
}

function MyCoursesContent() {
  const [courses, setCourses] = useState([])
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadCourses = async () => {
      const enrolled = await StorageService.getEnrolledCourses()
      setCourses(enrolled)
      
      const token = StorageService.getToken()
      
      const progressPromises = enrolled.map(async (course) => {
        const prog = await StorageService.getProgress(course.id)
        const completedLessons = Object.values(prog).filter(p => p === 'completed').length
        
        // Fetch full course details to get total lessons
        const courseData = await api.courses.getById(course.id, token)
        
        let totalLessons = 0;
        if (courseData && courseData.data && courseData.data.modules) {
          totalLessons = courseData.data.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
        }
        totalLessons = totalLessons > 0 ? totalLessons : 1 // Avoid division by zero
        
        return { id: course.id, percent: Math.round((completedLessons / totalLessons) * 100) }
      })

      const progressResults = await Promise.all(progressPromises)
      
      const progressData = {}
      progressResults.forEach(res => {
        progressData[res.id] = res.percent
      })
      
      setProgress(progressData)
      setLoading(false)
    }
    loadCourses()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-headline font-bold text-primary">My Courses</h1>
              <p className="text-on-surface-variant">Manage and resume your tactical learning programs.</p>
            </div>
          </div>
        </motion.div>

        {courses.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <BookOpen className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-4">No Active Courses</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-8">
              You haven't enrolled in any courses yet. Browse the catalog to get started.
            </p>
            <Link to="/catalog" className="px-8 py-4 signature-gradient text-white rounded-xl font-bold hover:scale-105 transition-transform inline-flex items-center gap-2">
              Explore Catalog <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {courses.map((course, idx) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-surface-dim/20 shadow-lg hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="h-48 relative overflow-hidden shrink-0">
                    <img 
                      src={course.thumbnail || course.image || course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&q=100"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={course.title} 
                    />

                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`
                        inline-block px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          course.level === "beginner"
                            ? "bg-green-100 text-green-700"
                            : course.level === "advanced"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      `}>
                        {course.level || "Intermediate"}
                      </span>
                  </div>
                    <h3 className="text-xl font-headline font-bold text-primary mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-on-surface-variant text-xs line-clamp-2 mb-6 flex-1">
                      {course.description}
                    </p>
                    <div className="space-y-4 pt-4 border-t border-surface-dim/10">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-secondary">Progress</span>
                        <span className="text-primary">{progress[course.id] || 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${progress[course.id] || 0}%` }}
                        />
                      </div>
                      <button 
                        onClick={() => navigate(`/student/course/${course.id}`)}
                        className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        Resume Course <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}
