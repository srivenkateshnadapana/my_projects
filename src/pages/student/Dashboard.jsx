// src/pages/student/Dashboard.jsx
import * as React from "react";
import { ProtectedRoute } from "../../context/ProtectedRoute";
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
  Sparkles,
} from "lucide-react";
import { StorageService, ENROLLMENTS_KEY } from "../../services/storage";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import { AnalyticsWidget } from "../../components/student/AnalyticsWidget";

export default function Dashboard() {
  return (
    <ProtectedRoute fallbackPath="/auth">
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const [courses, setCourses] = React.useState([]);
  const [progress, setProgress] = React.useState({});
  const [certificates, setCertificates] = React.useState([]);
  const [learningHours, setLearningHours] = React.useState(0);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = React.useState([]);
  const [streak, setStreak] = React.useState(0);
  const [recommendedCourses, setRecommendedCourses] = React.useState([]);
  const navigate = useNavigate();
  const user = StorageService.getUser();

  React.useEffect(() => {
    const loadEnrolledCourses = async () => {
      const enrolled = await StorageService.getEnrolledCourses();
      setCourses(enrolled);

      const token = StorageService.getToken();

      // Load progress and full course data
      const progressPromises = enrolled.map(async (course) => {
        const prog = await StorageService.getProgress(course.id);
        const completedLessonsCount = Object.values(prog).filter(
          (p) => p === "completed",
        ).length;

        const courseData = await api.courses.getById(course.id, token);
        let totalLessons = 0;
        if (courseData && courseData.data && courseData.data.modules) {
          totalLessons = courseData.data.modules.reduce(
            (acc, mod) => acc + (mod.lessons?.length || 0),
            0,
          );
        }
        totalLessons = totalLessons > 0 ? totalLessons : 1;

        return {
          id: course.id,
          percent: Math.round((completedLessonsCount / totalLessons) * 100),
          completedLessons: completedLessonsCount,
          title: course.title,
        };
      });

      const progressResults = await Promise.all(progressPromises);

      const progressData = {};
      let totalCompletedLessons = 0;

      progressResults.forEach((res) => {
        progressData[res.id] = res.percent;
        totalCompletedLessons += res.completedLessons;
      });

      setProgress(progressData);
      setLearningHours(totalCompletedLessons);

      // Fetch Activity: Quiz Attempts
      const activities = [];
      try {
        const quizRes = await api.quizzes.getMyAttempts(token);
        if (quizRes && quizRes.success) {
          const quizActivities = (quizRes.data || [])
            .slice(0, 3)
            .map((attempt) => ({
              id: `quiz-${attempt.id}`,
              type: "scored",
              course: attempt.Quiz?.title || "Quiz",
              date: new Date(attempt.createdAt).toLocaleDateString(),
              points: Math.round(attempt.score),
              score: attempt.score,
            }));
          activities.push(...quizActivities);
        }
      } catch (err) {
        console.error("Failed to load quiz attempts", err);
      }

      // Fetch Activity: Certificates
      try {
        const certData = await api.certificates.getMyCertificates(token);
        if (certData && certData.success) {
          const certs = certData.data || [];
          setCertificates(certs);

          const certActivities = certs.slice(0, 2).map((cert) => ({
            id: `cert-${cert.id}`,
            type: "completed",
            course: cert.Course?.title || "Course",
            date: new Date(cert.createdAt).toLocaleDateString(),
            points: 500,
          }));
          activities.push(...certActivities);
        }
      } catch (err) {
        console.error("Failed to load certificates", err);
      }

      setRecentActivity(
        activities.sort((a, b) => new Date(b.date) - new Date(a.date)),
      );

      // Generate Dynamic Deadlines based on subscription object data
      const deadlines = enrolled
        .map((course) => {
          const sub = course.subscription || {};

          // Use expiresAt directly from subscription
          const deadlineDate = sub.expiresAt ? new Date(sub.expiresAt) : null;

          // Fallback for enrollment date
          const rawDate =
            course.startDate ||
            course.registrationDate ||
            course.enrolledAt ||
            course.subscriptionDate ||
            course.createdAt;
          const enrollmentDate = new Date(
            sub.startDate || sub.purchasedAt || rawDate,
          );

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
            registrationDate: enrollmentDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            deadlineDate: finalDeadlineDate
              ? finalDeadlineDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "N/A",
            due:
              diffDays < 0
                ? "Expired"
                : diffDays === 0
                  ? "Due Today"
                  : `${diffDays} days`,
            diffDays: diffDays,
            priority:
              diffDays < 0 ? "expired" : diffDays < 15 ? "high" : "medium",
          };
        })
        .filter((d) => d.deadlineDate !== "N/A")
        .sort((a, b) => a.diffDays - b.diffDays)
        .slice(0, 2);
      // Finalize and set the dynamic deadlines for display on the dashboard
      setUpcomingDeadlines(deadlines);

      /* 
      // Calculate and set the learning streak
      // Currently using a placeholder logic that maps completed lessons to streak days (capped at 7)
      setStreak(totalCompletedLessons > 0 ? Math.min(totalCompletedLessons, 7) : 0)
      */

      // Load Recommended Courses
      try {
        const allCourses = await StorageService.getCourses();
        const enrolledIds = enrolled.map((c) => c.id);
        const recommended = allCourses
          .filter((course) => !enrolledIds.includes(course.id))
          .slice(0, 3);
        setRecommendedCourses(recommended);
      } catch (err) {
        console.error("Failed to load recommended courses", err);
      }

      setIsHydrated(true);
    };
    loadEnrolledCourses();
  }, []);

  // Calculate stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => progress[c.id] === 100).length;
  const certificatesEarned = certificates.length;

  const stats = [
    {
      label: "Enrolled Courses",
      value: totalCourses.toString(),
      icon: BookOpen,
      accent: "primary",
      trend: "Your learning path",
    },
    {
      label: "Completed",
      value: completedCourses.toString(),
      icon: GraduationCap,
      accent: "secondary",
      trend: `${completedCourses} finished`,
    },
    {
      label: "Lessons Completed",
      value: learningHours.toString(),
      icon: Clock,
      accent: "primary",
      trend: "Total completed lessons",
    },
    {
      label: "Certificates",
      value: certificatesEarned.toString(),
      icon: Trophy,
      accent: "secondary",
      trend: certificatesEarned > 0 ? "Ready to download" : "Complete a course",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8 transition-all duration-300 relative overflow-hidden">
      {/* Immersive Cyber Grid Background Overlay */}
      <div className="absolute inset-0 cyber-grid-bg opacity-25 pointer-events-none" />
      <div
        className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse-glow"
        style={{ animationDuration: "10s" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Welcome Operator Header */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 cyber-glass p-8 sm:p-10 rounded-[3rem] border border-primary/30 shadow-[0_10px_40px_-10px_rgba(0,85,255,0.2)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
            <div className="w-full">
              <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,85,255,0.2)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>Student Dashboard Active</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-headline font-black text-on-surface dark:text-white tracking-tight leading-none mb-3">
                Welcome,{" "}
                <span className="hologram-text">
                  {user?.full_name?.split(" ")[0] ||
                    user?.name?.split(" ")[0] ||
                    "Student"}
                </span>
              </h1>
              <p className="text-on-surface-variant text-base sm:text-xl font-medium max-w-2xl">
                Track your courses, quizzes, and learning progress here.
              </p>
            </div>

            {/* Global Standing Badge */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-fit shrink-0">
              <div className="hi-tech-panel px-6 py-5 rounded-3xl flex items-center gap-5 border border-primary/40 shadow-[0_0_25px_rgba(0,85,255,0.3)] bg-background/80 backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl signature-gradient flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,85,255,0.6)] animate-pulse">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs font-mono font-extrabold text-secondary uppercase tracking-[0.2em] leading-none mb-1.5">
                    Student Ranking
                  </p>
                  <p className="text-primary font-headline font-black text-xl tracking-tight drop-shadow-[0_0_10px_rgba(0,85,255,0.4)]">
                    Top Performer / Star Student
                  </p>
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
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 mb-16"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="hi-tech-panel p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${stat.accent === "primary" ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(0,85,255,0.3)]" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]"} flex items-center justify-center mb-5 group-hover:rotate-12 transition-all duration-300`}
                >
                  <Icon
                    className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="text-[10px] font-mono font-extrabold text-secondary uppercase tracking-[0.2em] mb-1.5">
                  {stat.label}
                </p>
                <p className="text-3xl sm:text-5xl font-headline font-black text-on-surface dark:text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  {stat.value}
                </p>
                <p className="hidden sm:block text-xs font-mono text-on-surface-variant mt-3 border-t border-primary/20 pt-2 opacity-80">
                  {stat.trend}
                </p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Two Column Layout for Activity and Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 cyber-glass rounded-[3rem] p-8 sm:p-10 border border-primary/30 shadow-2xl relative"
          >
            <div className="flex justify-between items-center mb-8 border-b border-primary/20 pb-4">
              <div>
                <h2 className="text-2xl font-headline font-extrabold text-primary flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 animate-pulse" />
                  <span>Recent Activity & Logs</span>
                </h2>
                <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                  Updates on your quizzes, assignments, and certificates
                </p>
              </div>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-12 cyber-glass p-6 rounded-3xl border border-primary/10">
                <p className="text-on-surface font-mono text-sm tracking-widest uppercase opacity-60">
                  No recent activity logged
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-5 p-4 rounded-2xl cyber-glass border border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        activity.type === "completed"
                          ? "bg-success/20 text-success border border-success/40 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                          : activity.type === "started"
                            ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(0,85,255,0.3)]"
                            : "bg-warning/20 text-warning border border-warning/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      }`}
                    >
                      {activity.type === "completed" ? (
                        <Trophy
                          className="w-5 h-5 text-success animate-bounce"
                          style={{ animationDuration: "2s" }}
                        />
                      ) : activity.type === "started" ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <Award className="w-5 h-5 text-warning animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-on-surface truncate">
                        {activity.type === "completed"
                          ? "Completed Course"
                          : activity.type === "started"
                            ? "Started Course"
                            : "Completed Quiz"}{" "}
                        <span className="font-extrabold font-headline text-primary">
                          {activity.course}
                        </span>
                      </p>
                      <p className="text-xs font-mono text-secondary mt-1 tracking-wider uppercase">
                        {activity.date}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-full uppercase tracking-widest">
                      Verified
                    </span>
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
            className="cyber-glass rounded-[3rem] p-8 sm:p-10 border border-primary/30 shadow-2xl flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-error/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="flex justify-between items-center mb-8 border-b border-primary/20 pb-4">
              <div>
                <h2 className="text-2xl font-headline font-extrabold text-primary flex items-center gap-3">
                  <Clock className="w-6 h-6 animate-spin-slow text-error" />
                  <span>Course Expiry Tracker</span>
                </h2>
                <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                  Track your course expiry dates
                </p>
              </div>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-12 cyber-glass p-6 rounded-3xl border border-primary/10 flex-1 flex items-center justify-center">
                <p className="text-on-surface font-mono text-sm tracking-widest uppercase opacity-60">
                  All courses are active
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-5">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="p-6 flex-1 min-h-[140px] flex flex-col justify-between rounded-3xl cyber-glass border border-primary/20 hover:border-error/50 transition-all group shadow-lg"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-headline font-extrabold text-on-surface dark:text-white text-lg leading-tight group-hover:text-error transition-colors">
                          {deadline.course}
                        </h3>
                        <span
                          className={`text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                            deadline.priority === "expired"
                              ? "bg-error text-on-error border-error shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse"
                              : deadline.priority === "high"
                                ? "bg-error/20 text-error border-error/40 shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                                : "bg-primary/20 text-primary border-primary/40"
                          }`}
                        >
                          {deadline.priority === "expired"
                            ? "Course Expired"
                            : deadline.priority === "high"
                              ? "Expiring Soon"
                              : "Active"}
                        </span>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-mono font-medium text-secondary">
                          <span>Enrolled On:</span>
                          <span className="text-on-surface dark:text-white font-bold">
                            {deadline.registrationDate}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-mono font-medium text-secondary">
                          <span>Expires On:</span>
                          <span className="text-on-surface dark:text-white font-bold">
                            {deadline.deadlineDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`w-4 h-4 ${deadline.priority === "high" || deadline.priority === "expired" ? "text-error animate-bounce" : "text-primary"}`}
                          style={{ animationDuration: "2s" }}
                        />
                        <span
                          className={`text-xs font-mono font-extrabold tracking-wide uppercase ${
                            deadline.priority === "expired" ||
                            deadline.priority === "high"
                              ? "text-error font-black drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]"
                              : "text-primary"
                          }`}
                        >
                          {deadline.diffDays < 0
                            ? "Course Expired"
                            : deadline.diffDays === 0
                              ? "Expires Today"
                              : `${deadline.diffDays} Days Left`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Advanced Analytics Component */}
        <AnalyticsWidget
          courses={courses}
          progress={progress}
          recentActivity={recentActivity}
        />

        {/* Active Protocols Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="my-16"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 cyber-glass p-6 sm:p-8 rounded-3xl border border-primary/30 shadow-xl">
            <div>
              <h2 className="text-3xl font-headline font-black text-primary flex items-center gap-3">
                <Sparkles className="w-8 h-8 animate-pulse text-tertiary" />
                <span>Active Enrolled Courses</span>
              </h2>
              <p className="text-secondary font-mono tracking-widest uppercase text-xs mt-1.5">
                Resume your active course lectures and modules
              </p>
            </div>
            <Link
              to="/catalog"
              className="cyber-glass px-6 py-3 rounded-full border border-primary/40 text-primary font-mono font-bold text-xs tracking-widest uppercase hover:bg-primary/20 hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,85,255,0.3)] flex items-center gap-2"
            >
              <span>Access Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {!isHydrated ? (
            <div className="h-64 flex items-center justify-center cyber-glass rounded-[3rem] border border-primary/20">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent shadow-[0_0_20px_rgba(0,85,255,0.5)]" />
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="cyber-glass rounded-[3rem] p-16 text-center border-2 border-dashed border-primary/40 shadow-2xl max-w-3xl mx-auto"
            >
              <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 text-primary shadow-[0_0_30px_rgba(0,85,255,0.3)] animate-pulse">
                <BookOpen className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-headline font-black text-on-surface dark:text-white mb-3">
                No Enrolled Courses
              </h3>
              <p className="text-on-surface-variant max-w-md mx-auto mb-10 font-medium text-base leading-relaxed">
                You have not enrolled in any courses yet. Explore our high-quality courses to start learning.
              </p>
              <Link
                to="/catalog"
                className="px-10 py-5 signature-gradient text-white rounded-2xl font-headline font-extrabold text-lg shadow-[0_0_35px_rgba(0,85,255,0.5)] hover:scale-105 transition-all inline-flex items-center gap-3 group"
              >
                <span>Browse Courses</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
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
                    whileHover={{ y: -6 }}
                    className="hi-tech-panel rounded-3xl sm:rounded-[3rem] overflow-hidden border border-primary/30 hover:border-primary shadow-xl hover:shadow-[0_15px_40px_rgba(0,85,255,0.3)] transition-all duration-500 group flex flex-col sm:flex-row h-full relative"
                  >
                    <div className="w-full sm:w-56 h-56 sm:h-auto shrink-0 relative overflow-hidden">
                      <img
                        src={
                          course.imageUrl ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&q=100"
                        }
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out filter brightness-90"
                        alt={course.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-surface via-transparent to-transparent opacity-90" />

                      {progress[course.id] === 100 && (
                        <div className="absolute top-4 left-4 bg-success/90 backdrop-blur text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] border border-white/20 animate-pulse">
                          Completed
                        </div>
                      )}
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-primary/20 text-primary border border-primary/40 px-3.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(0,85,255,0.3)]">
                            {course.category || "Core Systems"}
                          </span>
                          <span className="text-[10px] font-mono font-extrabold text-secondary uppercase tracking-widest bg-surface-container-high/60 px-3 py-1 rounded-full border border-surface-dim/20">
                            {course.level || "Expert"} Level
                          </span>
                        </div>
                        <h3 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white mb-3 leading-snug transition-colors group-hover:text-primary">
                          {course.title}
                        </h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                          {course.description ||
                            "Master the fundamentals and advanced concepts of this subject with hands-on projects."}
                        </p>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-primary/20">
                        <div className="flex justify-between items-center text-[10px] font-mono font-extrabold text-secondary uppercase tracking-[0.2em]">
                          <span>Course Progress</span>
                          <span className="text-primary font-black text-sm drop-shadow-[0_0_10px_rgba(0,85,255,0.5)]">
                            {progress[course.id] || 0}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden p-0.5 border border-primary/20">
                          <div
                            className="h-full bg-gradient-to-r from-primary via-tertiary to-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,85,255,0.8)]"
                            style={{ width: `${progress[course.id] || 0}%` }}
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() =>
                              navigate(`/student/course/${course.id}`)
                            }
                            className="flex-1 py-4 signature-gradient text-white rounded-2xl font-headline font-extrabold text-sm shadow-[0_0_25px_rgba(0,85,255,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2.5 active:scale-95 tracking-wider"
                          >
                            <span>
                              {progress[course.id] === 100
                                ? "Watch Lectures Again"
                                : "Resume Course"}
                            </span>
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                          {progress[course.id] < 100 && (
                            <button className="px-5 py-4 cyber-glass border border-primary/30 rounded-2xl hover:bg-primary/20 hover:scale-110 transition-all shadow-md group/spark">
                              <Sparkles className="w-5 h-5 text-primary group-hover/spark:rotate-180 transition-transform duration-500" />
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

        {/* Recommended Protocols */}
        {recommendedCourses.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 cyber-glass rounded-[3rem] p-8 sm:p-12 border border-primary/30 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10 border-b border-primary/20 pb-4">
              <div>
                <h2 className="text-3xl font-headline font-black text-primary flex items-center gap-3">
                  <Flame
                    className="w-8 h-8 animate-bounce text-orange-500"
                    style={{ animationDuration: "2s" }}
                  />
                  <span>Recommended Courses For You</span>
                </h2>
                <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                  Curated courses matching your interests and career goals
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  className="hi-tech-panel rounded-3xl p-8 border border-primary/30 hover:border-primary transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/40 px-3 py-1 rounded-full font-mono text-[10px] font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>High Priority</span>
                      </span>
                      <span className="text-[10px] font-mono text-secondary uppercase tracking-widest">
                        Course
                      </span>
                    </div>
                    <h3 className="font-headline font-extrabold text-xl text-on-surface dark:text-white mb-3 group-hover:text-primary transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs font-mono text-secondary mb-6 tracking-wide">
                      Instructor:{" "}
                      <span className="text-on-surface font-bold">
                        {course.instructor || "Lead Mentor"}
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="py-3.5 cyber-glass border border-primary/30 text-primary font-mono font-bold text-xs flex items-center justify-center gap-2 rounded-2xl hover:bg-primary/20 hover:scale-105 transition-all shadow-md tracking-widest uppercase"
                  >
                    <span>View Course</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  );
}
