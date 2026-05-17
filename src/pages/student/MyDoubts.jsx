import React, { useState, useEffect } from 'react'
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { toast } from "sonner"
import { MessageCircle, Plus, Loader2, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, BookOpen, X } from "lucide-react"

const STATUS_CONFIG = {
  'open':        { label: 'Open',        color: 'text-blue-600',   bg: 'bg-blue-500/10',   icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'in-progress': { label: 'In Progress', color: 'text-amber-600',  bg: 'bg-amber-500/10',  icon: <Clock className="w-3.5 h-3.5" /> },
  'resolved':    { label: 'Resolved',    color: 'text-emerald-600',bg: 'bg-emerald-500/10',icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  'closed':      { label: 'Closed',      color: 'text-outline',    bg: 'bg-surface-dim/20',icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
}

export default function MyDoubts() {
  return (
    <ProtectedRoute>
      <MyDoubtsContent />
    </ProtectedRoute>
  )
}

function MyDoubtsContent() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ subject: '', message: '', courseId: '' })
  const [myCourses, setMyCourses] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = StorageService.getToken()
      const [ticketsRes, coursesRes] = await Promise.all([
        api.tickets.getMy(token),
        api.courses.getMyCourses(token)
      ])
      if (ticketsRes.success) setTickets(ticketsRes.data || [])
      if (coursesRes.success) setMyCourses(coursesRes.data || [])
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.message.trim()) return
    setSubmitting(true)
    try {
      const token = StorageService.getToken()
      const res = await api.tickets.create({
        subject: form.subject,
        message: form.message,
        courseId: form.courseId || null
      }, token)
      if (res.success) {
        setTickets(prev => [res.data, ...prev])
        setForm({ subject: '', message: '', courseId: '' })
        setShowForm(false)
        toast.success('Your question has been submitted!', { duration: 5000 })
      } else {
        toast.error(res.message || 'Failed to post doubt.', { duration: 5000 })
      }
    } catch {
      toast.error('Server error. Please try again.', { duration: 5000 })
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-headline font-bold text-primary">My Doubts</h1>
            </div>
            <p className="text-on-surface-variant">Ask questions and get answers from instructors.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 signature-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" /> Ask a Question
          </button>
        </div>

        {/* Ask Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-surface-container-lowest w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-surface-dim/20 overflow-hidden">
              <div className="flex items-center justify-between p-8 border-b border-surface-dim/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-primary">Ask a Question</h2>
                    <p className="text-sm text-on-surface-variant">Our team will respond within 24 hours.</p>
                  </div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-dim transition-colors">
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {myCourses.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Related Course (Optional)</label>
                    <select
                      value={form.courseId}
                      onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                      className="w-full px-5 py-4 bg-surface-container rounded-2xl border border-surface-dim/20 text-primary font-medium focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="">-- Select a course --</option>
                      {myCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. How do closures work in JavaScript?"
                    className="w-full px-5 py-4 bg-surface-container rounded-2xl border border-surface-dim/20 text-primary font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-outline/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Question *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Describe your question in detail..."
                    className="w-full px-5 py-4 bg-surface-container rounded-2xl border border-surface-dim/20 text-primary font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-outline/50 resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 rounded-2xl bg-surface-container text-primary font-bold border border-surface-dim/20 hover:bg-surface-dim transition-colors">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 rounded-2xl signature-gradient text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg">
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Post Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${filter === s ? 'signature-gradient text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-surface-dim/20'}`}
            >
              {s === 'all' ? `All (${tickets.length})` : s.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <MessageCircle className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-4">No Doubts Found</h3>
            <p className="text-on-surface-variant">
              {filter === 'all' ? "You haven't raised any doubts yet." : `No doubts with "${filter}" status.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ticket => {
              const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG['open']
              const isExpanded = expandedId === ticket.id
              return (
                <div key={ticket.id} className="bg-surface-container-lowest border border-surface-dim/20 rounded-3xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <button
                    className="w-full text-left p-6 flex items-start gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="font-headline font-bold text-primary text-lg leading-tight">{ticket.subject}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}{cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-outline">
                        {ticket.course && (
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            {ticket.course.title}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-outline shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-outline shrink-0 mt-1" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-surface-dim/20 p-6 space-y-5 bg-surface-container/30">
                      {/* Your Question */}
                      <div className="p-5 bg-surface-container rounded-2xl">
                        <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2">Your Question</p>
                        <p className="text-primary/80 leading-relaxed">{ticket.message}</p>
                      </div>

                      {/* Admin Response */}
                      {ticket.adminResponse ? (
                        <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 rounded-2xl">
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Instructor Response
                          </p>
                          <p className="text-primary leading-relaxed">{ticket.adminResponse}</p>
                          {ticket.respondedAt && (
                            <p className="text-xs text-outline mt-3">
                              Answered on {new Date(ticket.respondedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Response
                          </p>
                          <p className="text-sm text-on-surface-variant">Our team is reviewing your question. You'll be notified once it's answered.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
