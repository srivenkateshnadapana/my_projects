import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Award, CheckCircle2, XCircle, Loader2, User, BookOpen, Calendar, Hash, Star, Shield, ArrowLeft, Copy, Check } from 'lucide-react'
import { api } from '../../services/api'

const API_URL = import.meta.env.VITE_API_URL || 'https://lms-backend-g1cy.onrender.com/api'

export default function VerifyCertificate() {
  const { code } = useParams()
  const [searchParams] = useSearchParams()

  // Allow /verify-certificate?code=ABC or /verify-certificate/ABC
  const verificationCode = code || searchParams.get('code') || ''

  const [inputCode, setInputCode] = useState(verificationCode)
  const [result, setResult] = useState(null)      // { valid, data }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  // Auto-verify if code is in URL
  useEffect(() => {
    if (verificationCode) {
      verifyCert(verificationCode)
    }
  }, [verificationCode])

  const verifyCert = async (codeToVerify) => {
    const trimmed = (codeToVerify || inputCode).trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const json = await api.certificates.verify(trimmed)
      setResult(json)
    } catch (err) {
      setError(err.message || 'Could not connect to the verification server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    verifyCert(inputCode)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <div className="px-8 py-5 border-b border-surface-dim/20 bg-surface-container-lowest flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 signature-gradient rounded-xl flex items-center justify-center text-white shadow">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-headline font-bold text-primary text-lg">LMS · Certificate Verification</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-outline hover:text-primary text-sm font-bold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      {/* Main */}
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl space-y-8">

          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 signature-gradient rounded-3xl flex items-center justify-center text-white shadow-2xl mx-auto">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-headline font-bold text-primary">Verify a Certificate</h1>
            <p className="text-on-surface-variant max-w-md mx-auto">
              Enter the certificate's verification code to confirm its authenticity instantly.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-surface-dim/20 rounded-3xl p-8 shadow-xl space-y-5">
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-2">Verification Code</label>
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. LMS-ABC123XYZ"
                className="w-full px-6 py-4 bg-surface-container rounded-2xl border border-surface-dim/20 text-primary font-mono font-bold text-lg focus:outline-none focus:border-primary/60 transition-colors placeholder:text-outline/40 placeholder:font-sans placeholder:font-normal placeholder:text-base tracking-widest"
                autoFocus={!verificationCode}
              />
              <p className="text-xs text-outline mt-2">The verification code is printed at the bottom of the PDF certificate.</p>
            </div>
            <button
              type="submit"
              disabled={!inputCode.trim() || loading}
              className="w-full py-4 signature-gradient text-white rounded-2xl font-headline font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <><Shield className="w-5 h-5" /> Verify Certificate</>}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-4 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-600">
              <XCircle className="w-6 h-6 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Result: VALID */}
          {result?.valid && (
            <div className="bg-surface-container-lowest border-2 border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl">
              {/* Banner */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 px-8 py-6 flex items-center gap-5 border-b border-emerald-500/20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xl shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">✓ Certificate Verified</p>
                  <h2 className="text-2xl font-headline font-bold text-primary">This certificate is authentic</h2>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                <DetailCard icon={<User className="w-5 h-5" />} label="Student Name" value={result.data.studentName} />
                <DetailCard icon={<BookOpen className="w-5 h-5" />} label="Course Completed" value={result.data.courseTitle} />
                <DetailCard icon={<Calendar className="w-5 h-5" />} label="Issue Date" value={new Date(result.data.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailCard icon={<Star className="w-5 h-5" />} label="Final Score" value={`${result.data.score}%`} valueClass="text-emerald-600" />
                <div className="md:col-span-2">
                  <DetailCard icon={<Hash className="w-5 h-5" />} label="Certificate Number" value={result.data.certificateNumber} mono />
                </div>
              </div>

              {/* Share */}
              <div className="px-8 pb-8">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-3 py-3 bg-surface-container text-primary rounded-2xl font-bold border border-surface-dim/20 hover:bg-surface-dim transition-colors"
                >
                  {copied ? <><Check className="w-4 h-4 text-emerald-500" /> Link Copied!</> : <><Copy className="w-4 h-4" /> Copy Verification Link</>}
                </button>
              </div>
            </div>
          )}

          {/* Result: INVALID */}
          {result && !result.valid && (
            <div className="bg-surface-container-lowest border-2 border-red-500/30 rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-red-500/5 px-8 py-6 flex items-center gap-5 border-b border-red-500/20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center text-white shadow-xl shrink-0">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">✗ Verification Failed</p>
                  <h2 className="text-2xl font-headline font-bold text-primary">Certificate Not Found</h2>
                </div>
              </div>
              <div className="p-8">
                <p className="text-on-surface-variant leading-relaxed">
                  We could not find a certificate matching the code <strong className="font-mono text-primary">{inputCode}</strong>. 
                  Please double-check the code on your PDF certificate and try again.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-outline list-disc list-inside">
                  <li>Codes are case-insensitive but must be entered exactly</li>
                  <li>The code is printed at the bottom of the PDF</li>
                  <li>Contact support if you believe this is an error</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-outline border-t border-surface-dim/10">
        Certificate verification powered by LMS Platform · Instant and tamper-proof
      </div>
    </div>
  )
}

function DetailCard({ icon, label, value, mono, valueClass = 'text-primary' }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-surface-container rounded-2xl border border-surface-dim/10">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{label}</p>
        <p className={`font-bold leading-tight break-all ${mono ? 'font-mono text-sm' : 'text-base'} ${valueClass}`}>{value}</p>
      </div>
    </div>
  )
}
