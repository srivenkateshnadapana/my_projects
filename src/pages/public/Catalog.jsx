// src/pages/public/Catalog.jsx
import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SearchFilterBar } from "../../components/course/SearchFilterBar"
import { SortControls } from "../../components/course/SortControls"
import { CourseCard } from "../../components/course/CourseCard"
import { StorageService } from "../../services/storage"
import { Loader2, FilterX } from "lucide-react"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Catalog() {
  const [courses, setCourses] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("popular")
  const [level, setLevel] = React.useState("all")
  const [priceRange, setPriceRange] = React.useState({ min: 0, max: 5000 })
  const [duration, setDuration] = React.useState("all")
  const [favorites, setFavorites] = React.useState(new Set(StorageService.getFavorites()))
  const [visibleCount, setVisibleCount] = React.useState(9)

  // Load courses
  React.useEffect(() => {
    const loadCourses = async () => {
      // Check if we have cached data first to avoid showing loader if possible
      const cached = await StorageService.getCourses()
      if (cached && cached.length > 0) {
        setCourses(cached)
        setLoading(false)
        
        // Background refresh to ensure data is up to date
        const fresh = await StorageService.getCourses(true)
        if (fresh?.length !== cached?.length) {
          setCourses(fresh)
        }
      } else {
        setLoading(true)
        const data = await StorageService.getCourses()
        setCourses(data)
        setLoading(false)
      }
    }
    loadCourses()
  }, [])

  // Filter and sort courses
  const filteredCourses = React.useMemo(() => {
    let result = [...courses]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query) ||
          course.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((course) => course.category === activeCategory)
    }

    // Level filter
    if (level !== "all") {
      result = result.filter((course) => course.level === level)
    }

    // Price range filter
    result = result.filter(
      (course) => course.price >= priceRange.min && course.price <= priceRange.max
    )

    // Duration filter
    if (duration !== "all") {
      switch (duration) {
        case "short":
          result = result.filter((course) => course.duration <= 10)
          break
        case "medium":
          result = result.filter((course) => course.duration > 10 && course.duration <= 30)
          break
        case "long":
          result = result.filter((course) => course.duration > 30)
          break
        default:
          break
      }
    }

    // Sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        result.sort((a, b) => (b.enrolled || 0) - (a.enrolled || 0))
        break
      default:
        break
    }

    return result
  }, [courses, searchQuery, activeCategory, level, sortBy, priceRange, duration])

  // Reset pagination when filters change
  React.useEffect(() => {
    setVisibleCount(9)
  }, [searchQuery, activeCategory, level, sortBy, priceRange, duration])

  const handleFavoriteToggle = React.useCallback((id) => {
    StorageService.toggleFavorite(id)
    setFavorites(new Set(StorageService.getFavorites()))
  }, [])

  // Derived state for pagination
  const hasMore = filteredCourses.length > visibleCount

  const handleClearAllFilters = () => {
    setSearchQuery("")
    setActiveCategory("all")
    setLevel("all")
    setSortBy("popular")
    setPriceRange({ min: 0, max: 5000 })
    setDuration("all")
  }

  const hasActiveFilters = searchQuery || activeCategory !== "all" || level !== "all" || 
                          priceRange.min > 0 || priceRange.max < 5000 || duration !== "all"

  const visibleCourses = React.useMemo(() => {
    return filteredCourses.slice(0, visibleCount)
  }, [filteredCourses, visibleCount])

  // Categories for filter - Optimized count calculation
  const categories = React.useMemo(() => {
    const counts = courses.reduce((acc, course) => {
      const cat = course.category || "other";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: "all", label: "All", count: courses.length },
      { id: "development", label: "Development", count: counts["development"] || 0 },
      { id: "design", label: "Design", count: counts["design"] || 0 },
      { id: "business", label: "Business", count: counts["business"] || 0 },
      { id: "marketing", label: "Marketing", count: counts["marketing"] || 0 },
    ]
  }, [courses])

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Banner */}
      <div className="signature-gradient py-12 sm:py-16 md:py-20 mb-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-white mb-4"
          >
            Course Catalog
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-base sm:text-lg max-w-2xl leading-relaxed"
          >
            Explore our curated collection of premium courses designed by industry experts.
          </motion.p>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="h-px bg-white/20 w-24 mt-6 origin-left" 
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search & Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          categories={categories}
        />

        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <p className="text-on-surface-variant text-sm font-medium">
              Showing <span className="font-bold text-primary">{filteredCourses.length}</span> courses
              {hasActiveFilters && <span className="text-xs ml-2 text-primary/60 font-bold bg-primary/5 px-2 py-0.5 rounded-full">FILTERED</span>}
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
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition-all border border-primary/20"
              >
                <FilterX className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-on-surface-variant">Loading courses...</p>
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
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8"
                >
                  {visibleCourses.map((course) => (
                    <motion.div key={course.id} variants={itemVariants}>
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
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 9)}
                  className="px-6 py-3 border border-primary/30 text-primary rounded-xl font-medium hover:bg-primary/5 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Load More Courses
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredCourses.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-surface-dim/20"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">No courses found</h3>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  We couldn't find any courses matching your search criteria. Try adjusting your filters or search term.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:opacity-90 transition"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}