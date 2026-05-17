import * as React from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
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
  Bookmark
} from "lucide-react"
import { StorageService } from "../../services/storage"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // ALL HOOKS MUST BE AT THE TOP
  // Try to get initial data from cache synchronously to avoid flicker
  const initialCourse = React.useMemo(() => {
    const courseId = parseInt(id)
    // Accessing internal cache is tricky, but getCourseById is async.
    // However, if we just set loading to true, it will always show loader.
    return null
  }, [id])

  const [course, setCourse] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isEnrolled, setIsEnrolled] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("curriculum")
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  const [enrolling, setEnrolling] = React.useState(false)
  const [selectedPlan, setSelectedPlan] = React.useState('3months')
  const [useCoins, setUseCoins] = React.useState(false)

  // Fetch course data
  React.useEffect(() => {
    const fetchCourse = async () => {
      const courseId = parseInt(id)

      // Check cache first to potentially skip loading state
      const cachedCourse = await StorageService.getCourseById(courseId)
      if (cachedCourse) {
        setCourse(cachedCourse)
        setLoading(false) // Data is ready, show it!

        // Background updates for dynamic data
        const [enrolled, bookmarked] = await Promise.all([
          StorageService.isEnrolled(courseId),
          StorageService.isBookmarked(courseId)
        ])
        setIsEnrolled(enrolled)
        setIsBookmarked(bookmarked)
        
        // Background refresh to ensure data is up to date (e.g. price changes)
        try {
          const freshCourse = await StorageService.getCourseById(courseId, true)
          if (freshCourse && JSON.stringify(freshCourse) !== JSON.stringify(cachedCourse)) {
            setCourse(freshCourse)
          }
        } catch (error) {
          console.error('Error in background refresh:', error)
        }
      } else {
        setLoading(true)
        try {
          const data = await StorageService.getCourseById(courseId, true)
          if (data) {
            setCourse(data)
            const enrolled = await StorageService.isEnrolled(courseId)
            setIsEnrolled(enrolled)
            setIsBookmarked(StorageService.isBookmarked(courseId))
          }
        } catch (error) {
          console.error('Error fetching course:', error)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchCourse()
  }, [id])

  // PRICING CALCULATIONS
  const user = StorageService.getUser()
  const hasDiscount = user && user.availableDiscounts > 0
  const userCoins = StorageService.getCoins()

  const planMap = {
    '1month': { name: '1 Month', days: 30 },
    '3months': { name: '3 Months', days: 90 },
    '6months': { name: '6 Months', days: 180 }
  }

  const allowedPlanId = course?.allowed_plan || '1month'
  const planInfo = planMap[allowedPlanId] || planMap['1month']
  
  // Use the mapped price which already accounts for the allowed plan
  const basePrice = course?.price || (course?.[`price_${allowedPlanId}`]) || 599
  const originalPrice = basePrice
  const discountPrice = hasDiscount ? Math.round(originalPrice * 0.9) : originalPrice


  
  const coinsToUse = useCoins ? Math.min(userCoins, discountPrice) : 0
  const finalPrice = discountPrice - coinsToUse

  // HANDLE FUNCTIONS
  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId)
  }

  const handleEnroll = async () => {
    const auth = StorageService.getAuthState()
    if (!auth.isAuthenticated) {
      navigate("/auth")
      return
    }

    setEnrolling(true)
    try {
      const result = await StorageService.enroll(parseInt(id), selectedPlan, finalPrice, coinsToUse)
      if (result.success) {
        setIsEnrolled(true)
        toast.success('Successfully enrolled in the course!', { duration: 5000 })
        StorageService.getAuthState()
      } else if (result.message === 'cancelled') {
        // User closed Razorpay — do nothing, just reset button
      } else if (result.message === 'You already have an active subscription for this course') {
        setIsEnrolled(true)
        toast.success('You already have access to this course!', { duration: 5000 })
      } else {
        toast.error(result.message || 'Enrollment failed. Please try again.', { duration: 5000 })
      }
    } catch (error) {
      console.error('Enrollment error:', error)
      toast.error('Network error. Please try again.', { duration: 5000 })
    } finally {
      setEnrolling(false)
    }
  }

  const handleBookmark = () => {
    StorageService.toggleFavorite(parseInt(id))
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from wishlist" : "Saved to wishlist")
  }

  const handlePlaceholder = (feature) => {
    toast.info(`${feature} feature coming soon!`)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  React.useEffect(() => {
    if (course) {
      setSelectedPlan(course.allowed_plan || '1month')
    }
  }, [course])

  // EARLY RETURNS
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <BookOpen className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Course Not Found</h1>
        <p className="text-secondary max-w-sm mx-auto mb-8 font-medium">
          The requested course could not be found in our catalog.
        </p>
        <Link to="/catalog" className="px-8 py-3 signature-gradient text-white rounded-xl font-bold hover:scale-105 transition-transform">
          Browse All Courses
        </Link>
      </div>
    )
  }



  const modules = course?.modules || [
    { id: 1, title: "Foundation & Core Concepts", duration: "2.5 hours", lessons: 6 },
    { id: 2, title: "Advanced Implementation", duration: "4 hours", lessons: 8 },
    { id: 3, title: "Practical Labs & Case Studies", duration: "3.5 hours", lessons: 5 },
    { id: 4, title: "Capstone Project", duration: "5 hours", lessons: 4 },
  ]

  const stats = [
    { label: "Duration", value: `${course?.durationHours || 20} hours`, icon: Clock },
    { label: "Level", value: course?.level || "Intermediate", icon: BarChart },
    { label: "Students", value: course?.studentsCount || "2,500+", icon: Users },
    { label: "Lessons", value: course?.lessonsCount || "24", icon: Video },
  ]

  return (
    <main className="min-h-screen bg-surface">
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
        <img
          src={course.image || course.thumbnail || course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&fit=crop&q=100"}
          className="w-full h-full object-cover scale-105"
          alt={course.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 pb-16">
          <div className="max-w-7xl mx-auto px-8">
            <Link to="/catalog" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-bold text-sm mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Catalog
            </Link>

            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-primary/10 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                {course.category || "Professional Development"}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${course.course_type === 'mini' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                {course.course_type === 'mini' ? 'Mini Course' : 'Mega Course'}
              </span>
              <span className="flex items-center gap-1.5 text-primary font-bold text-sm">
                <Star className="w-4 h-4 fill-current" />
                {course.rating || "4.9"} ({course.reviewCount || "2.4k"} reviews)
              </span>
              {isBookmarked && (
                <span className="bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
                  Saved
                </span>
              )}
            </div>

            <h1 className="text-4xl lg:text-6xl font-headline font-extrabold text-primary mb-4 tracking-tighter leading-[1.1] max-w-3xl">
              {course.title}
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed font-medium max-w-2xl">
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-dim/20"
                >
                  <stat.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-0.5">{stat.label}</p>
                  <p className="text-primary font-headline font-bold text-sm">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-surface-dim/20">
              <div className="flex gap-6">
                {["curriculum", "instructor", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === tab
                        ? "text-primary border-b-2 border-primary"
                        : "text-secondary hover:text-primary"
                      }`}
                  >
                    {tab === "curriculum" ? "Curriculum" : tab === "instructor" ? "Instructor" : "Reviews"}
                  </button>
                ))}
              </div>
            </div>

            {/* Curriculum Tab */}
            {activeTab === "curriculum" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-headline font-bold text-primary">Course Modules</h2>
                <div className="space-y-3">
                  {modules.map((module, idx) => (
                    <div 
                      key={module.id} 
                      onClick={() => {
                        if (isEnrolled) {
                          navigate(`/student/course/${id}`)
                        } else {
                          toast.error('Please enroll to access course modules.', { duration: 5000 })
                        }
                      }}
                      className="bg-surface-container-lowest rounded-2xl border border-surface-dim/20 overflow-hidden cursor-pointer hover:border-primary/50 transition-all group"
                    >
                      <div className="p-5 flex justify-between items-center hover:bg-surface-container-high/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover/module:bg-primary group-hover/module:text-on-primary transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-headline font-bold text-on-surface group-hover/module:text-primary transition-colors">{module.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {module.duration}
                              </span>
                              <span className="text-xs text-secondary flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {Array.isArray(module.lessons) ? module.lessons.length : (module.lessons || 0)} lessons
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* What You'll Learn */}
                <div className="bg-primary/5 rounded-3xl p-8 mt-8">
                  <h3 className="text-xl font-headline font-bold text-primary mb-6">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Master industry-standard frameworks and best practices",
                      "Execute practical labs under expert guidance",
                      "Optimize workflows for enterprise scale",
                      "Produce professional-grade deliverables",
                      "Build a portfolio of real-world projects",
                      "Earn a verifiable certificate of completion"
                    ].map((outcome, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-on-surface-variant text-sm">{outcome}</span>
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
                <div className="flex flex-col sm:flex-row gap-6 p-6 bg-surface-container-lowest rounded-3xl border border-surface-dim/20">
                  <img
                    src={`https://i.pravatar.cc/150?u=${course.instructor}`}
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                    alt={course.instructor}
                  />
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-primary mb-2">{course.instructor}</h2>
                    <p className="text-secondary text-sm mb-4">Lead Instructor & Industry Expert</p>
                    <p className="text-on-surface-variant leading-relaxed">
                      {course.instructorBio || "A seasoned professional with over 15 years of experience in the industry, specializing in cutting-edge technologies and methodologies. Has trained thousands of students worldwide and helped them accelerate their careers."}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">4.9</span>
                        <span className="text-xs text-secondary">(2,500+ ratings)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm">15,000+ students</span>
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
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-headline font-bold text-primary">Student Reviews</h2>
                  <button onClick={() => handlePlaceholder("Review writing")} className="text-primary text-sm font-medium flex items-center gap-1">
                    Write a Review <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 1, name: "Sarah Chen", role: "CTO", rating: 5, comment: "Excellent course! The curriculum is well-structured and the instructor is highly knowledgeable.", date: "2 weeks ago", avatar: "https://i.pravatar.cc/100?img=1" },
                    { id: 2, name: "Michael Rodriguez", role: "Lead Architect", rating: 5, comment: "This course transformed my approach to system design. Highly recommended!", date: "1 month ago", avatar: "https://i.pravatar.cc/100?img=2" },
                  ].map((review) => (
                    <div key={review.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-dim/20">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <img src={review.avatar} className="w-10 h-10 rounded-full object-cover" alt={review.name} />
                          <div>
                            <p className="font-bold text-on-surface">{review.name}</p>
                            <p className="text-xs text-secondary">{review.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed mb-2">{review.comment}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handlePlaceholder("Review helpfulness voting")} className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition">
                          <ThumbsUp className="w-3 h-3" /> Helpful
                        </button>
                        <span className="text-xs text-secondary">{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => handlePlaceholder("Review pagination")} className="w-full py-3 text-primary border border-primary/30 rounded-xl font-medium hover:bg-primary/5 transition">
                  Load More Reviews
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Enrollment Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-dim/20 shadow-xl">
                {isEnrolled ? (
                  <>
                    <div className="mb-6 text-center">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-headline font-bold text-primary mb-2">You're Enrolled!</h3>
                      <p className="text-secondary text-sm">You have access to this course.</p>
                    </div>
                    <button
                      onClick={() => navigate(`/student/course/${id}`)}
                      className="w-full py-4 rounded-2xl bg-primary text-on-primary font-headline font-bold text-base hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Continue Learning
                      <Play className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] block mb-2">Selected Plan</span>
                      <div className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 text-left">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-headline font-bold text-primary">{planInfo.name}</p>
                            <p className="text-xs text-secondary">{planInfo.days} days access</p>
                          </div>
                          <div className="text-right">
                             {hasDiscount && <div className="text-xs text-secondary line-through">₹{originalPrice}</div>}
                             <div className="text-2xl font-headline font-bold text-primary">₹{finalPrice}</div>
                          </div>
                        </div>
                        {hasDiscount && (
                          <div className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded inline-block">
                            10% Referral Discount Applied
                          </div>
                        )}
                        {userCoins > 0 && (
                          <div className="mt-4 pt-3 border-t border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">C</span>
                              <span className="text-xs font-bold text-primary">Use Coins (Balance: {userCoins})</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={useCoins} onChange={() => setUseCoins(!useCoins)} />
                              <div className="w-9 h-5 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                            </label>
                          </div>
                        )}
                        {useCoins && coinsToUse > 0 && (
                           <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded inline-block">
                             -{coinsToUse} Coins Applied
                           </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-4 rounded-2xl signature-gradient text-white font-headline font-bold text-base hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Enroll Now - ₹{finalPrice}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="mt-6 pt-6 border-t border-surface-dim/20 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <Shield className="w-4 h-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <Globe className="w-4 h-4" />
                        <span>Access from anywhere</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-secondary">
                        <Award className="w-4 h-4" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleBookmark}
                  className="w-full mt-4 py-3 rounded-xl border border-surface-dim/20 text-secondary font-medium hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                  {isBookmarked ? "Saved to Wishlist" : "Save to Wishlist"}
                </button>

                <button onClick={handleShare} className="w-full mt-2 py-3 text-secondary text-sm flex items-center justify-center gap-2 hover:text-primary transition">
                  <Share2 className="w-4 h-4" />
                  Share this course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}