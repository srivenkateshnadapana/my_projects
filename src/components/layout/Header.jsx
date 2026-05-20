// src/components/layout/Header.jsx
import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  User,
  BookOpen,
  Award,
  Settings,
  Gift,
  MessageCircle,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StorageService } from "../../services/storage";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Courses" },
  { href: "/blog", label: "Blog" },
  { href: "/verify-certificate", label: "Certificate Verification" },
];

const PRIVATE_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/student/codelab", label: "CodeLab" },
  { href: "/blog", label: "Blog" },
];

const DROPDOWN_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/my-courses", label: "My Courses", icon: BookOpen },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/my-doubts", label: "My Doubts", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/referral", label: "Refer & Earn", icon: Gift },
  { href: "/feedback", label: "Feedback", icon: MessageCircle },
];

import { authStore } from "../../utils/authStore";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isAtTop, setIsAtTop] = React.useState(true);
  const [authState, setAuthState] = React.useState(authStore.getState());
  const [theme, setTheme] = React.useState(
    localStorage.getItem("theme") || "light",
  );
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    // Initial sync
    setAuthState(authStore.getState());

    // Subscribe to the store
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    const syncTheme = () => setTheme(localStorage.getItem("theme") || "light");
    window.addEventListener("themeSync", syncTheme);
    return () => window.removeEventListener("themeSync", syncTheme);
  }, []);

  React.useEffect(() => {
    const update = () => setIsAtTop(window.scrollY === 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new Event("themeSync"));
  };

  const handleSignOut = () => {
    StorageService.logout();
    setIsOpen(false);
    setIsDropdownOpen(false);
    navigate("/auth");
  };

  const { isAuthenticated, user } = authState;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isAtTop ? "bg-transparent py-4" : "py-2.5 bg-background/85 backdrop-blur-2xl border-b border-primary/20 shadow-[0_10px_35px_-10px_rgba(0,85,255,0.3)]"}`}
    >
      <div className="flex justify-between items-center w-full px-4 sm:px-8 py-2 max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 signature-gradient rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(0,85,255,0.6)] group-hover:rotate-12 transition-all duration-500">
            <span className="text-white font-headline font-extrabold text-xl tracking-wider">
              ★
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold tracking-tighter hologram-text font-headline leading-none">
              STAR LMS
            </span>
            <span className="text-[9px] font-mono tracking-[0.35em] uppercase text-primary font-bold mt-0.5">
              Student Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-surface-container-low/80 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-primary/20 shadow-inner font-headline text-xs xl:text-sm font-semibold">
          {(isAuthenticated ? PRIVATE_NAV_ITEMS : PUBLIC_NAV_ITEMS).map(
            (item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 xl:px-4 py-2 rounded-full transition-all duration-300 relative group whitespace-nowrap ${location.pathname === item.href ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(0,85,255,0.6)] font-bold scale-105" : "text-on-surface hover:text-primary"}`}
              >
                {item.label}
                {location.pathname !== item.href && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></span>
                )}
              </Link>
            ),
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            onClick={handleToggleTheme}
            className="w-10 h-10 bg-surface-container-low border border-primary/30 text-primary rounded-full flex items-center justify-center hover:bg-primary/20 hover:scale-110 hover:shadow-[0_0_15px_rgba(0,85,255,0.4)] transition-all duration-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-5 w-5 text-primary animate-pulse" />
            )}
          </button>

          {!isAuthenticated ? (
            <>
              <Link
                to="/auth"
                className="px-5 py-2.5 rounded-full border border-primary/40 text-primary font-bold text-sm hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_20px_rgba(0,85,255,0.3)] transition-all"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-6 py-2.5 rounded-full signature-gradient text-white font-bold text-sm shadow-[0_0_20px_rgba(0,85,255,0.5)] hover:scale-105 hover:shadow-[0_0_30px_rgba(0,85,255,0.8)] transition-all flex items-center gap-1.5"
              >
                <span>Student Portal</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="px-4 py-1.5 border border-primary/50 text-primary bg-primary/10 rounded-xl text-xs font-bold hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(0,85,255,0.4)] transition-all uppercase tracking-widest flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin Dashboard
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 bg-surface-container-low border border-primary/30 rounded-full hover:border-primary hover:shadow-[0_0_15px_rgba(0,85,255,0.3)] transition-all"
                >
                  <span className="text-xs font-bold text-on-surface max-w-[100px] truncate">
                    {user?.full_name || user?.name || "Student"}
                  </span>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,85,255,0.5)]">
                    <span className="text-on-primary text-xs font-extrabold">
                      {(user?.full_name || user?.name)
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-primary transition-transform duration-300 mr-1 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 cyber-glass-glow rounded-2xl overflow-hidden z-50 border border-primary/40 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="px-5 py-4 border-b border-primary/20 bg-primary/5">
                      <p className="text-sm font-bold text-on-surface">
                        {user?.full_name || user?.name}
                      </p>
                      <p className="text-xs font-mono text-primary mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      {DROPDOWN_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-on-surface hover:bg-primary/15 hover:text-primary transition-all group"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <item.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-primary/20 p-2 bg-error/5">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-bold text-error bg-error/10 hover:bg-error hover:text-on-error rounded-xl transition-all shadow-[0_0_10px_rgba(255,0,0,0.2)]"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl p-2.5 border border-primary/30 text-primary bg-surface-container hover:bg-primary/10 hover:shadow-[0_0_15px_rgba(0,85,255,0.3)] transition-all lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lg:hidden bg-background/95 backdrop-blur-2xl border-t border-primary/20 shadow-2xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex flex-col gap-2 p-6 max-w-lg mx-auto space-y-1">
              <button
                onClick={() => {
                  handleToggleTheme();
                  setIsOpen(false);
                }}
                className="w-full p-3 rounded-xl border border-primary/30 text-primary bg-primary/5 font-bold text-sm text-left flex items-center justify-between shadow-[0_0_15px_rgba(0,85,255,0.2)]"
              >
                <span className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary animate-pulse" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest bg-primary/20 px-2 py-0.5 rounded">
                  Toggle
                </span>
              </button>

              <div className="border-t border-primary/20 my-3"></div>

              {(isAuthenticated
                ? [
                    ...PRIVATE_NAV_ITEMS,
                    { href: "/my-courses", label: "My Courses" },
                    { href: "/certificates", label: "Certificates" },
                    { href: "/my-doubts", label: "My Doubts" },
                  ]
                : PUBLIC_NAV_ITEMS
              ).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="rounded-xl px-4 py-3 text-base font-bold text-on-surface hover:bg-primary/15 hover:text-primary transition-all border border-transparent hover:border-primary/30 flex items-center justify-between"
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronDown className="-rotate-90 w-4 h-4 text-primary opacity-60" />
                </Link>
              ))}

              <div className="border-t border-primary/20 my-3"></div>

              <Link
                to="/settings"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 text-primary" /> Settings
              </Link>
              <Link
                to="/referral"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <Gift className="w-4 h-4 text-primary" /> Refer & Earn
              </Link>
              <Link
                to="/feedback"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-3"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="w-4 h-4 text-primary" /> Feedback
              </Link>

              <div className="border-t border-primary/20 my-3"></div>

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/auth"
                    className="rounded-xl px-4 py-3 text-sm font-bold border border-primary text-primary text-center hover:bg-primary/10 shadow-[0_0_15px_rgba(0,85,255,0.2)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-xl px-4 py-3 text-sm font-bold signature-gradient text-white text-center shadow-[0_0_20px_rgba(0,85,255,0.5)]"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="rounded-xl px-4 py-3 text-sm font-bold bg-primary/20 border border-primary text-primary text-center uppercase tracking-widest shadow-[0_0_15px_rgba(0,85,255,0.3)] flex items-center justify-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="rounded-xl px-4 py-3 text-center text-sm font-bold text-error bg-error/10 border border-error/30 hover:bg-error hover:text-on-error transition-all shadow-[0_0_15px_rgba(255,0,0,0.2)] flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
