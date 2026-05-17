import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { toast } from "sonner"
import { Award, Download, BookOpen, Calendar, Loader2, ExternalLink, Shield, Copy, Check } from "lucide-react"

export default function Certificates() {
  return (
    <ProtectedRoute>
      <CertificatesContent />
    </ProtectedRoute>
  )
}

function CertificatesContent() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      const token = StorageService.getToken()
      const res = await api.certificates.getMyCertificates(token)
      if (res.success) {
        setCertificates(res.data || [])
      } else {
        setError(res.message || 'Failed to load certificates')
      }
    } catch (err) {
      setError('Could not connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (cert) => {
    try {
      const token = StorageService.getToken()
      const blob = await api.certificates.download(cert.id, token)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${cert.certificateNumber || cert.id}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed. Please try again.', { duration: 5000 })
    }
  }

  const handleCopyCode = (cert) => {
    navigator.clipboard.writeText(cert.verificationCode || cert.certificateNumber || '')
    setCopiedId(cert.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Award className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-headline font-bold text-primary">Certificates</h1>
            </div>
            <p className="text-on-surface-variant">Your earned course completion certificates.</p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-surface-container-low rounded-2xl border border-surface-dim/20">
            <Award className="w-5 h-5 text-secondary" />
            <span className="font-bold text-primary">{certificates.length} Earned</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-600 p-8 rounded-3xl text-center font-bold">
            {error}
          </div>
        ) : certificates.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <Award className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-4">No Certificates Yet</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-8">
              Complete a course and pass the final quiz to earn your certificate. They will appear here automatically.
            </p>
            <a href="/my-courses" className="inline-flex items-center gap-2 px-8 py-4 signature-gradient text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-opacity">
              <BookOpen className="w-5 h-5" /> Browse My Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {certificates.map(cert => (
              <div key={cert.id} className="group bg-surface-container-lowest border border-surface-dim/20 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                {/* Gold Header */}
                <div className="p-8 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-b border-yellow-500/20 relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-yellow-500/10 blur-2xl" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white shadow-xl mb-4">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-primary leading-tight">
                    {cert.course?.title || 'Course Certificate'}
                  </h3>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-2">Certificate of Completion</p>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      Issued: <strong className="text-primary">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </strong>
                    </span>
                  </div>
                  {cert.quizScore != null && (
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                      <Award className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Final Score: <strong className="text-emerald-600">{cert.quizScore}%</strong></span>
                    </div>
                  )}

                  {/* Verification Code */}
                  {(cert.verificationCode || cert.certificateNumber) && (
                    <div className="px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/10">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Verification Code</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono font-bold text-primary truncate flex-1">{cert.verificationCode || cert.certificateNumber}</p>
                        <button
                          onClick={() => handleCopyCode(cert)}
                          title="Copy code"
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-surface-container-high hover:bg-surface-dim transition-colors"
                        >
                          {copiedId === cert.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Certificate ID (fallback) */}
                  {!cert.verificationCode && !cert.certificateNumber && (
                    <div className="px-4 py-3 bg-surface-container rounded-xl border border-surface-dim/10">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Certificate ID</p>
                      <p className="text-sm font-mono font-bold text-primary truncate">#{cert.id}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleDownload(cert)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 signature-gradient text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <Link
                      to={`/verify-certificate/${cert.verificationCode || cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open verification page"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                    >
                      <Shield className="w-4 h-4" /> Verify
                    </Link>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-surface-dim/20">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/verify-certificate/' + (cert.verificationCode || cert.id))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0077b5]/10 text-[#0077b5] rounded-lg font-bold text-xs hover:bg-[#0077b5]/20 transition-colors"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/verify-certificate/' + (cert.verificationCode || cert.id))}&text=I just earned my certificate for ${encodeURIComponent(cert.course?.title)}!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg font-bold text-xs hover:bg-[#1DA1F2]/20 transition-colors"
                    >
                      Twitter
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=I just earned my certificate for ${encodeURIComponent(cert.course?.title)}! Check it out: ${encodeURIComponent(window.location.origin + '/verify-certificate/' + (cert.verificationCode || cert.id))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#25D366]/10 text-[#25D366] rounded-lg font-bold text-xs hover:bg-[#25D366]/20 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
