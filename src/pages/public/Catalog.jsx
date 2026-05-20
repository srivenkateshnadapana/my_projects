// src/pages/public/Catalog.jsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchFilterBar } from "../../components/course/SearchFilterBar";
import { SortControls } from "../../components/course/SortControls";
import { CourseCard } from "../../components/course/CourseCard";
import { StorageService } from "../../services/storage";
import { Loader2, FilterX } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Catalog() {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("popular");
  const [level, setLevel] = React.useState("all");
  const [priceRange, setPriceRange] = React.useState({ min: 0, max: 100000 });
  const [duration, setDuration] = React.useState("all");
  const [favorites, setFavorites] = React.useState(
    new Set(StorageService.getFavorites()),
  );
  const [visibleCount, setVisibleCount] = React.useState(9);

  // Load courses
  React.useEffect(() => {
    const loadCourses = async () => {
      // Check if we have cached data first to avoid showing loader if possible
      const cached = await StorageService.getCourses();
      if (cached && cached.length > 0) {
        setCourses(cached);
        setLoading(false);

        // Background refresh to ensure data is up to date
        const fresh = await StorageService.getCourses(true);
        if (fresh?.length !== cached?.length) {
          setCourses(fresh);
        }
      } else {
        setLoading(true);
        const data = await StorageService.getCourses();
        setCourses(data);
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Filter and sort courses
  const filteredCourses = React.useMemo(() => {
    let result = [...courses];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((course) => course.category === activeCategory);
    }

    // Level filter
    if (level !== "all") {
      result = result.filter((course) => course.level === level);
    }

    // Price range filter
    result = result.filter(
      (course) =>
        course.price >= priceRange.min && course.price <= priceRange.max,
    );

    // Duration filter
    if (duration !== "all") {
      switch (duration) {
        case "short":
          result = result.filter((course) => course.duration <= 10);
          break;
        case "medium":
          result = result.filter(
            (course) => course.duration > 10 && course.duration <= 30,
          );
          break;
        case "long":
          result = result.filter((course) => course.duration > 30);
          break;
        default:
          break;
      }
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
        result.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0));
        break;
      default:
        break;
    }

    return result;
  }, [
    courses,
    searchQuery,
    activeCategory,
    level,
    sortBy,
    priceRange,
    duration,
  ]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, activeCategory, level, sortBy, priceRange, duration]);

  const handleFavoriteToggle = React.useCallback((id) => {
    StorageService.toggleFavorite(id);
    setFavorites(new Set(StorageService.getFavorites()));
  }, []);

  // Derived state for pagination
  const hasMore = filteredCourses.length > visibleCount;

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setLevel("all");
    setSortBy("popular");
    setPriceRange({ min: 0, max: 100000 });
    setDuration("all");
  };

  const hasActiveFilters =
    searchQuery ||
    activeCategory !== "all" ||
    level !== "all" ||
    priceRange.min > 0 ||
    priceRange.max < 100000 ||
    duration !== "all";

  const visibleCourses = React.useMemo(() => {
    return filteredCourses.slice(0, visibleCount);
  }, [filteredCourses, visibleCount]);

  // Categories for filter - Optimized count calculation
  const categories = React.useMemo(() => {
    const counts = courses.reduce((acc, course) => {
      const cat = course.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: "all", label: "All", count: courses.length },
      {
        id: "Artificial Intelligence",
        label: "AI & LLMs",
        count: counts["Artificial Intelligence"] || 0,
      },
      {
        id: "Advanced Web Dev",
        label: "Web Dev & Cloud",
        count: counts["Advanced Web Dev"] || 0,
      },
      {
        id: "Robotics & Automation",
        label: "Robotics & Agents",
        count: counts["Robotics & Automation"] || 0,
      },
      {
        id: "Cybersecurity",
        label: "Cybersecurity",
        count: counts["Cybersecurity"] || 0,
      },
      {
        id: "Data Science & Analytics",
        label: "Data Science",
        count: counts["Data Science & Analytics"] || 0,
      },
      {
        id: "Immersive Tech",
        label: "AR / VR",
        count: counts["Immersive Tech"] || 0,
      },
    ];
  }, [courses]);

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Subtle Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />

      {/* Hero Holographic Banner */}
      <div className="relative overflow-hidden py-16 sm:py-24 mb-12 px-4 sm:px-8 border-b border-primary/20 bg-background/80 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,85,255,0.15)]">
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 animate-pulse-glow" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full cyber-glass border border-primary/40 text-primary text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,85,255,0.2)]"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Active Course Catalog</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-7xl font-headline font-black text-on-surface tracking-tighter mb-4 leading-none"
          >
            Course{" "}
            <span className="hologram-text font-extrabold pb-2">Catalog</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant text-base sm:text-xl max-w-2xl font-medium leading-relaxed"
          >
            Explore our curated high-quality engineering courses designed by
            top industry professionals.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="h-1 bg-gradient-to-r from-primary via-tertiary to-transparent w-48 mt-8 rounded-full origin-left shadow-[0_0_15px_rgba(0,85,255,0.5)]"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        {/* Search & Filter Bar */}
        <div className="cyber-glass p-4 sm:p-6 rounded-3xl border border-primary/30 mb-8 shadow-xl">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 cyber-glass p-5 rounded-2xl border border-primary/20">
          <div>
            <p className="text-on-surface text-base font-bold font-headline">
              Showing{" "}
              <span className="text-primary font-black font-mono text-lg">
                {filteredCourses.length}
              </span>{" "}
              Courses
              {hasActiveFilters && (
                <span className="text-[10px] ml-3 text-primary font-mono font-extrabold bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Filters Active
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <SortControls
              sortBy={sortBy}
              onSortChange={setSortBy}
              level={level}
              onLevelChange={setLevel}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              duration={duration}
              onDurationChange={setDuration}
            />

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold text-error bg-error/10 hover:bg-error hover:text-on-error rounded-xl transition-all border border-error/30 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
              >
                <FilterX className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 cyber-glass rounded-3xl border border-primary/20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-on-surface font-mono font-bold tracking-widest uppercase text-sm">
              Loading Courses...
            </p>
          </div>
        )}

        {/* Course Grid */}
        {!loading && (
          <>
            {filteredCourses.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={filteredCourses.length}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {visibleCourses.map((course) => (
                    <motion.div
                      key={course.id}
                      variants={itemVariants}
                      className="h-full"
                    >
                      <CourseCard
                        id={course.id}
                        title={course.title}
                        instructor={course.instructor}
                        price={course.price}
                        originalPrice={course.originalPrice}
                        rating={course.rating}
                        reviewCount={course.reviewCount}
                        image={course.image}
                        isFavorite={favorites.has(course.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        duration={course.duration}
                        level={course.level}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-16">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className="px-10 py-4 signature-gradient text-white rounded-2xl font-headline font-extrabold text-base shadow-[0_0_30px_rgba(0,85,255,0.5)] hover:scale-105 transition-all flex items-center gap-2 mx-auto group"
                >
                  <span>Load More Courses</span>
                  <Loader2 className="w-5 h-5 animate-spin group-hover:rotate-180" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 cyber-glass rounded-3xl border border-primary/30 max-w-2xl mx-auto shadow-2xl p-8"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-center text-error shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                  <FilterX className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">
                  No Courses Found
                </h3>
                <p className="text-on-surface-variant max-w-md mx-auto mb-8 font-medium text-base">
                  No courses match your selected search or filter criteria. Please
                  try clearing or changing filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="px-8 py-3.5 signature-gradient text-white rounded-xl font-bold shadow-[0_0_25px_rgba(0,85,255,0.5)] hover:scale-105 transition-all font-headline"
                  >
                    Reset All Filters
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
