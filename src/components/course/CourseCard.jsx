// src/components/course/CourseCard.jsx
import * as React from "react"
import { Link } from "react-router-dom"
import { Heart, Star, Clock, BookOpen, Users } from "lucide-react"

const levelColors = {
  beginner: "bg-success-container text-on-success-container",
  intermediate: "bg-primary-container text-on-primary-container",
  advanced: "bg-tertiary-container text-on-tertiary-container",
}

export const CourseCard = React.memo(({ 
  id, 
  title, 
  instructor, 
  price, 
  originalPrice, 
  rating = 4.5, 
  reviewCount = 120, 
  image, 
  isFavorite, 
  onFavoriteToggle, 
  duration = 15, 
  level = "intermediate" 
}) => {
  let discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0
  if (discount === 100 && price > 0) discount = 99;
  
  const displayTitle = React.useMemo(() => {
    if (!title) return "";
    return title
      .replace(/\baws\b/ig, "AWS")
      .replace(/\bmern\b/ig, "MERN")
      .replace(/\bmernstack\b/ig, "MERN Stack")
      .replace(/\bsql\b/ig, "SQL")
      .replace(/\bapi\b/ig, "API");
  }, [title]);

  return (
    <div className="group relative bg-surface-container-lowest rounded-[var(--shape-extra-large)] overflow-hidden border border-outline-variant/40 card-lift">
      {/* Image Section */}
      <Link to={`/course/${id}`} className="block relative overflow-hidden aspect-video">
        <img
          src={image || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&q=100`}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Level Badge */}
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-bold ${levelColors[level] || levelColors.intermediate}`}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
        
        {/* Duration Badge */}
        <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {duration} hrs
        </span>
      </Link>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link to={`/course/${id}`} className="flex-1">
            <h3 className="font-headline font-bold text-lg text-on-surface line-clamp-2 group-hover:text-primary transition-colors" style={{transitionDuration:'var(--motion-duration-medium2)'}}>
              {displayTitle}
            </h3>
          </Link>
          <button
            onClick={() => onFavoriteToggle(id)}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-error text-error' : 'text-on-surface-variant'}`} />
          </button>
        </div>

        {/* Instructor */}
        <p className="text-sm text-on-surface-variant mb-3">{instructor}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-on-surface">{rating}</span>
          </div>
          <span className="text-xs text-on-surface-variant">({reviewCount} reviews)</span>
          <div className="flex items-center gap-1 ml-auto">
            <Users className="w-3 h-3 text-on-surface-variant" />
            <span className="text-xs text-on-surface-variant">1.2k enrolled</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-dim/20">
          <div>
            {originalPrice && (
              <span className="text-xs text-on-surface-variant line-through mr-2">₹{originalPrice}</span>
            )}
            <span className="text-xl font-bold text-primary">
              {price === 0 ? "Free" : `₹${price}`}
            </span>
            {discount > 0 && price > 0 && (
              <span className="ml-2 text-xs text-success font-semibold">-{discount}%</span>
            )}
          </div>
          <Link
            to={`/course/${id}`}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded-[var(--shape-full)] text-sm font-medium hover:bg-primary hover:text-on-primary transition-all"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
})