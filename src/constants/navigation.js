// src/constants/navigation.js
export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: null, showInHeader: true, showInMobile: true },
  { href: "/catalog", label: "Courses", icon: null, showInHeader: true, showInMobile: true },
  { href: "/my-courses", label: "My Courses", icon: null, showInHeader: true, showInMobile: true },
  { href: "/dashboard", label: "Dashboard", icon: null, showInHeader: true, showInMobile: true },
  { href: "/certificates", label: "Certificates", icon: null, showInHeader: true, showInMobile: true },
  { href: "/my-doubts", label: "Doubts", icon: null, showInHeader: true, showInMobile: false },
  { href: "/profile", label: "Profile", icon: null, showInHeader: false, showInMobile: true },
]

export const DROPDOWN_ITEMS = [
  { href: "/profile", label: "Profile", icon: "User" },
  { href: "/my-courses", label: "My Courses", icon: "BookOpen" },
  { href: "/certificates", label: "Certificates", icon: "Award" },
  { href: "/my-doubts", label: "My Doubts", icon: "MessageCircle" },
  { href: "/settings", label: "Settings", icon: "Settings" },
  { href: "/referral", label: "Refer & Earn", icon: "Gift" },
]

export const BOTTOM_NAV_ITEMS = [
  { href: "/", icon: "Home", label: "Home" },
  { href: "/catalog", icon: "BookOpen", label: "Courses" },
  { href: "/dashboard", icon: "LayoutDashboard", label: "Dashboard" },
  { href: "/certificates", icon: "Award", label: "Cert" },
  { href: "/profile", icon: "User", label: "Profile" },
]