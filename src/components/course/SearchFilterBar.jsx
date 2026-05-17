// src/components/course/SearchFilterBar.jsx
import * as React from "react"
import { Search } from "lucide-react"

export function SearchFilterBar({ 
  searchQuery, 
  onSearchChange, 
  activeCategory, 
  onCategoryChange,
  categories 
}) {
  return (
    <div className="mb-8 space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search courses by title, instructor, or keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-on-surface placeholder:text-on-surface-variant"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category.id
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            {category.label}
            {category.id !== "all" && (
              <span className="ml-1 text-xs opacity-70">({category.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}