import React from 'react'
import { ProtectedRoute } from "../../context/ProtectedRoute"
import { Gift } from "lucide-react"
import { StorageService } from "../../services/storage"
import { api } from "../../services/api"
import { toast } from "sonner"

export default function Referral() {
  const [user, setUser] = React.useState(StorageService.getUser())

  React.useEffect(() => {
    const refreshUser = async () => {
      try {
        const token = StorageService.getToken()
        if (token) {
          const res = await api.auth.getMe(token)
          if (res.success && res.data) {
            StorageService.updateUser(res.data)
            setUser(res.data)
          }
        }
      } catch (error) {
        console.error("Failed to refresh user", error)
      }
    }
    refreshUser()

    const handleAuthUpdate = () => {
      setUser(StorageService.getUser())
    }
    window.addEventListener('storage-update-lms_auth', handleAuthUpdate)
    return () => window.removeEventListener('storage-update-lms_auth', handleAuthUpdate)
  }, [])

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const referralLink = user?.referralCode ? `${baseUrl}/register?ref=${user.referralCode}` : 'Link not available'

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(referralLink)
      toast.success('Referral link copied to clipboard!', { duration: 5000 })
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface pt-24 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-headline font-bold text-primary">Refer & Earn</h1>
              </div>
              <p className="text-on-surface-variant">Invite friends and earn rewards for every successful enrollment.</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[3rem] p-16 text-center border-2 border-dashed border-surface-dim shadow-inner">
            <Gift className="w-16 h-16 text-surface-dim mx-auto mb-6" />
            <h3 className="text-2xl font-headline font-bold text-primary mb-4">Your Referral Stats</h3>
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
              <div className="bg-amber-500/10 text-amber-600 px-6 py-4 rounded-2xl border border-amber-500/20 font-bold flex flex-col items-center">
                <span className="text-sm uppercase tracking-widest opacity-80">Your Coins</span>
                <span className="text-4xl font-headline mt-1">{user?.coins || 0}</span>
              </div>
              <p className="text-secondary max-w-sm text-sm">
                Earn 10% of your friend's purchase price as coins when they buy a course using your link!
              </p>
            </div>
            
            <div className="max-w-xl mx-auto space-y-4">
              <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between border border-surface-dim/20 gap-4 overflow-hidden">
                <span className="text-primary font-mono text-sm  truncate">{referralLink}</span>
                <button onClick={handleCopy} className="text-xs font-bold bg-primary text-on-primary px-6 py-3 rounded-lg hover:opacity-90 shrink-0">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
