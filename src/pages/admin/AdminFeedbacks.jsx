import * as React from "react"
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { MessageSquare, Trash2, Star, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminFeedbacks() {
  return (
    <AdminProtectedRoute>
      <AdminFeedbacksContent />
    </AdminProtectedRoute>
  )
}

function AdminFeedbacksContent() {
  const [feedbacks, setFeedbacks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterRating, setFilterRating] = React.useState(0)
  const token = StorageService.getToken()

  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const res = await api.feedbacks.getAll(token)
      if (res.success) {
        setFeedbacks(res.data)
      }
    } catch (err) {
      toast.error("Failed to load feedbacks")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadFeedbacks()
  }, [])

  const handleToggleDisplay = async (id, currentStatus) => {
    try {
      const res = await api.feedbacks.updateDisplay(id, !currentStatus, token)
      if (res.success) {
        toast.success(res.data.showOnHome ? "Feedback added to Home" : "Feedback removed from Home")
        loadFeedbacks()
      }
    } catch (err) {
      toast.error("Failed to update display status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return
    try {
      const res = await api.feedbacks.delete(id, token)
      if (res.success) {
        toast.success("Feedback deleted successfully")
        loadFeedbacks()
      }
    } catch (err) {
      toast.error("Failed to delete feedback")
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )

  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesSearch = (fb.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fb.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 0 || fb.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-8 font-body">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-headline font-bold text-primary mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Student Feedbacks
          </h1>
          <p className="text-secondary">Manage feedbacks and select testimonials for the home page.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-surface-container-lowest p-4 rounded-2xl border border-surface-dim/20 shadow-sm">
          <input
            type="text"
            placeholder="Search by name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-surface-container border border-surface-dim/30 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="bg-surface-container border border-surface-dim/30 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          >
            <option value={0}>All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>
        </div>

        <div className="space-y-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-dim/20">
              <MessageSquare className="w-12 h-12 text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-secondary font-medium">No feedbacks found.</p>
            </div>
          ) : (
            filteredFeedbacks.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-dim/20 flex flex-col md:flex-row justify-between items-start gap-6 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {item.user?.avatar ? (
                        <img src={item.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        item.user?.name?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">{item.user?.name || 'Unknown User'}</h3>
                      <div className="flex text-amber-400">
                        {[...Array(item.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                    </div>
                    <span className="text-xs text-secondary ml-auto">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-on-surface bg-surface-container p-4 rounded-xl text-sm leading-relaxed border border-surface-dim/10">"{item.content}"</p>
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 min-w-[140px]">
                  <button
                    onClick={() => handleToggleDisplay(item.id, item.showOnHome)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold w-full flex items-center justify-center gap-2 transition-all ${
                      item.showOnHome 
                        ? 'bg-error/10 text-error hover:bg-error/20' 
                        : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                    }`}
                  >
                    {item.showOnHome ? (
                      <><XCircle className="w-4 h-4" /> Remove Home</>
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Add to Home</>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container-high text-secondary hover:bg-error hover:text-white transition-all w-full flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
