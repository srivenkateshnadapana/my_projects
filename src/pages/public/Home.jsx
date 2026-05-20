// src/pages/public/Home.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Star,
  Brain,
  History,
  Globe,
  Award,
  TrendingUp,
  Users,
  Video,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const [hoveredCard, setHoveredCard] = React.useState(null);
  const heroRef = React.useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Stats data state
  const [stats, setStats] = React.useState([
    { value: "1", label: "Active Learners", icon: Users },
    { value: "1", label: "Chief Mentors", icon: Brain },
    { value: "0", label: "Course Lectures", icon: Video },
    { value: "100%", label: "Placement Support", icon: TrendingUp },
  ]);

  // Testimonials state - Start completely empty to reflect real Supabase state
  const [testimonials, setTestimonials] = React.useState([]);

  React.useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const [statsRes, feedbacksRes] = await Promise.all([
          api.admin.getStats(),
          api.feedbacks.getHome(),
        ]);

        if (statsRes?.success && statsRes.data) {
          setStats([
            {
              value: Math.max(
                1,
                statsRes.data.users?.students || 0,
              ).toLocaleString(),
              label: "Active Learners",
              icon: Users,
            },
            { value: "1", label: "Chief Mentors", icon: Brain },
            {
              value: (statsRes.data.content?.courses || 0).toString(),
              label: "Course Lectures",
              icon: Video,
            },
            { value: "100%", label: "Placement Support", icon: TrendingUp },
          ]);
        }

        if (feedbacksRes?.success && feedbacksRes.data) {
          setTestimonials(feedbacksRes.data);
        }
      } catch (err) {
        console.error("Failed to load real-time data:", err);
      }
    };
    fetchRealtimeData();
  }, []);

  const currentUser = StorageService.getUser();
  const leaderName =
    currentUser?.full_name || currentUser?.name || "Sri Venkatesh Nadapana";

  // Courses state
  const [featuredCourses, setFeaturedCourses] = React.useState([]);
  const [coursesLoading, setCoursesLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await StorageService.getCourses();
        const randomized = [...data].sort(() => 0.5 - Math.random());
        setFeaturedCourses(randomized.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-surface text-on-surface relative overflow-hidden font-body">
      {/* Subtle Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none" />

      {/* Hero Section with Futuristic Glow & Floating Elements */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={isHeroInView ? "visible" : "hidden"}
        variants={fadeUp}
        className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-8 lg:pt-32 lg:pb-28"
      >
        {/* Background Ambience Orbs */}
        <div className="absolute top-1/4 right-10 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-tertiary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full cyber-glass border border-primary/40 shadow-[0_0_20px_rgba(0,85,255,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-xs font-bold font-mono text-primary tracking-wider uppercase">
                Next-Gen Advanced EdTech Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-headline font-black tracking-tighter leading-[1.05]"
            >
              Master The <br />
              <span className="hologram-text font-extrabold pb-2 inline-block">
                Future of Tech.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-on-surface-variant font-medium max-w-xl leading-relaxed"
            >
              Experience a sophisticated, immersive curriculum structured for
              modern developers. Built on cutting-edge practice sandboxes
              and expert mentoring.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-5 pt-4"
            >
              <Link
                to="/catalog"
                className="px-10 py-5 signature-gradient text-white font-headline font-extrabold rounded-2xl hover:scale-105 transition-all shadow-[0_0_35px_rgba(0,85,255,0.6)] flex items-center justify-center gap-3 group text-lg tracking-wide"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/verify-certificate"
                className="px-8 py-5 cyber-glass text-primary rounded-2xl font-bold hover:bg-primary/10 hover:border-primary transition-all flex items-center justify-center gap-2 group text-base"
              >
                <ShieldCheck className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span>Verify Certificate</span>
              </Link>
            </motion.div>

            {/* Futuristic Stats Chassis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-primary/20"
            >
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="cyber-glass p-4 rounded-2xl border border-primary/20 relative group hover:border-primary transition-colors"
                >
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary font-headline tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-bold font-mono text-secondary uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Holographic Image Portal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden cyber-glass p-3 shadow-[0_0_50px_rgba(0,85,255,0.3)] border border-primary/40 animate-float">
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5]">
                <img
                  alt="Scholars at Work"
                  className="w-full h-full object-cover scale-105"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop&q=100"
                  fetchpriority="high"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                {/* Floating Hologram HUD Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-6 cyber-glass-glow rounded-2xl flex justify-between items-center shadow-2xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                      <span className="text-[10px] font-mono font-bold text-success uppercase tracking-widest">
                        Course Active
                      </span>
                    </div>
                    <p className="text-3xl font-headline font-black text-on-surface dark:text-white leading-none">
                      100%
                    </p>
                    <p className="text-[10px] font-bold font-mono text-secondary uppercase tracking-[0.2em] mt-1">
                      Platform Uptime
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl signature-gradient flex items-center justify-center shadow-[0_0_20px_rgba(0,85,255,0.8)] text-white">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Auxiliary Floating Orbs */}
            <div
              className="absolute -top-6 -right-6 cyber-glass px-4 py-2.5 rounded-2xl border border-tertiary/40 shadow-xl flex items-center gap-2.5 animate-bounce"
              style={{ animationDuration: "8s" }}
            >
              <Brain className="w-5 h-5 text-tertiary" />
              <span className="text-xs font-bold font-mono text-on-surface">
                AI Mentor Engine
              </span>
            </div>
            <div
              className="absolute -bottom-6 -left-6 cyber-glass px-4 py-2.5 rounded-2xl border border-primary/40 shadow-xl flex items-center gap-2.5 animate-bounce"
              style={{ animationDuration: "10s" }}
            >
              <Video className="w-5 h-5 text-primary" />
              <span className="text-xs font-bold font-mono text-on-surface">
                Monaco Cloud IDE
              </span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Pathways Section */}
      <section id="courses" className="py-20 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="neon-badge mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Flagship Programs
            </span>
            <h2 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tight mb-4 text-primary">
              Trending Industry Courses
            </h2>
            <p className="text-on-surface-variant text-lg">
              Engineered alongside chief mentors from leading global tech
              corporations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coursesLoading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            ) : featuredCourses.length > 0 ? (
              featuredCourses.map((course, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="hi-tech-panel p-8 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary group-hover:rotate-12 transition-all duration-300 shadow-[0_0_15px_rgba(0,85,255,0.2)]">
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 capitalize tracking-wider">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-2xl font-headline font-extrabold text-on-surface group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm line-clamp-3 mb-6 font-medium">
                      {course.description ||
                        "Immersive hands-on masterclass covering end-to-end architecture and enterprise production readiness."}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-surface-dim/20 flex justify-between items-center text-sm font-bold font-mono">
                    <span className="flex items-center gap-1.5 text-secondary">
                      <Clock className="w-4 h-4 text-primary" />{" "}
                      {course.duration} Hours
                    </span>
                    <Link
                      to={`/course/${course.id}`}
                      className="inline-flex items-center gap-2 text-primary group-hover:gap-3 transition-all"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-secondary font-mono bg-surface-container-low/20 rounded-2xl border border-surface-dim/10">
                No active courses found in catalog.
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl border border-primary/40 text-primary font-headline font-bold text-base hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_25px_rgba(0,85,255,0.3)] transition-all"
            >
              <span>Access Complete Course Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Hi-Tech Bento Grid Features */}
      <section className="py-20 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="neon-badge mb-4">Tactical Advantage</span>
            <h2 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tight mb-4 text-primary">
              The Path to Tech Mastery
            </h2>
            <p className="text-on-surface-variant text-lg font-medium">
              Designed for learners who demand high-end interfaces and
              unmatched curriculum depth.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 hi-tech-panel p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-lg">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-headline font-extrabold mb-4 text-primary">
                  Enterprise Accreditation
                </h3>
                <p className="text-on-surface-variant text-base sm:text-lg max-w-xl leading-relaxed">
                  Our certifications are constructed directly in partnership
                  with enterprise engineering leaders, providing undeniable
                  professional verification on global career registries.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-primary/20 flex items-center gap-3 text-primary font-mono text-sm font-bold">
                <span>Recognized by 500+ global engineering hubs</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="md:col-span-1 signature-gradient p-8 sm:p-12 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,85,255,0.4)] text-white flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <Brain className="w-14 h-14 mb-8 group-hover:rotate-12 transition-transform duration-500" />
              <div>
                <h3 className="text-3xl font-headline font-extrabold mb-3">
                  Expert Mentors
                </h3>
                <p className="text-white/90 font-medium text-base leading-relaxed">
                  Direct guidance from seasoned architects leading deep
                  technical initiatives at FAANG and Fortune 500 firms.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="hi-tech-panel p-8 sm:p-10 flex flex-col justify-between"
            >
              <History className="w-12 h-12 text-primary mb-6" />
              <div>
                <h3 className="text-2xl font-headline font-extrabold mb-3 text-primary">
                  Lifetime Access
                </h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Enroll once, maintain access forever. All future iterative
                  updates and curriculum enhancements included automatically.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="md:col-span-2 hi-tech-panel p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8"
            >
              <div className="space-y-4 max-w-lg">
                <Globe className="w-12 h-12 text-primary" />
                <h3 className="text-2xl font-headline font-extrabold text-primary">
                  Global Student Network
                </h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Join alumni spanning 80+ countries worldwide. Engage in
                  peer code labs and architectural review boards.
                </p>
              </div>
              <div className="cyber-glass p-6 rounded-2xl border border-primary/30 text-center sm:min-w-[200px]">
                <p className="text-4xl font-black font-headline text-primary">
                  100%
                </p>
                <p className="text-xs font-mono font-bold text-secondary uppercase tracking-widest mt-1">
                  Placement Verified
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Hub */}
      <section id="testimonials" className="py-20 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="neon-badge mb-4">Student Feedback</span>
            <h2 className="text-4xl sm:text-5xl font-headline font-extrabold tracking-tight mb-4 text-primary">
              What Our Students Say
            </h2>
            <p className="text-on-surface-variant text-lg font-medium">
              Feedback logged from senior engineers and executives across the
              global IT domain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="hi-tech-panel p-8 flex flex-col justify-between relative"
                >
                  <div>
                    <div className="flex text-amber-400 mb-6 gap-1">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-on-surface text-base mb-8 leading-relaxed italic font-medium">
                      "{testimonial.content || testimonial.comment}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 pt-6 border-t border-primary/20">
                    <img
                      src={
                        testimonial.user?.avatar ||
                        `https://i.pravatar.cc/150?u=${testimonial.id || testimonial.user?.name}`
                      }
                      alt={testimonial.user?.name || "Student"}
                      className="w-12 h-12 rounded-2xl object-cover border border-primary/30 shadow-lg"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold font-headline text-base text-primary">
                        {testimonial.user?.name || "Student"}
                      </p>
                      <p className="text-xs font-mono text-secondary mt-0.5">
                        {testimonial.user?.role || "Software Engineer"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-secondary font-mono text-xs bg-surface-container-low/20 rounded-2xl border border-surface-dim/10">
                No student reviews recorded in database yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CEO Transmission */}
      <section className="py-12 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hi-tech-panel p-8 sm:p-14 flex flex-col lg:flex-row items-center lg:items-start gap-12"
          >
            <div className="w-full lg:w-1/3 max-w-[380px]">
              <div className="rounded-[2.5rem] overflow-hidden shadow-[0_0_35px_rgba(0,85,255,0.3)] border-2 border-primary/40 relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                  alt="Executive Base"
                  className="w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 cyber-glass p-3 rounded-xl text-center">
                  <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                    CEO's Message
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 space-y-6">
              <span className="neon-badge">Message From Our Founder</span>
              <h2 className="text-3xl sm:text-4xl font-headline font-black text-primary leading-tight">
                Bridging Academic Exposure With Production Reality
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg font-medium">
                <p>
                  <strong className="text-primary">STAR LMS</strong> is
                  engineered to eliminate the friction between foundational
                  computer science and high-velocity commercial execution. We
                  construct each masterclass to serve as an uncompromising
                  benchmark of professional excellence.
                </p>
                <p>
                  Our mission is to empower developers, learners, and
                  architects with deep, practical mastery over complex
                  distributed systems, autonomous agents, and enterprise cloud
                  infrastructure.
                </p>
              </div>

              <div className="pt-8 border-t border-primary/20 flex justify-between items-end">
                <div>
                  <p className="text-2xl font-black font-headline text-primary">
                    {leaderName}
                  </p>
                  <p className="text-sm font-mono font-bold text-secondary uppercase tracking-widest mt-1">
                    Chief Executive Officer • STAR LMS
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hi-Tech CTA Section */}
      <section className="py-20 px-4 sm:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center cyber-glass p-12 sm:p-20 rounded-[3rem] border border-primary/40 shadow-[0_0_80px_rgba(0,85,255,0.25)] relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
          <h2 className="text-4xl sm:text-6xl font-headline font-black tracking-tight mb-6 text-primary">
            Ready to Start Your Next Course?
          </h2>
          <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 font-medium">
            Join thousands of engineering professionals transforming their
            capabilities with our flagship curriculum.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link
              to="/catalog"
              className="px-10 py-5 signature-gradient text-white font-headline font-extrabold rounded-2xl text-lg hover:scale-105 shadow-[0_0_35px_rgba(0,85,255,0.6)] transition-all flex items-center gap-3 group"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to="/auth/register"
              className="px-10 py-5 cyber-glass border border-primary text-primary font-headline font-extrabold rounded-2xl text-lg hover:bg-primary/15 transition-all shadow-[0_0_20px_rgba(0,85,255,0.2)]"
            >
              <span>Sign Up & Start Learning</span>
            </Link>
          </div>
          <p className="text-xs font-mono font-bold text-secondary uppercase tracking-widest mt-8">
            Secure Portal • Comprehensive Placement Support
          </p>
        </div>
      </section>
    </div>
  );
}
