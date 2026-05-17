// src/components/layout/BottomNav.jsx
import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, BookOpen, LayoutDashboard, Award, User, MessageCircle, Settings, Gift } from "lucide-react"
import { motion } from "framer-motion"

const BOTTOM_NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home", active: true },
  { href: "/catalog", icon: BookOpen, label: "Courses", active: true },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
  { href: "/certificates", icon: Award, label: "Cert", active: true },
  { href: "/profile", icon: User, label: "Profile", active: true },
]

// Optional: User can customize which items appear
export function BottomNav({ customItems = null }) {
  const location = useLocation()
  const navItems = customItems || BOTTOM_NAV_ITEMS.filter(item => item.active)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-container border-t border-outline-variant md:hidden z-40 safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== "/" && location.pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon 
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive 
                    ? 'text-primary scale-110' 
                    : 'text-on-surface-variant group-hover:text-primary/70'
                }`}
              />
              <span className={`text-[10px] font-medium mt-1 transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}