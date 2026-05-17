// src/pages/student/AllDeadlines.jsx
import * as React from "react"
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { Clock } from "lucide-react"
import { StorageService } from "../../services/storage"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function AllDeadlines() {
  return (
    <ProtectedRoute fallbackPath="/auth">
      <AllDeadlinesContent />
    </ProtectedRoute>
  )
}

function AllDeadlinesContent() {
  const [upcomingDeadlines, setUpcomingDeadlines] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const loadDeadlines = async () => {
      const enrolled = await StorageService.getEnrolledCourses()

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
      }).filter(d => d.deadlineDate !== 'N/A').sort((a, b) => a.diffDays - b.diffDays);
      setUpcomingDeadlines(deadlines)
      setIsLoading(false)
    }
    loadDeadlines()
  }, [])

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8 transition-all duration-300">
      <div className="w-[80%] mx-auto">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">
              &larr; Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-headline font-extrabold text-primary tracking-tighter italic leading-tight">
            All Deadlines
          </h1>
          <p className="text-on-surface-variant text-base sm:text-lg font-medium opacity-60 mt-2">
            Track all your upcoming course expirations and targets.
          </p>
        </motion.section>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-dim/20"
          >
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-on-surface-variant">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="py-8 px-6 min-h-[180px] flex flex-col justify-between rounded-2xl bg-surface-container-high/40 border border-surface-dim/10 hover:bg-surface-container-high/60 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-primary leading-tight group-hover:text-blue-500 transition-colors">{deadline.course}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${deadline.priority === 'expired' ? 'bg-red-500 text-white shadow-lg' :
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
                        <span className={`text-xs font-bold ${deadline.priority === 'expired' || deadline.priority === 'high' ? 'text-red-500' : 'text-primary'
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
        )}
      </div>
    </main>
  )
}
