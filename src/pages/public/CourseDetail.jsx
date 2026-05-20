import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Play,
  Clock,
  BarChart,
  Shield,
  Globe,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Star,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Video,
  FileText,
  ThumbsUp,
  Share2,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { StorageService } from "../../services/storage";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ALL HOOKS MUST BE AT THE TOP
  // Try to get initial data from cache synchronously to avoid flicker
  const initialCourse = React.useMemo(() => {
    const courseId = id;
    // Accessing internal cache is tricky, but getCourseById is async.
    // However, if we just set loading to true, it will always show loader.
    return null;
  }, [id]);

  const [course, setCourse] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("curriculum");
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [enrolling, setEnrolling] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState("3months");
  const [useCoins, setUseCoins] = React.useState(false);

  // Fetch course data
  React.useEffect(() => {
    const fetchCourse = async () => {
      const courseId = id;

      // Check cache first to potentially skip loading state
      const cachedCourse = await StorageService.getCourseById(courseId);
      if (cachedCourse) {
        setCourse(cachedCourse);
        setLoading(false); // Data is ready, show it!

        // Background updates for dynamic data
        const [enrolled, bookmarked] = await Promise.all([
          StorageService.isEnrolled(courseId),
          StorageService.isBookmarked(courseId),
        ]);
        setIsEnrolled(enrolled);
        setIsBookmarked(bookmarked);
      } else {
        setLoading(true);
        try {
          const data = await StorageService.getCourseById(courseId);
          if (data) {
            setCourse(data);
            const enrolled = await StorageService.isEnrolled(courseId);
            setIsEnrolled(enrolled);
            setIsBookmarked(StorageService.isBookmarked(courseId));
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCourse();
  }, [id]);

  // Real-time Supabase feedback state
  const [courseFeedbacks, setCourseFeedbacks] = React.useState([]);

  React.useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.feedbacks.getAll();
        if (res?.success && res.data) {
          setCourseFeedbacks(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch course feedbacks:", err);
      }
    };
    fetchFeedback();
  }, [id]);

  // PRICING CALCULATIONS
  const user = StorageService.getUser();
  const hasDiscount = user && user.availableDiscounts > 0;
  const userCoins = StorageService.getCoins();

  const planMap = {
    "1month": { name: "1 Month", days: 30 },
    "3months": { name: "3 Months", days: 90 },
    "4months": { name: "4 Months", days: 120 },
    "5months": { name: "5 Months", days: 150 },
    "6months": { name: "6 Months", days: 180 },
  };

  const allowedPlanId = course?.allowed_plan || "1month";
  const planInfo = planMap[allowedPlanId] || planMap["1month"];
  const originalPrice = course?.prices
    ? course.prices[allowedPlanId]
    : course?.price_1month || course?.price || 599;
  const discountPrice = hasDiscount
    ? Math.round(originalPrice * 0.9)
    : originalPrice;

  const coinsToUse = useCoins ? Math.min(userCoins, discountPrice) : 0;
  const finalPrice = discountPrice - coinsToUse;

  // HANDLE FUNCTIONS
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleEnroll = async () => {
    const auth = StorageService.getAuthState();
    if (!auth.isAuthenticated) {
      navigate("/auth");
      return;
    }

    setEnrolling(true);
    try {
      const result = await StorageService.enroll(
        id,
        selectedPlan,
        finalPrice,
        coinsToUse,
      );
      if (result.success) {
        setIsEnrolled(true);
        toast.success("Successfully enrolled in the course!", {
          duration: 5000,
        });
        StorageService.getAuthState();
      } else if (result.message === "cancelled") {
        // User closed Razorpay — do nothing, just reset button
      } else if (
        result.message ===
        "You already have an active subscription for this course"
      ) {
        setIsEnrolled(true);
        toast.success("You already have access to this course!", {
          duration: 5000,
        });
      } else {
        toast.error(result.message || "Enrollment failed. Please try again.", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Network error. Please try again.", { duration: 5000 });
    } finally {
      setEnrolling(false);
    }
  };

  const handleBookmark = () => {
    StorageService.toggleFavorite(id);
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from wishlist" : "Saved to wishlist");
  };

  const handlePlaceholder = (feature) => {
    toast.info(`${feature} feature coming soon!`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  React.useEffect(() => {
    if (course) {
      setSelectedPlan(course.allowed_plan || "1month");
    }
  }, [course]);

  // EARLY RETURNS
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">
          Course Not Found
        </h1>
        <p className="text-secondary max-w-sm mx-auto mb-8 font-medium">
          The requested course could not be found in our catalog.
        </p>
        <Link
          to="/catalog"
          className="px-8 py-3 signature-gradient text-white rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Browse All Courses
        </Link>
      </div>
    );
  }

  const modules = course?.modules || [
    {
      id: 1,
      title: "Foundation & Core Concepts",
      duration: "2.5 hours",
      lessons: 6,
    },
    {
      id: 2,
      title: "Advanced Implementation",
      duration: "4 hours",
      lessons: 8,
    },
    {
      id: 3,
      title: "Practical Labs & Case Studies",
      duration: "3.5 hours",
      lessons: 5,
    },
    { id: 4, title: "Capstone Project", duration: "5 hours", lessons: 4 },
  ];

  const stats = [
    {
      label: "Duration",
      value: `${course?.durationHours || 20} hours`,
      icon: Clock,
    },
    { label: "Level", value: course?.level || "Intermediate", icon: BarChart },
    {
      label: "Students",
      value: course?.studentsCount || "2,500+",
      icon: Users,
    },
    { label: "Lessons", value: course?.lessonsCount || "24", icon: Video },
  ];

  return (
    <main className="min-h-screen bg-surface relative overflow-hidden">
      {/* Subtle Cyber Grid Background Overlay */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />

      {/* Hero Dossier Banner */}
      <section className="relative h-[550px] lg:h-[650px] overflow-hidden border-b border-primary/20">
        <img
          src={
            course.image ||
            course.thumbnail ||
            course.imageUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&fit=crop&q=100"
          }
          className="w-full h-full object-cover scale-105 filter brightness-90 animate-pulse-glow"
          style={{ animationDuration: "12s" }}
          alt={course.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />

        <div className="absolute bottom-0 left-0 right-0 pb-16 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-primary cyber-glass px-4 py-2 rounded-full font-mono font-bold text-xs hover:bg-primary/20 transition-all mb-8 shadow-[0_0_15px_rgba(0,85,255,0.3)] group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
              <span>Back to Course Catalog</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-primary/20 backdrop-blur-xl text-primary px-4 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest border border-primary/40 shadow-[0_0_20px_rgba(0,85,255,0.3)]">
                {course.category || "General Course"}
              </span>
              <span
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest border ${course.course_type === "mini" ? "bg-warning/20 text-warning border-warning/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-tertiary/20 text-tertiary border-tertiary/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]"}`}
              >
                {course.course_type === "mini"
                  ? "Short Course"
                  : "Full Course"}
              </span>
              <span className="flex items-center gap-1.5 cyber-glass px-3 py-1 rounded-full text-primary font-mono font-extrabold text-xs tracking-wider border border-primary/30">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-spin-slow" />
                <span>
                  {course.rating || "4.9"} ({course.reviewCount || "2.4k"}{" "}
                  Student Reviews)
                </span>
              </span>
              {isBookmarked && (
                <span className="bg-amber-400/20 text-amber-400 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-mono font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse">
                  Wishlist Saved
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-headline font-black text-on-surface dark:text-white mb-6 tracking-tighter leading-[1.05] max-w-4xl drop-shadow-[0_0_30px_rgba(0,85,255,0.5)]">
              {course.title}
            </h1>
            <p className="text-lg sm:text-xl text-on-surface-variant leading-relaxed font-medium max-w-3xl cyber-glass p-6 rounded-3xl border border-primary/20 shadow-xl">
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Cybernetic Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="cyber-glass p-5 rounded-3xl border border-primary/20 relative overflow-hidden group hover:border-primary transition-all shadow-lg"
                >
                  <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <stat.icon className="w-6 h-6 text-primary mb-3 animate-pulse" />
                  <p className="text-[10px] font-mono font-bold text-secondary uppercase tracking-[0.2em] mb-1">
                    {stat.label}
                  </p>
                  <p className="text-primary font-headline font-black text-2xl tracking-tight">
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-primary/20">
              <div className="flex gap-8">
                {["curriculum", "instructor", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-mono font-extrabold uppercase tracking-[0.2em] transition-all relative ${
                      activeTab === tab
                        ? "text-primary tracking-widest scale-105"
                        : "text-secondary hover:text-primary"
                    }`}
                  >
                    {tab === "curriculum"
                      ? "Curriculum"
                      : tab === "instructor"
                        ? "Instructor Profile"
                        : "Student Reviews"}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_15px_rgba(0,85,255,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-headline font-extrabold text-primary flex items-center gap-3">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                    <span>Syllabus & Curriculum</span>
                  </h2>
                  <span className="text-xs font-mono font-bold text-secondary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Course Modules
                  </span>
                </div>

                <div className="space-y-4">
                  {modules.map((module, idx) => (
                    <div
                      key={module.id}
                      onClick={() => {
                        if (isEnrolled) {
                          navigate(`/student/course/${id}`);
                        } else {
                          toast.error(
                            "Please enroll to access course modules.",
                            { duration: 5000 },
                          );
                        }
                      }}
                      className="hi-tech-panel rounded-3xl p-6 cursor-pointer group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-black text-lg group-hover:bg-primary group-hover:text-on-primary group-hover:rotate-12 transition-all duration-300 shadow-[0_0_15px_rgba(0,85,255,0.3)]">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-headline font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug mb-1.5">
                              {module.title}
                            </h3>
                            <div className="flex items-center gap-4 text-xs font-mono font-bold text-secondary">
                              <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                <Clock className="w-3.5 h-3.5 text-primary" />{" "}
                                {module.duration}
                              </span>
                              <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                <FileText className="w-3.5 h-3.5 text-primary" />{" "}
                                {Array.isArray(module.lessons)
                                  ? module.lessons.length
                                  : module.lessons || 0}{" "}
                                lessons
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full cyber-glass flex items-center justify-center text-secondary group-hover:text-primary group-hover:scale-110 transition-all border border-primary/20 shadow-md">
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What You'll Learn */}
                <div className="cyber-glass-glow rounded-[3rem] p-10 border border-primary/30 mt-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                  <h3 className="text-2xl font-headline font-extrabold text-primary mb-8 flex items-center gap-3">
                    <CheckCircle2 className="w-7 h-7 text-success animate-pulse" />
                    <span>What You Will Learn</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      "Master industry-standard frameworks and best practices",
                      "Execute practical labs under expert guidance",
                      "Optimize workflows for enterprise scale",
                      "Produce professional-grade deliverables",
                      "Build a portfolio of real-world projects",
                      "Earn a verifiable certificate of completion",
                    ].map((outcome, i) => (
                      <div
                        key={i}
                        className="flex gap-4 items-start cyber-glass p-4 rounded-2xl border border-primary/20"
                      >
                        <span className="w-6 h-6 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-success shrink-0 font-mono font-bold text-xs mt-0.5">
                          ✓
                        </span>
                        <span className="text-on-surface font-medium text-base leading-relaxed">
                          {outcome}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Instructor Tab */}
            {activeTab === "instructor" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-8 p-8 hi-tech-panel rounded-[3rem]">
                  <div className="relative">
                    <img
                      src={`https://i.pravatar.cc/150?u=${course.instructor}`}
                      className="w-32 h-32 rounded-3xl object-cover shadow-[0_0_30px_rgba(0,85,255,0.4)] border-2 border-primary/40 shrink-0"
                      alt={course.instructor}
                    />
                    <div className="absolute -bottom-3 -right-3 bg-success text-on-success px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase shadow-lg">
                      Verified
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-headline font-black text-primary leading-tight">
                      {course.instructor}
                    </h2>
                    <p className="text-xs font-mono font-bold text-secondary uppercase tracking-widest">
                      Lead Instructor & Mentor
                    </p>
                    <p className="text-on-surface-variant leading-relaxed text-base font-medium">
                      {course.instructorBio ||
                        "A seasoned professional with over 15 years of experience in the industry, specializing in cutting-edge technologies and methodologies. Has trained thousands of students worldwide and helped them accelerate their careers."}
                    </p>
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-primary/20 font-mono text-sm font-extrabold">
                      <div className="flex items-center gap-2 text-amber-400">
                        <Star className="w-5 h-5 fill-current animate-spin-slow" />
                        <span>4.9 Rating (2,500+ Student Reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary">
                        <Users className="w-5 h-5" />
                        <span>15,000+ Enrolled Learners</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center cyber-glass p-6 rounded-3xl border border-primary/20 shadow-xl">
                  <div>
                    <h2 className="text-2xl font-headline font-extrabold text-primary">
                      Student Reviews & Feedback
                    </h2>
                    <p className="text-xs font-mono text-secondary mt-1 tracking-wider uppercase">
                      Unedited feedback from enrolled students
                    </p>
                  </div>
                  <button
                    onClick={() => handlePlaceholder("Review writing")}
                    className="px-6 py-3 signature-gradient text-white rounded-2xl text-xs font-mono font-bold tracking-widest uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,85,255,0.4)] flex items-center gap-2"
                  >
                    <span>Submit Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {courseFeedbacks.length > 0 ? (
                    courseFeedbacks.map((review) => (
                      <div
                        key={review.id}
                        className="hi-tech-panel p-8 rounded-3xl relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                review.avatar ||
                                review.user?.avatar ||
                                `https://i.pravatar.cc/100?u=${review.id}`
                              }
                              className="w-12 h-12 rounded-2xl object-cover border border-primary/40 shadow-lg"
                              alt={
                                review.name || review.user?.name || "Student"
                              }
                            />
                            <div>
                              <p className="font-headline font-extrabold text-primary text-lg">
                                {review.name ||
                                  review.user?.name ||
                                  "Verified Student"}
                              </p>
                              <p className="text-xs font-mono font-bold text-secondary uppercase tracking-widest">
                                {review.role ||
                                  review.user?.role ||
                                  "Verified Student"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 cyber-glass px-3 py-1.5 rounded-full border border-amber-400/30 shadow-md">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < (review.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-on-surface text-base leading-relaxed mb-6 font-medium italic">
                          "{review.comment || review.content}"
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-primary/20 font-mono text-xs font-bold text-secondary">
                          <button
                            onClick={() =>
                              handlePlaceholder("Review helpfulness voting")
                            }
                            className="flex items-center gap-2 cyber-glass px-4 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/20 transition-all shadow-md"
                          >
                            <ThumbsUp className="w-4 h-4" />{" "}
                            <span>Helpful</span>
                          </button>
                          <span>
                            Submitted on{" "}
                            {new Date(
                              review.created_at || Date.now(),
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-secondary font-mono text-xs bg-surface-container-low/20 rounded-2xl border border-surface-dim/10">
                      No student reviews recorded yet for this course.
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handlePlaceholder("Review pagination")}
                  className="w-full py-4 text-primary cyber-glass border border-primary/30 rounded-2xl font-mono font-bold text-sm tracking-widest uppercase hover:bg-primary/20 transition-all shadow-lg"
                >
                  <span>View All Reviews</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Terminal Enrollment Chassis */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="cyber-glass-glow rounded-[3rem] p-8 border border-primary/40 shadow-[0_0_50px_rgba(0,85,255,0.2)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

                {isEnrolled ? (
                  <>
                    <div className="mb-8 text-center">
                      <div className="w-20 h-20 bg-success/20 border border-success/40 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                        <CheckCircle2
                          className="w-10 h-10 text-success animate-bounce"
                          style={{ animationDuration: "3s" }}
                        />
                      </div>
                      <h3 className="text-2xl font-headline font-black text-on-surface dark:text-white mb-2">
                        Course Unlocked!
                      </h3>
                      <p className="text-secondary text-sm font-mono tracking-wider uppercase font-bold">
                        Course Access Granted
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/student/course/${id}`)}
                      className="w-full py-5 rounded-2xl signature-gradient text-white font-headline font-extrabold text-lg hover:scale-105 transition-all shadow-[0_0_35px_rgba(0,85,255,0.6)] flex items-center justify-center gap-3 active:scale-95"
                    >
                      <span>Go to Course Player</span>
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-extrabold text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                          <span>Course Access Plan</span>
                        </span>
                        <span className="text-[10px] font-mono font-extrabold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full uppercase">
                          Placement Support
                        </span>
                      </div>

                      <div className="w-full p-6 rounded-3xl border-2 border-primary/60 bg-surface-container-lowest/90 text-left shadow-2xl relative overflow-hidden group hover:border-primary transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-2xl font-headline font-black text-on-surface dark:text-white leading-none">
                              {planInfo.name}
                            </p>
                            <p className="text-xs font-mono font-bold text-secondary mt-1">
                              {planInfo.days} Days Access
                            </p>
                          </div>
                          <div className="text-right">
                            {hasDiscount && (
                              <div className="text-xs font-mono text-secondary line-through mb-0.5">
                                ₹{originalPrice}
                              </div>
                            )}
                            <div className="text-3xl font-headline font-black text-primary drop-shadow-[0_0_15px_rgba(0,85,255,0.6)]">
                              ₹{finalPrice}
                            </div>
                          </div>
                        </div>

                        {hasDiscount && (
                          <div className="mt-2 text-xs font-mono font-bold text-success bg-success/20 border border-success/40 px-3 py-1 rounded-xl inline-block shadow-md">
                            10% Referral Discount Active
                          </div>
                        )}

                        {userCoins > 0 && (
                          <div className="mt-6 pt-4 border-t border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center text-xs font-extrabold font-mono shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                C
                              </span>
                              <span className="text-xs font-mono font-bold text-primary">
                                Apply Coins (Balance: {userCoins})
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={useCoins}
                                onChange={() => setUseCoins(!useCoins)}
                              />
                              <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400 shadow-inner" />
                            </label>
                          </div>
                        )}

                        {useCoins && coinsToUse > 0 && (
                          <div className="mt-3 text-xs font-mono font-bold text-warning bg-warning/20 border border-warning/40 px-3 py-1 rounded-xl inline-block shadow-md">
                            -{coinsToUse} Coins Credit Applied
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-5 rounded-2xl signature-gradient text-white font-headline font-extrabold text-lg hover:scale-105 transition-all shadow-[0_0_35px_rgba(0,85,255,0.6)] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 tracking-wide"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="sr-only animate-spin" /> {/* keep hook style or simple loading */}
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Processing Enrolment...</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll Now (₹{finalPrice})</span>
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>

                    <div className="mt-8 pt-6 border-t border-primary/20 space-y-4">
                      <div className="flex items-center gap-3.5 text-sm font-medium text-on-surface cyber-glass p-3 rounded-2xl border border-primary/10">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                        <span>30-Day Money-Back Guarantee</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-sm font-medium text-on-surface cyber-glass p-3 rounded-2xl border border-primary/10">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span>Cloud-Synchronized Access</span>
                      </div>
                      <div className="flex items-center gap-3.5 text-sm font-medium text-on-surface cyber-glass p-3 rounded-2xl border border-primary/10">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <span>Industry Recognized Certificate</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleBookmark}
                  className="w-full mt-6 py-4 rounded-2xl cyber-glass border border-primary/30 text-primary font-mono font-bold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2.5 shadow-lg"
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary scale-110" : ""}`}
                  />
                  <span>
                    {isBookmarked ? "Wishlist Saved" : "Save to Wishlist"}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full mt-3 py-3 text-secondary font-mono font-bold text-xs flex items-center justify-center gap-2 hover:text-primary transition-colors tracking-widest uppercase"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Copy Course Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
