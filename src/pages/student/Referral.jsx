import React from "react";
import { ProtectedRoute } from "../../context/ProtectedRoute";
import { Gift, Send, Users, CheckCircle, Clock, Copy } from "lucide-react";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";
import { toast } from "sonner";

export default function Referral() {
  const [user, setUser] = React.useState(StorageService.getUser());
  const [referredEmail, setReferredEmail] = React.useState("");
  const [referralsList, setReferralsList] = React.useState([]);
  const [isInviting, setIsInviting] = React.useState(false);

  const loadReferrals = React.useCallback(async () => {
    try {
      const token = StorageService.getToken();
      if (token) {
        const res = await api.referrals.getMyReferrals(token);
        if (res && res.success) {
          setReferralsList(res.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching referrals", err);
    }
  }, []);

  React.useEffect(() => {
    const refreshUser = async () => {
      try {
        const token = StorageService.getToken();
        if (token) {
          const res = await api.auth.getMe(token);
          if (res.success && res.user) {
            StorageService.updateUser(res.user);
            setUser(res.user);
          }
        }
      } catch (error) {
        console.error("Failed to refresh user", error);
      }
    };
    refreshUser();
    loadReferrals();

    const handleAuthUpdate = () => {
      setUser(StorageService.getUser());
    };
    window.addEventListener("storage-update-lms_auth", handleAuthUpdate);
    return () =>
      window.removeEventListener("storage-update-lms_auth", handleAuthUpdate);
  }, [loadReferrals]);

  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const referralCode =
    user?.referralCode || user?.id?.substring(0, 8) || "STAR500";
  const referralLink = `${baseUrl}/auth/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!", { duration: 5000 });
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!referredEmail.trim() || !referredEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsInviting(true);
    try {
      const token = StorageService.getToken();
      const res = await api.referrals.createReferral(referredEmail, token);
      if (res && res.success) {
        toast.success(`Invitation sent successfully to ${referredEmail}!`);
        setReferredEmail("");
        loadReferrals();
      }
    } catch (err) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 signature-gradient rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Gift className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-headline font-bold text-primary">
                  Refer & Earn
                </h1>
              </div>
              <p className="text-on-surface-variant">
                Invite colleagues to StarLMS and earn Star Coins for every
                successful enrollment.
              </p>
            </div>
            <div className="bg-amber-500/10 text-amber-500 px-6 py-3 rounded-2xl border border-amber-500/20 font-bold flex items-center gap-3 shadow-sm">
              <span className="text-xs uppercase tracking-wider opacity-80">
                Coin Treasury:
              </span>
              <span className="text-2xl font-headline">
                {user?.coins || 0} ★
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Invite Box */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-surface-dim/20 shadow-xl space-y-6">
              <h3 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                <Send className="w-5 h-5" /> Send Direct Email Invitation
              </h3>
              <form onSubmit={handleSendInvite} className="flex gap-3">
                <input
                  type="email"
                  value={referredEmail}
                  onChange={(e) => setReferredEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="flex-1 bg-surface-container text-on-surface text-sm px-4 py-3 rounded-xl border border-primary/20 outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-6 py-3 signature-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition active:scale-95 flex items-center gap-2"
                >
                  {isInviting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Invite</span>
                </button>
              </form>

              <div className="border-t border-surface-dim/20 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                  Or Share Your Unique Referral Link
                </h4>
                <div className="p-4 bg-surface-container rounded-xl flex items-center justify-between border border-primary/20 gap-4 overflow-hidden shadow-inner">
                  <span className="text-primary font-mono text-xs sm:text-sm truncate">
                    {referralLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-bold bg-primary text-on-primary px-5 py-2.5 rounded-lg hover:opacity-90 shrink-0 shadow flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant italic">
                  Earn ₹500 equivalent in Star Coins instantly upon your
                  referral's first verified purchase.
                </p>
              </div>
            </div>

            {/* Referrals Status List */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-dim/20 shadow-xl flex flex-col min-h-[350px]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-dim/20 pb-4">
                <h3 className="text-lg font-headline font-bold text-primary flex items-center gap-2">
                  <Users className="w-5 h-5" /> Tracked Referrals
                </h3>
                <span className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold">
                  {referralsList.length} Total
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {referralsList.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-on-surface-variant italic py-12">
                    <Users className="w-12 h-12 opacity-30 mb-2" />
                    <p className="text-sm font-bold">No invites sent yet.</p>
                    <p className="text-xs opacity-70">
                      Enter an email on the left to start earning!
                    </p>
                  </div>
                ) : (
                  referralsList.map((refItem) => (
                    <div
                      key={refItem.id || refItem.referred_email}
                      className="p-3.5 bg-surface-container rounded-2xl border border-surface-dim/10 flex items-center justify-between shadow-sm"
                    >
                      <div className="truncate pr-2">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {refItem.referred_email}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          Invited{" "}
                          {new Date(
                            refItem.created_at || Date.now(),
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      {refItem.status === "completed" ||
                      refItem.status === "enrolled" ? (
                        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Enrolled (+500
                          ★)
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />{" "}
                          Pending
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
