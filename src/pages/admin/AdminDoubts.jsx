import React, { useState, useEffect } from 'react'
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { toast } from "sonner"
import {
  MessageCircle, Loader2, Clock, CheckCircle2, AlertCircle, Send,
  Filter, User, BookOpen, X, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react"

const STATUS_CONFIG = {
  'open':        { label: 'Open',        color: 'text-blue-600',   bg: 'bg-blue-500/10',   border: 'border-blue-200' },
  'in-progress': { label: 'In Progress', color: 'text-amber-600',  bg: 'bg-amber-500/10',  border: 'border-amber-200' },
  'resolved':    { label: 'Resolved',    color: 'text-emerald-600',bg: 'bg-emerald-500/10',border: 'border-emerald-200' },
  'closed':      { label: 'Closed',      color: 'text-outline',    bg: 'bg-surface-dim/10',border: 'border-surface-dim' },
}

export default function AdminDoubts() {
  return (
    <AdminProtectedRoute>
      <AdminDoubtsContent />
    </AdminProtectedRoute>
  )
}

function AdminDoubtsContent() {
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [responding, setResponding] = useState({}) // {id: bool}
  const [responseText, setResponseText] = useState({}) // {id: string}
  const [statusUpdating, setStatusUpdating] = useState({})
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    setLoading(true)
    setAuthError(false)
    try {
      const token = StorageService.getToken()
      if (!token) {
        setAuthError(true)
        return
      }
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {}

      const [ticketsRes, statsRes] = await Promise.all([
        api.tickets.getAll(token, filters),
        api.tickets.getStats(token)
      ])

      if (ticketsRes.success) setTickets(ticketsRes.data || [])
      if (statsRes.success) setStats(statsRes.data)
    } catch (err) {
      if (err.status === 403) {
        setAuthError(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (ticketId) => {
    const text = responseText[ticketId]?.trim()
    if (!text) return
    setResponding(p => ({ ...p, [ticketId]: true }))
    try {
      const token = StorageService.getToken()
      const res = await api.tickets.respond(ticketId, { adminResponse: text, status: 'resolved' }, token)
      if (res.success) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, adminResponse: text, status: 'resolved', respondedAt: new Date() } : t))
        setResponseText(p => ({ ...p, [ticketId]: '' }))
        setStats(p => ({ ...p, open: Math.max(0, p.open - 1), resolved: p.resolved + 1 }))
      }
    } catch {
      toast.error('Failed to send response.', { duration: 5000 })
    } finally {
      setResponding(p => ({ ...p, [ticketId]: false }))
    }
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    setStatusUpdating(p => ({ ...p, [ticketId]: true }))
    try {
      const token = StorageService.getToken()
      await api.tickets.updateStatus(ticketId, newStatus, token)
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
    } catch {
      toast.error('Failed to update status.', { duration: 5000 })
    } finally {
      setStatusUpdating(p => ({ ...p, [ticketId]: false }))
    }
  }

  const statCards = [
    { label: 'Open',        value: stats.open,       color: 'text-blue-600',    bg: 'bg-blue-500/10' },
    { label: 'In Progress', value: stats.inProgress,  color: 'text-amber-600',   bg: 'bg-amber-500/10' },
    { label: 'Resolved',    value: stats.resolved,    color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Closed',      value: stats.closed,      color: 'text-outline',     bg: 'bg-surface-dim/10' },
  ]

  if (authError) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-20 px-8 flex items-center justify-center">
        <div className="bg-surface-container-lowest border border-red-500/20 rounded-3xl p-12 text-center max-w-lg shadow-xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary mb-3">Session Expired</h2>
          <p className="text-on-surface-variant mb-2">Your admin session is no longer valid.</p>
          <p className="text-sm text-outline mb-8">This usually happens when your login token has expired or was issued before your account was given admin access. Please log out and log back in.</p>
          <button
            onClick={() => { StorageService.logout(); window.location.href = '/login' }}
            className="px-8 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Log Out &amp; Re-Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-headline font-bold text-primary">Doubt Management</h1>
            </div>
            <p className="text-on-surface-variant">Review and resolve student questions and doubts.</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-5 py-3 bg-surface-container rounded-xl font-bold text-primary border border-surface-dim/20 hover:bg-surface-dim transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statCards.map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-surface-dim/10`}>
              <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-4xl font-headline font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all capitalize ${filterStatus === s ? 'signature-gradient text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-surface-dim/20'}`}
            >
              {s === 'all' ? 'All Doubts' : s.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim">
            <MessageCircle className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-2">No Doubts Found</h3>
            <p className="text-on-surface-variant">No tickets match the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => {
              const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG['open']
              const isExpanded = expandedId === ticket.id
              return (
                <div key={ticket.id} className={`bg-surface-container-lowest border rounded-3xl overflow-hidden shadow-md transition-all ${cfg.border} hover:shadow-lg`}>
                  {/* Row Header */}
                  <button
                    className="w-full text-left p-6 flex items-start gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-headline font-bold text-primary text-lg leading-tight">{ticket.subject}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {!ticket.adminResponse && ticket.status === 'open' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 animate-pulse">
                            Needs Reply
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-outline">
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{ticket.user?.name || 'Unknown Student'}</span>
                        {ticket.course && <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{ticket.course.title}</span>}
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-outline shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-outline shrink-0 mt-1" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-surface-dim/20 p-6 space-y-5 bg-surface-container/20">
                      {/* Student Message */}
                      <div className="p-5 bg-surface-container rounded-2xl">
                        <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2">Student's Question</p>
                        <p className="text-primary/80 leading-relaxed">{ticket.message}</p>
                      </div>

                      {/* Status Control */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-outline uppercase tracking-widest">Change Status:</span>
                        {['open', 'in-progress', 'resolved', 'closed'].map(s => (
                          <button
                            key={s}
                            disabled={ticket.status === s || statusUpdating[ticket.id]}
                            onClick={() => handleStatusChange(ticket.id, s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${ticket.status === s ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border ${STATUS_CONFIG[s].border}` : 'bg-surface-container text-outline hover:bg-surface-dim border border-surface-dim/20'}`}
                          >
                            {s.replace('-', ' ')}
                          </button>
                        ))}
                      </div>

                      {/* Existing Response */}
                      {ticket.adminResponse && (
                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Your Response
                          </p>
                          <p className="text-primary leading-relaxed">{ticket.adminResponse}</p>
                          {ticket.respondedAt && (
                            <p className="text-xs text-outline mt-2">
                              Sent on {new Date(ticket.respondedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Reply Box */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-outline uppercase tracking-widest">
                          {ticket.adminResponse ? 'Update Response' : 'Write a Response'}
                        </p>
                        <textarea
                          rows={4}
                          value={responseText[ticket.id] || ''}
                          onChange={e => setResponseText(p => ({ ...p, [ticket.id]: e.target.value }))}
                          placeholder="Type your answer here..."
                          className="w-full px-5 py-4 bg-surface-container rounded-2xl border border-surface-dim/20 text-primary font-medium focus:outline-none focus:border-primary/50 transition-colors placeholder:text-outline/50 resize-none"
                        />
                        <button
                          onClick={() => handleRespond(ticket.id)}
                          disabled={!responseText[ticket.id]?.trim() || responding[ticket.id]}
                          className="flex items-center gap-2 px-8 py-3 signature-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
                        >
                          {responding[ticket.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send Response & Mark Resolved
                        </button>
                      </div>
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
