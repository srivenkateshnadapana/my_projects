// src/components/course/CourseCard.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Clock, BookOpen, Users } from "lucide-react";

const levelColors = {
  beginner: "bg-success-container text-on-success-container",
  intermediate: "bg-primary-container text-on-primary-container",
  advanced: "bg-tertiary-container text-on-tertiary-container",
};

export const CourseCard = React.memo(
  ({
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
    level = "intermediate",
  }) => {
    let discount = originalPrice
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
    if (discount === 100 && price > 0) discount = 99;

    const displayTitle = React.useMemo(() => {
      if (!title) return "";
      return title
        .replace(/\baws\b/gi, "AWS")
        .replace(/\bmern\b/gi, "MERN")
        .replace(/\bmernstack\b/gi, "MERN Stack")
        .replace(/\bsql\b/gi, "SQL")
        .replace(/\bapi\b/gi, "API");
    }, [title]);

    return (
      <div className="hi-tech-panel group flex flex-col justify-between h-full bg-surface-container-lowest rounded-3xl border border-primary/20 hover:border-primary/60 transition-all duration-500 shadow-[0_4px_25px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_35px_rgba(0,85,255,0.25)] relative overflow-hidden">
        {/* Image Section with Holographic Overlay */}
        <Link
          to={`/course/${id}`}
          className="block relative overflow-hidden aspect-video"
        >
          <img
            src={
              image ||
              `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=2560&auto=format&q=100`
            }
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Level Badge */}
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-primary border border-primary/40 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(0,85,255,0.3)]">
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>

          {/* Duration Badge */}
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono font-bold flex items-center gap-1.5 border border-white/20">
            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            {duration} hrs
          </span>
        </Link>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-between items-start gap-3 mb-3">
              <Link to={`/course/${id}`} className="flex-1">
                <h3 className="font-headline font-extrabold text-xl text-on-surface line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                  {displayTitle}
                </h3>
              </Link>
              <button
                onClick={() => onFavoriteToggle(id)}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
                className="flex-shrink-0 p-2 cyber-glass rounded-full hover:bg-primary/20 hover:scale-110 transition-all shadow-md z-10"
              >
                <Heart
                  className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? "fill-error text-error scale-110 shadow-[0_0_10px_rgba(255,0,0,0.5)]" : "text-on-surface-variant"}`}
                />
              </button>
            </div>

            {/* Instructor Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-mono text-xs font-bold">
                {instructor?.charAt(0) || "★"}
              </div>
              <p className="text-xs font-mono text-on-surface-variant tracking-wide font-semibold truncate">
                {instructor || "Lead Instructor"}
              </p>
            </div>

            {/* Rating Hub */}
            <div className="flex items-center justify-between mb-6 p-2.5 cyber-glass rounded-xl border border-primary/10">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-spin-slow" />
                <span className="text-sm font-black font-mono text-on-surface">
                  {rating}
                </span>
                <span className="text-xs font-medium text-on-surface-variant font-mono">
                  ({reviewCount})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-primary font-mono text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                <Users className="w-3.5 h-3.5" />
                <span>1.2k learners</span>
              </div>
            </div>
          </div>

          {/* Price & Execution Trigger */}
          <div className="flex items-center justify-between pt-4 border-t border-primary/20 mt-auto">
            <div>
              {originalPrice && (
                <span className="text-xs font-mono text-on-surface-variant line-through mr-2">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-2xl font-black font-headline tracking-tight text-primary drop-shadow-[0_0_10px_rgba(0,85,255,0.4)]">
                {price === 0 ? "Free Course" : `₹${price}`}
              </span>
              {discount > 0 && price > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono text-success bg-success/10 rounded-md font-extrabold border border-success/30">
                  -{discount}%
                </span>
              )}
            </div>
            <Link
              to={`/course/${id}`}
              className="px-5 py-2.5 signature-gradient text-white rounded-2xl text-sm font-bold shadow-[0_0_20px_rgba(0,85,255,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,85,255,0.8)] transition-all flex items-center gap-1.5 font-headline"
            >
              <span>View Course</span>
            </Link>
          </div>
        </div>
      </div>
    );
  },
);
