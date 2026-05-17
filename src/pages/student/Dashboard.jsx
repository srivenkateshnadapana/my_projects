// src/pages/student/Dashboard.jsx
import * as React from "react"
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Play, 
  Trophy, 
  Target, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Flame,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { StorageService, ENROLLMENTS_KEY } from "../../services/storage"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "../../services/api"

export default function Dashboard() {
  return (
    <ProtectedRoute fallbackPath="/auth">
      <DashboardContent />
    </ProtectedRoute>
  )
}

function DashboardContent() {
  const [courses, setCourses] = React.useState([])
  const [progress, setProgress] = React.useState({})
  const [certificates, setCertificates] = React.useState([])
  const [learningHours, setLearningHours] = React.useState(0)
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [recentActivity, setRecentActivity] = React.useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = React.useState([])
  const [streak, setStreak] = React.useState(0)
  const [recommendedCourses, setRecommendedCourses] = React.useState([])
  const navigate = useNavigate()
  const user = StorageService.getUser()

  React.useEffect(() => {
    const loadEnrolledCourses = async () => {
      const enrolled = await StorageService.getEnrolledCourses()
      setCourses(enrolled)
      
      const token = StorageService.getToken()
      
      // Create a map to store course details (durations, etc)
      const courseDetailsMap = {}
      
      // Load progress and full course data
      const progressPromises = enrolled.map(async (course) => {
        const prog = await StorageService.getProgress(course.id)
        const completedLessonsCount = Object.values(prog).filter(p => p === 'completed').length
        
        const courseRes = await api.courses.getById(course.id, token)
        const courseData = courseRes?.data || {}
        
        // Store course details for deadline calculation
        courseDetailsMap[course.id] = courseData
        
        let totalLessons = 0;
        if (courseData.modules) {
          totalLessons = courseData.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0)
        }
        totalLessons = totalLessons > 0 ? totalLessons : 1;
        
        return {
          id: course.id,
          percent: Math.round((completedLessonsCount / totalLessons) * 100),
          completedLessons: completedLessonsCount,
          title: course.title
        }
      })

      const progressResults = await Promise.all(progressPromises)
      
      const progressData = {}
      let totalCompletedLessons = 0;
      
      progressResults.forEach(res => {
        progressData[res.id] = res.percent
        totalCompletedLessons += res.completedLessons
      })
      
      setProgress(progressData)
      setLearningHours(totalCompletedLessons)
      
      // Fetch Activity: Quiz Attempts
      const activities = []
      try {
        const quizRes = await api.quizzes.getMyAttempts(token)
        if (quizRes && quizRes.success) {
          const quizActivities = (quizRes.data || []).slice(0, 3).map(attempt => ({
            id: `quiz-${attempt.id}`,
            type: 'scored',
            course: attempt.Quiz?.title || "Quiz",
            date: new Date(attempt.createdAt).toLocaleDateString(),
            points: Math.round(attempt.score),
            score: attempt.score
          }))
          activities.push(...quizActivities)
        }
      } catch (err) {
        console.error("Failed to load quiz attempts", err)
      }

      // Fetch Activity: Certificates
      try {
        const certData = await api.certificates.getMyCertificates(token)
        if (certData && certData.success) {
          const certs = certData.data || []
          setCertificates(certs)
          
          const certActivities = certs.slice(0, 2).map(cert => ({
            id: `cert-${cert.id}`,
            type: 'completed',
            course: cert.Course?.title || "Course",
            date: new Date(cert.createdAt).toLocaleDateString(),
            points: 500
          }))
          activities.push(...certActivities)
        }
      } catch (err) {
        console.error("Failed to load certificates", err)
      }

      setRecentActivity(activities.sort((a, b) => new Date(b.date) - new Date(a.date)))

      // Generate Dynamic Deadlines based on subscription object data
      const deadlines = enrolled.map(course => {
        const sub = course.subscription || {};
        
        // Use expiresAt directly from subscription
        const deadlineDate = sub.expiresAt ? new Date(sub.expiresAt) : null;
        
        // Fallback for enrollment date
        const rawDate = course.startDate ||
                        course.registrationDate || 
                        course.enrolledAt || 
                        course.subscriptionDate || 
                        course.createdAt;
        const enrollmentDate = new Date(sub.startDate || sub.purchasedAt || rawDate);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let diffDays = 0;
        let finalDeadlineDate = null;

        if (deadlineDate && !isNaN(deadlineDate.getTime())) {
          finalDeadlineDate = new Date(deadlineDate);
          finalDeadlineDate.setHours(0, 0, 0, 0);
          const diffTime = finalDeadlineDate - today;
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else if (sub.daysRemaining !== undefined) {
          // Use daysRemaining if expiresAt is not available
          diffDays = parseInt(sub.daysRemaining);
          finalDeadlineDate = new Date(today);
          finalDeadlineDate.setDate(today.getDate() + diffDays);
        }
        
        return {
          id: course.id,
          course: course.title,
          assignment: "Program Completion",
          registrationDate: enrollmentDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          deadlineDate: finalDeadlineDate ? finalDeadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
          due: diffDays < 0 ? 'Expired' : (diffDays === 0 ? 'Due Today' : `${diffDays} days`),
          diffDays: diffDays,
          priority: diffDays < 0 ? 'expired' : (diffDays < 15 ? 'high' : 'medium')
        };
      }).filter(d => d.deadlineDate !== 'N/A').sort((a, b) => a.diffDays - b.diffDays).slice(0, 2);
      // Finalize and set the dynamic deadlines for display on the dashboard
      setUpcomingDeadlines(deadlines)
      
      /* 
      // Calculate and set the learning streak
      // Currently using a placeholder logic that maps completed lessons to streak days (capped at 7)
      setStreak(totalCompletedLessons > 0 ? Math.min(totalCompletedLessons, 7) : 0)
      */
      
      // Load Recommended Courses
      try {
        const allCourses = await StorageService.getCourses()
        const enrolledIds = enrolled.map(c => c.id)
        const recommended = allCourses
          .filter(course => !enrolledIds.includes(course.id))
          .slice(0, 3)
        setRecommendedCourses(recommended)
      } catch (err) {
        console.error("Failed to load recommended courses", err)
      }

      setIsHydrated(true)
    }
    loadEnrolledCourses()
  }, [])

  // Calculate stats
  const totalCourses = courses.length
  const completedCourses = courses.filter(c => progress[c.id] === 100).length
  const certificatesEarned = certificates.length

  const stats = [
    { label: "Active Courses", value: totalCourses.toString(), icon: BookOpen, accent: "primary", trend: "Your learning path" },
    { label: "Completed", value: completedCourses.toString(), icon: GraduationCap, accent: "secondary", trend: `${completedCourses} finished` },
    { label: "Hours Learned", value: learningHours.toString(), icon: Clock, accent: "primary", trend: "Based on lessons" },
    { label: "Certificates", value: certificatesEarned.toString(), icon: Trophy, accent: "secondary", trend: certificatesEarned > 0 ? "Ready to download" : "Complete a course" },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="w-full">
              <span className="text-[10px] font-bold text-outline uppercase tracking-[0.4em] block mb-2">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-primary tracking-tighter italic leading-tight">
                Welcome, {user?.name?.split(' ')[0] || "Operator"}
              </h1>
              <p className="text-on-surface-variant text-base sm:text-lg font-medium opacity-60 mt-2">
                Your tactical learning dashboard is ready.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-fit lg:mr-20">
              {/* Learning Streak Badge - Commented for now and we'll update this section after Deployment
              <div className="flex-1 lg:flex-none lg:min-w-[220px] bg-surface-container-low px-4 sm:px-6 py-4 rounded-2xl border border-surface-dim/20 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none mb-1 whitespace-nowrap">Learning Streak</p>
                  <p className="text-primary font-headline font-bold text-xl sm:text-2xl">{streak} days</p>
                </div>
              </div>
              */}
              <div className="flex-1 lg:flex-none lg:min-w-[220px] bg-surface-container-low px-4 sm:px-6 py-4 rounded-2xl border border-surface-dim/20 flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full signature-gradient flex items-center justify-center text-white shadow-lg">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-none mb-1 whitespace-nowrap">Global Standing</p>
                  <p className="text-primary font-headline font-bold text-sm sm:text-base">Top 5% of Scholars</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Bento Grid */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={itemVariants} whileHover={{ scale: 1.02 }} className="bg-surface-container-lowest p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-surface-dim/20 shadow-xl shadow-primary/5 transition-all group">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${stat.accent === 'primary' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-secondary'} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <p className="text-[8px] sm:text-[10px] font-bold text-outline uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-4xl font-headline font-extrabold text-primary tracking-tighter">{stat.value}</p>
                <p className="hidden sm:block text-xs text-on-surface-variant mt-2">{stat.trend}</p>
              </motion.div>
            )
          })}
        </motion.section>

        {/* Two Column Layout for Activity and Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Recent Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 border border-surface-dim/20"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-primary">Recent Activity</h2>
              
            </div>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-on-surface-variant">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-all">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'completed' ? 'bg-green-500/10' :
                      activity.type === 'started' ? 'bg-blue-500/10' : 'bg-yellow-500/10'
                    }`}>
                      {activity.type === 'completed' ? <Trophy className="w-4 h-4 text-green-500" /> :
                       activity.type === 'started' ? <Play className="w-4 h-4 text-blue-500" /> :
                       <Award className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-on-surface">
                        {activity.type === 'completed' ? 'Completed' : activity.type === 'started' ? 'Started' : 'Scored'} <span className="font-bold text-primary">{activity.course}</span>
                      </p>
                      <p className="text-xs text-right text-on-surface-variant">{activity.date}</p>
                    </div>
                    
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-dim/20 flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-primary">Deadlines</h2>
              <Link to="/student/deadlines" className="text-sm font-medium text-primary flex items-center gap-1 hover:opacity-80 transition-opacity">
                View More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-on-surface-variant">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="py-6 px-5 flex-1 min-h-[120px] flex flex-col justify-between rounded-2xl bg-surface-container-high/40 border border-surface-dim/10 hover:bg-surface-container-high/60 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-primary leading-tight group-hover:text-blue-500 transition-colors">{deadline.course}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                        deadline.priority === 'expired' ? 'bg-red-500 text-white shadow-lg' :
                        deadline.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                      }`}>
                        {deadline.priority === 'expired' ? 'Expired' : (deadline.priority === 'high' ? 'Urgent' : 'Upcoming')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-[10px] font-medium text-on-surface-variant">
                        <span>Registered on</span>
                        <span className="text-on-surface font-bold">{deadline.registrationDate}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-medium text-on-surface-variant">
                        <span>Completion Target</span>
                        <span className="text-on-surface font-bold">{deadline.deadlineDate}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-surface-dim/10">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${deadline.priority === 'high' ? 'text-red-500' : 'text-primary'}`} />
                        <span className={`text-xs font-bold ${
                          deadline.priority === 'expired' || deadline.priority === 'high' ? 'text-red-500' : 'text-primary'
                        }`}>
                          {deadline.diffDays < 0 ? 'Subscription Expired' : (deadline.diffDays === 0 ? 'Expires today' : `Due in ${deadline.diffDays} days`)}
                        </span>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Active Courses Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary italic">Active Protocols</h2>
              <p className="text-on-surface-variant text-xs sm:text-sm mt-1">Continue where you left off</p>
            </div>
            <Link to="/catalog" className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em] border-b-2 border-primary pb-1 hover:opacity-70 transition-all flex items-center gap-1">
              Continue <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {!isHydrated ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : courses.length === 0 ? (
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner"
            >
              <BookOpen className="w-16 h-16 text-surface-dim mx-auto mb-6" />
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">No Active Sessions</h3>
              <p className="text-on-surface-variant max-w-sm mx-auto mb-10 font-medium">
                Your learning profile is currently idle. Access the global catalog to initialize your first curriculum.
              </p>
              <Link to="/catalog" className="px-10 py-5 signature-gradient text-white rounded-2xl font-bold text-lg shadow-xl inline-flex items-center gap-2 group">
                Initialize Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnimatePresence>
                {courses.map((course, idx) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-surface-container-lowest rounded-3xl sm:rounded-[3rem] overflow-hidden border border-surface-dim/20 hover:border-blue-500/50 shadow-xl hover:shadow-2xl transition-all group flex flex-col sm:flex-row h-full"
                  >
                    <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative overflow-hidden">
                      <img 
                        src={course.thumbnail || course.image || course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&q=100"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={course.title} 
                      />
                      <div className="absolute inset-0 group-hover:bg-transparent transition-colors"></div>

                      {progress[course.id] === 100 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          Completed!
                        </div>
                      )}
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-surface-container-high text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            {course.category}
                          </span>
                          <span className="text-[10px] font-bold text-primary opacity-40 uppercase tracking-widest">
                            {course.level} Level
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-headline font-bold text-primary mb-3 sm:mb-4 leading-tight transition-colors group-hover:text-blue-500">
                          {course.title}
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm line-clamp-2 mb-4">
                          {course.description || "Master the fundamentals and advanced concepts of this subject with hands-on projects."}
                        </p>
                      </div>
                      <div className="space-y-6 pt-6 border-t border-surface-dim/10">
                        <div className="flex justify-between items-center text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">
                          <span>Session Progress</span>
                          <span>{progress[course.id] || 0}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${progress[course.id] || 0}%` }}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => navigate(`/student/course/${course.id}`)}
                            className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            {progress[course.id] === 100 ? 'Review Course' : 'Resume Operation'}
                            <Play className="w-5 h-5" />
                          </button>
                          {progress[course.id] < 100 && (
                            <button className="px-4 py-4 bg-surface-container-high rounded-2xl hover:bg-surface-container transition-all">
                              <Sparkles className="w-5 h-5 text-primary" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
        {/* recommendedCourses */}

        {recommendedCourses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-headline font-bold text-primary">Recommended for You</h2>
                <p className="text-on-surface-variant text-sm">Based on your learning history</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-dim/20 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-xs font-bold text-primary">Trending</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg mb-2">{course.title}</h3>
                  <p className="text-on-surface-variant text-sm mb-4">By {course.instructor || 'Expert Instructor'}</p>
                  <Link to={`/course/${course.id}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    Explore <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  )
}