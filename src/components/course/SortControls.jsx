// src/components/course/SortControls.jsx
import * as React from "react"
import { ChevronDown, SlidersHorizontal } from "lucide-react"

export function SortControls({ 
  sortBy, 
  onSortChange, 
  level, 
  onLevelChange,
  priceRange,
  onPriceRangeChange,
  duration,
  onDurationChange 
}) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "newest", label: "Newest" },
    { value: "rating", label: "Highest Rated" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ]

  const levelOptions = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ]

  const durationOptions = [
    { value: "all", label: "Any Duration" },
    { value: "short", label: "Short (< 10 hrs)" },
    { value: "medium", label: "Medium (10-30 hrs)" },
    { value: "long", label: "Long (> 30 hrs)" },
  ]

  return (
    <div className="relative">
      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface hover:border-primary/50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Sort: {sortOptions.find(s => s.value === sortBy)?.label}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-container rounded-xl shadow-lg border border-outline-variant overflow-hidden z-20">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value)
                    setIsFilterOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-container-high transition ${
                    sortBy === option.value ? "text-primary font-semibold" : "text-on-surface"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level Filter Dropdown */}
        <select
          value={level}
          onChange={(e) => onLevelChange(e.target.value)}
          className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Duration Filter Dropdown */}
        <select
          value={duration}
          onChange={(e) => onDurationChange(e.target.value)}
          className="px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
          {durationOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}