import * as React from "react"
import { toast } from "sonner"
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { StorageService, AUTH_KEY, FAVORITES_KEY } from "../../services/storage"
import { api } from "../../services/api"
import { Shield, Bell, Key, Trash2, Sun, Moon, Award, Heart, Gift, Copy, BookOpen, ArrowRight, X } from "lucide-react"
import { Link } from "react-router-dom"

export default function Profile() {
  return (
    <ProtectedRoute fallbackPath="/auth">
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const [authState, setAuthState] = React.useState(StorageService.getAuthState())
  const [enrollments, setEnrollments] = React.useState([])
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light')
  const [passwords, setPasswords] = React.useState({ current: "", new: "" })
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [wishlist, setWishlist] = React.useState([])
  const [wishlistLoading, setWishlistLoading] = React.useState(true)

  // Load wishlist course details from favoriteIds stored in localStorage
  const loadWishlist = React.useCallback(async () => {
    setWishlistLoading(true)
    try {
      const favoriteIds = StorageService.getFavorites() // array of courseIds (numbers)
      if (!favoriteIds || favoriteIds.length === 0) {
        setWishlist([])
        return
      }
      // Fetch full course data for each favorited id
      const allCourses = await StorageService.getCourses()
      const wishlistedCourses = allCourses.filter(c => favoriteIds.includes(c.id))
      setWishlist(wishlistedCourses)
    } catch (err) {
      console.error("Error loading wishlist:", err)
    } finally {
      setWishlistLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const handleUpdate = async () => {
      setAuthState(StorageService.getAuthState())
      try {
        const enrolled = await StorageService.getEnrolledCourses()
        setEnrollments(enrolled)
      } catch (error) {
        setEnrollments(StorageService.getEnrollments())
      }
    }

    handleUpdate()
    loadWishlist()

    window.addEventListener(`storage-update-${AUTH_KEY}`, handleUpdate)
    window.addEventListener(`storage-update-${FAVORITES_KEY}`, loadWishlist)

    const syncTheme = () => setTheme(localStorage.getItem('theme') || 'light')
    window.addEventListener('themeSync', syncTheme)

    return () => {
      window.removeEventListener(`storage-update-${AUTH_KEY}`, handleUpdate)
      window.removeEventListener(`storage-update-${FAVORITES_KEY}`, loadWishlist)
      window.removeEventListener('themeSync', syncTheme)
    }
  }, [loadWishlist])

  const user = authState.user || { name: "Guest", email: "guest@example.com" }

  const handleUpdatePassword = async () => {
    if (!passwords.current || !passwords.new) {
      toast.error("Please provide both current and new access keys.")
      return
    }
    if (passwords.new.length < 6) {
      toast.error("New access key must be at least 6 characters long.")
      return
    }
    setIsUpdating(true)
    try {
      const token = StorageService.getToken()
      await api.auth.changePassword(passwords.current, passwords.new, token)
      toast.success("Security configuration updated successfully!")
      setPasswords({ current: "", new: "" })
    } catch (error) {
      console.error("Password update error:", error)
      toast.error(error.message || "Failed to update security credentials.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
    window.dispatchEvent(new Event('themeSync'))
  }

  const handleCopyReferral = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode)
      toast.success("Referral code copied to clipboard!")
    }
  }

  const handleCopyLink = () => {
    if (user.referralCode) {
      const link = `${window.location.origin}/register?ref=${user.referralCode}`
      navigator.clipboard.writeText(link)
      toast.success("Referral link copied to clipboard!")
    }
  }

  const handleRemoveFromWishlist = (courseId) => {
    StorageService.toggleFavorite(courseId) // toggles off → triggers event → loadWishlist runs
    toast.success("Removed from wishlist")
  }

  return (
    <main className="min-h-screen bg-surface relative overflow-hidden pt-8 pb-24">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 text-on-surface">
        <div className="mb-10 border-b border-surface-dim pb-8">
          <h1 className="font-headline text-4xl font-extrabold mb-2 text-primary">My Account</h1>
          <p className="text-secondary text-lg">Manage your credentials and platform preferences.</p>
        </div>

        {/* User Stats Card */}
        <section className="mb-12 bg-surface-container-low border border-surface-dim rounded-[2.5rem] p-10 ambient-shadow flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-primary text-on-primary rounded-full flex items-center justify-center text-4xl font-headline font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-headline font-extrabold text-primary mb-1">{user.name}</h2>
            <p className="text-secondary font-medium mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-bold text-primary border border-surface-dim uppercase tracking-widest">{enrollments.length} Courses</span>
              <span className="bg-surface-container-high px-4 py-1.5 rounded-full text-xs font-bold text-primary border border-surface-dim uppercase tracking-widest">Active Member</span>
              {wishlist.length > 0 && (
                <span className="bg-rose-500/10 px-4 py-1.5 rounded-full text-xs font-bold text-rose-500 border border-rose-500/20 uppercase tracking-widest flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-rose-500" /> {wishlist.length} Saved
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ===== WISHLIST SECTION ===== */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                <Heart className="w-6 h-6 fill-rose-500" />
              </div>
              <div>
                <h2 className="text-2xl font-headline font-bold text-primary">My Wishlist</h2>
                <p className="text-secondary text-sm">Courses you've saved for later</p>
              </div>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-primary border-b border-primary pb-0.5 hover:opacity-70 transition-all flex items-center gap-1"
            >
              Browse More <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {wishlistLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 bg-surface-container-lowest rounded-[2rem] border border-surface-dim animate-pulse" />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-dim rounded-[2rem] p-14 text-center">
              <Heart className="w-14 h-14 text-surface-dim mx-auto mb-4" />
              <h3 className="text-xl font-headline font-bold text-primary mb-2">No saved courses yet</h3>
              <p className="text-secondary text-sm mb-6 max-w-xs mx-auto">
                Click "Save to Wishlist" on any course detail page to save it here.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 signature-gradient text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
              >
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map(course => (
                <div
                  key={course.id}
                  className="bg-surface-container-lowest border border-surface-dim rounded-[2rem] overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all group relative"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(course.id)}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-rose-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Thumbnail */}
                  <div className="w-full h-36 overflow-hidden">
                    <img
                      src={course.image || course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[9px] font-bold text-secondary uppercase tracking-widest bg-surface-container px-2 py-0.5 rounded-full">
                        {course.category || 'Course'}
                      </span>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                        {course.level || 'All Levels'}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-base text-on-surface mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-secondary mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-headline font-extrabold text-primary">
                        ₹{course.price || 0}
                      </span>
                      <Link
                        to={`/course/${course.id}`}
                        className="text-xs font-bold px-4 py-2 signature-gradient text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: Security and Platform Preferences */}
          <div className="flex flex-col gap-8">
            {/* Security Settings */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-[2rem] p-8 ambient-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-surface-container-low rounded-xl text-primary"><Shield className="w-6 h-6" /></div>
                <h3 className="text-xl font-headline font-bold text-primary">Security Settings</h3>
              </div>
              <div className="space-y-5">
                <input 
                  type="password" 
                  placeholder="Current Access Key" 
                  className="w-full bg-surface-container-low border border-surface-dim rounded-xl px-4 py-3.5"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
                <input 
                  type="password" 
                  placeholder="New Access Key" 
                  className="w-full bg-surface-container-low border border-surface-dim rounded-xl px-4 py-3.5"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <button 
                  onClick={handleUpdatePassword} 
                  disabled={isUpdating}
                  className="w-full bg-primary text-on-primary font-bold rounded-xl py-4 hover:opacity-90 transition-all uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Security"}
                </button>
              </div>
            </div>

            {/* Platform Preferences */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-[2rem] p-8 ambient-shadow">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-surface-container-low rounded-xl text-primary"><Bell className="w-6 h-6" /></div>
                <h3 className="text-xl font-headline font-bold text-primary">Platform Preferences</h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl">
                <div>
                  <div className="font-bold text-primary">Visual Theme</div>
                  <div className="text-xs text-secondary">Switch between Light and Dark interface.</div>
                </div>
                <button onClick={handleToggleTheme} className="p-2 bg-surface-container-lowest rounded-xl border border-surface-dim">
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-primary" />}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Referral Program */}
          <div className="flex flex-col gap-8">
            {enrollments.length > 0 && user.referralCode && (
              <div className="bg-surface-container-lowest border border-surface-dim rounded-[2rem] p-8 ambient-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary"><Gift className="w-6 h-6" /></div>
                  <h3 className="text-xl font-headline font-bold text-primary">Referral Program</h3>
                </div>
                <p className="text-secondary text-sm mb-6 relative z-10">
                  Share your referral code with friends. When they register using your code, you'll earn a <span className="font-bold text-primary">10% discount</span> on your next purchase!
                </p>
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="bg-surface-container border border-surface-dim/30 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Your Referral Code</p>
                      <p className="text-2xl font-headline font-extrabold text-primary tracking-widest">{user.referralCode}</p>
                    </div>
                    <button onClick={handleCopyReferral} className="p-3 bg-surface-container-high rounded-xl text-primary hover:bg-primary/10 transition-colors" title="Copy Code">
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="bg-surface-container border border-surface-dim/30 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex-1 overflow-hidden mr-4">
                      <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Your Referral Link</p>
                      <p className="text-xs font-medium text-primary truncate opacity-70">
                        {`${window.location.origin}/register?ref=${user.referralCode}`}
                      </p>
                    </div>
                    <button onClick={handleCopyLink} className="p-3 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all flex items-center gap-2 text-xs font-bold shrink-0" title="Copy Link">
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <span className="font-bold text-emerald-700">Available Discounts</span>
                    <span className="text-xl font-extrabold text-emerald-700 bg-emerald-500/20 px-3 py-1 rounded-lg">
                      {user.availableDiscounts || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}