// src/pages/student/Settings.jsx
import * as React from "react";
import { ProtectedRoute } from "../../context/ProtectedRoute";
import { StorageService } from "../../services/storage";
import { api } from "../../services/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Play,
  CreditCard,
  Sliders,
  Save,
  Check,
  Laptop,
  Smartphone,
  Globe,
  Key,
  RefreshCw,
  Download,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Zap,
  Terminal,
  Activity,
} from "lucide-react";

export default function Settings() {
  return (
    <ProtectedRoute fallbackPath="/auth">
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const [user, setUser] = React.useState(
    StorageService.getUser() || {
      name: "Student",
      email: "student@starlms.in",
    },
  );
  const [activeTab, setActiveTab] = React.useState("general");
  const [isSaving, setIsSaving] = React.useState(false);

  // State for General Profile
  const [fullName, setFullName] = React.useState(
    user.full_name || user.name || "",
  );
  const [bio, setBio] = React.useState(
    user.bio || "Computer Science Student",
  );
  const [phone, setPhone] = React.useState(user.phone || "+91 98765 43210");
  const [timezone, setTimezone] = React.useState(
    user.timezone || "Asia/Kolkata (IST)",
  );
  const [language, setLanguage] = React.useState(
    user.language || "English (India)",
  );
  const [institution, setInstitution] = React.useState(
    user.institution || "Delhi Technological University",
  );

  // State for Notifications
  const [notifications, setNotifications] = React.useState(() => {
    const saved = localStorage.getItem("lms_settings_notifications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      emailAnnouncements: true,
      slaDeadlines: true,
      quizGrades: true,
      communityMentions: false,
      pushStreaks: true,
      weeklyDigest: true,
    };
  });

  // State for Playback & Accessibility
  const [playback, setPlayback] = React.useState(() => {
    const saved = localStorage.getItem("lms_settings_playback");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      defaultQuality: "1080p",
      defaultSpeed: "1.25x",
      autoplayNext: true,
      highContrastCaptions: false,
      fontSize: "Medium",
    };
  });

  // State for Security passwords & sessions
  const [passwords, setPasswords] = React.useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(() => {
    return localStorage.getItem("lms_settings_2fa") === "true";
  });
  const [showTwoFactorModal, setShowTwoFactorModal] = React.useState(false);

  const [sessions, setSessions] = React.useState([
    {
      id: "sess-1",
      device: "Chrome on Windows 11",
      location: "Bengaluru, Karnataka (IP: 192.168.1.42)",
      current: true,
      lastActive: "Active Now",
    },
    {
      id: "sess-2",
      device: "Safari on MacBook Pro",
      location: "Noida, Uttar Pradesh (IP: 172.16.254.1)",
      current: false,
      lastActive: "2 hours ago",
    },
    {
      id: "sess-3",
      device: "STAR LMS Mobile App (iOS)",
      location: "Mumbai, Maharashtra (IP: 10.0.0.12)",
      current: false,
      lastActive: "Yesterday",
    },
  ]);

  // State for Billing invoices
  const invoices = [
    {
      id: "INV-2026-004",
      date: "May 01, 2026",
      amount: "₹4,999",
      plan: "Full Course Access Pass",
      status: "Paid",
    },
    {
      id: "INV-2026-003",
      date: "Apr 01, 2026",
      amount: "₹4,999",
      plan: "Full Course Access Pass",
      status: "Paid",
    },
    {
      id: "INV-2026-002",
      date: "Mar 01, 2026",
      amount: "₹4,999",
      plan: "Full Course Access Pass",
      status: "Paid",
    },
  ];

  // State for Admin configuration
  const [adminSettings, setAdminSettings] = React.useState(() => {
    const saved = localStorage.getItem("lms_settings_admin");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      maintenanceMode: false,
      apiKey: "starlms_live_89f2a893bc019de44a7",
      autoEnrollmentApproval: true,
      strictRateLimiting: true,
    };
  });

  const saveGeneralProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updates = {
        full_name: fullName,
        name: fullName,
        bio,
        phone,
        timezone,
        language,
        institution,
      };
      StorageService.updateUser(updates);
      setUser({ ...user, ...updates });
      setIsSaving(false);
      toast.success("Profile updated successfully!");
    }, 600);
  };

  const toggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("lms_settings_notifications", JSON.stringify(updated));
    toast.success("Notification settings updated");
  };

  const updatePlaybackSetting = (key, value) => {
    const updated = { ...playback, [key]: value };
    setPlayback(updated);
    localStorage.setItem("lms_settings_playback", JSON.stringify(updated));
    toast.success("Video settings updated");
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) {
      toast.error("Please fill in current and new passwords.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      const token = StorageService.getToken();
      await api.auth.changePassword(passwords.current, passwords.new, token);
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(err.message || "Failed to update password.");
    }
  };

  const toggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    localStorage.setItem("lms_settings_2fa", nextState ? "true" : "false");
    if (nextState) {
      setShowTwoFactorModal(true);
    } else {
      toast.warning("Two-Factor Authentication (2FA) deactivated.");
    }
  };

  const revokeSession = (id) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success("Device logged out successfully.");
  };

  const downloadInvoice = (invId) => {
    toast.success(
      `Invoice PDF download started for ${invId}.`,
    );
  };

  const toggleAdminSetting = (key) => {
    const updated = { ...adminSettings, [key]: !adminSettings[key] };
    setAdminSettings(updated);
    localStorage.setItem("lms_settings_admin", JSON.stringify(updated));
    toast.success(`System setting [${key}] updated.`);
  };

  const regenerateApiKey = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "starlms_live_";
    for (let i = 0; i < 20; i++)
      token += chars[Math.floor(Math.random() * chars.length)];
    const updated = { ...adminSettings, apiKey: token };
    setAdminSettings(updated);
    localStorage.setItem("lms_settings_admin", JSON.stringify(updated));
    toast.success("New API Key generated successfully.");
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: User },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell },
    { id: "playback", label: "Video Playback", icon: Play },
    { id: "security", label: "Password & Security", icon: Shield },
    { id: "billing", label: "Subscriptions & Billing", icon: CreditCard },
  ];

  if (user?.role === "admin") {
    tabs.push({ id: "admin", label: "Admin Portal", icon: Terminal });
  }

  return (
    <main className="min-h-screen bg-surface pt-24 pb-24 px-4 sm:px-8 relative overflow-hidden transition-all duration-300">
      {/* Cyber Grid Background Ambient */}
      <div className="absolute inset-0 cyber-grid-bg opacity-25 pointer-events-none" />
      <div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow"
        style={{ animationDuration: "10s" }}
      />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Shard */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 cyber-glass p-8 sm:p-10 rounded-[3rem] border border-primary/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 via-transparent to-transparent pointer-events-none" />
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(0,85,255,0.2)]">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Settings Panel</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-headline font-black text-on-surface dark:text-white tracking-tight mb-2">
              Account <span className="hologram-text">Settings</span>
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg font-medium max-w-2xl">
              Configure your student profile, notification preferences, playback settings, and security passwords.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hi-tech-panel px-6 py-4 rounded-2xl border border-primary/40 bg-background/80 backdrop-blur flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl signature-gradient flex items-center justify-center text-white shadow-md font-headline font-bold text-xl">
                {fullName.substring(0, 2).toUpperCase() || "ST"}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                  {user?.role === "admin"
                    ? "System Administrator"
                    : "Verified Student"}
                </p>
                <p className="text-on-surface dark:text-white font-headline font-black text-lg truncate max-w-[150px] sm:max-w-[200px]">
                  {fullName || user?.name || "Student"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid: Left Navigation & Right Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Tabs (Col 4) */}
          <div className="lg:col-span-4 flex flex-col gap-3 cyber-glass p-4 sm:p-6 rounded-[2.5rem] border border-primary/20 shadow-xl">
            <div className="px-4 py-2 mb-2">
              <span className="text-[10px] font-mono font-extrabold text-secondary uppercase tracking-[0.3em] block">
                Settings Navigation
              </span>
            </div>

            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-mono text-sm font-bold transition-all duration-300 group ${
                    isActive
                      ? "signature-gradient text-white shadow-[0_0_20px_rgba(0,85,255,0.4)] scale-[1.02]"
                      : "cyber-glass text-on-surface hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl transition-all ${isActive ? "bg-white/20 text-white shadow-inner" : "bg-primary/10 text-primary group-hover:scale-110"}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="tracking-wide uppercase">{t.label}</span>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${isActive ? "bg-white animate-pulse" : "bg-transparent group-hover:bg-primary/50"}`}
                  />
                </button>
              );
            })}

            <div className="mt-6 pt-6 border-t border-primary/20 px-4">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-xl pointer-events-none" />
                <Sparkles
                  className="w-6 h-6 text-primary mx-auto mb-2 animate-bounce"
                  style={{ animationDuration: "3s" }}
                />
                <h4 className="font-mono text-xs font-bold text-on-surface dark:text-white uppercase tracking-widest mb-1">
                  Active Student Profile
                </h4>
                <p className="text-[10px] font-mono text-secondary">
                  Your profile is verified and active.
                </p>
              </div>
            </div>
          </div>

          {/* Configuration Content Area (Col 8) */}
          <div className="lg:col-span-8 cyber-glass p-6 sm:p-10 rounded-[3rem] border border-primary/30 shadow-2xl relative">
            <AnimatePresence mode="wait">
              {/* TAB 1: GENERAL PARAMETERS */}
              {activeTab === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center border-b border-primary/20 pb-5">
                    <div>
                      <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                        <User className="w-6 h-6 text-primary animate-pulse" />
                        <span>General Settings</span>
                      </h2>
                      <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                        Update your personal profile details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        Registered Email Address
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user.email}
                        className="w-full px-4 py-3.5 bg-surface-container/60 border border-surface-dim rounded-2xl font-mono text-sm text-on-surface-variant cursor-not-allowed opacity-70 shadow-inner"
                      />
                      <span className="text-[10px] font-mono text-primary block mt-1">
                        Email verified successfully
                      </span>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        About Yourself / Bio
                      </label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Computer Science Student"
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        College / Institution
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="College / University Name"
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      >
                        <option value="Asia/Kolkata (IST)">
                          Asia/Kolkata (IST)
                        </option>
                        <option value="America/Los_Angeles (PST)">
                          America/Los_Angeles (PST)
                        </option>
                        <option value="America/New_York (EST)">
                          America/New_York (EST)
                        </option>
                        <option value="Europe/London (GMT)">
                          Europe/London (GMT)
                        </option>
                        <option value="Asia/Tokyo (JST)">
                          Asia/Tokyo (JST)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                        Preferred Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                      >
                        <option value="English (India)">English (India)</option>
                        <option value="English (US)">English (US)</option>
                        <option value="Spanish (ES)">Español (ES)</option>
                        <option value="French (FR)">Français (FR)</option>
                        <option value="German (DE)">Deutsch (DE)</option>
                        <option value="Japanese (JP)">日本語 (JP)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-primary/20 flex justify-end">
                    <button
                      onClick={saveGeneralProfile}
                      disabled={isSaving}
                      className="px-8 py-4 signature-gradient text-white font-mono font-extrabold text-sm uppercase tracking-widest rounded-2xl shadow-[0_0_25px_rgba(0,85,255,0.5)] hover:scale-105 transition-all active:scale-95 flex items-center gap-2.5 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: TELEMETRY & ALERTS */}
              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="border-b border-primary/20 pb-5">
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                      <Bell
                        className="w-6 h-6 text-primary animate-bounce"
                        style={{ animationDuration: "2s" }}
                      />
                      <span>Notifications & Alerts</span>
                    </h2>
                    <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                      Manage your email and push notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "emailAnnouncements",
                        title: "Course Announcements",
                        desc: "Receive immediate email notifications on newly released courses, workshops, and syllabus updates.",
                      },
                      {
                        key: "slaDeadlines",
                        title: "Course Expiry Warnings",
                        desc: "Get alerts 7 days before your course access expires or subscription renews.",
                      },
                      {
                        key: "quizGrades",
                        title: "Assessment & Quiz Results",
                        desc: "Receive automatic results and performance analysis emails right after completing a quiz.",
                      },
                      {
                        key: "communityMentions",
                        title: "Doubt Support & Discussions",
                        desc: "Get notified when instructors or peers answer your questions or mention you in forums.",
                      },
                      {
                        key: "pushStreaks",
                        title: "Daily Learning Reminders",
                        desc: "Daily reminders to help you maintain your study streak.",
                      },
                      {
                        key: "weeklyDigest",
                        title: "Weekly Progress Report",
                        desc: "Receive a weekly summary of your quiz performance, course progress, and study hours.",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="p-5 cyber-glass rounded-2xl border border-primary/20 flex items-center justify-between gap-6 hover:border-primary/50 transition-all"
                      >
                        <div className="flex-1">
                          <h4 className="font-headline font-bold text-on-surface dark:text-white text-base leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs font-mono text-secondary mt-1">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleNotification(item.key)}
                          className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${
                            notifications[item.key]
                              ? "bg-primary shadow-[0_0_15px_rgba(0,85,255,0.6)]"
                              : "bg-surface-container-high border border-surface-dim"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                              notifications[item.key]
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: STREAM & PLAYBACK */}
              {activeTab === "playback" && (
                <motion.div
                  key="playback"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="border-b border-primary/20 pb-5">
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                      <Play className="w-6 h-6 text-primary animate-pulse" />
                      <span>Video Playback Settings</span>
                    </h2>
                    <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                      Adjust video quality and playback speed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3 cyber-glass p-6 rounded-3xl border border-primary/20">
                      <label className="text-xs font-mono font-bold text-on-surface dark:text-white uppercase tracking-wider block">
                        Default Resolution
                      </label>
                      <p className="text-xs font-mono text-secondary mb-3">
                        Choose your default streaming quality.
                      </p>
                      <select
                        value={playback.defaultQuality}
                        onChange={(e) =>
                          updatePlaybackSetting(
                            "defaultQuality",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-inner"
                      >
                        <option value="4K (Ultra HD)">
                          4K (Ultra HD)
                        </option>
                        <option value="1080p">
                          1080p (Full HD)
                        </option>
                        <option value="720p">720p (HD)</option>
                        <option value="Auto (Adaptive)">
                          Auto (Adaptive)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-3 cyber-glass p-6 rounded-3xl border border-primary/20">
                      <label className="text-xs font-mono font-bold text-on-surface dark:text-white uppercase tracking-wider block">
                        Default Playback Speed
                      </label>
                      <p className="text-xs font-mono text-secondary mb-3">
                        Choose your default video playback speed.
                      </p>
                      <select
                        value={playback.defaultSpeed}
                        onChange={(e) =>
                          updatePlaybackSetting("defaultSpeed", e.target.value)
                        }
                        className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-inner"
                      >
                        <option value="1.0x">
                          1.0x (Normal)
                        </option>
                        <option value="1.25x">1.25x</option>
                        <option value="1.5x">1.5x</option>
                        <option value="2.0x">2.0x</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 cyber-glass rounded-2xl border border-primary/20 flex items-center justify-between gap-6">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface dark:text-white text-base">
                          Autoplay Next Video
                        </h4>
                        <p className="text-xs font-mono text-secondary mt-1">
                          Automatically play the next lecture or video when the current
                          one finishes.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updatePlaybackSetting(
                            "autoplayNext",
                            !playback.autoplayNext,
                          )
                        }
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${
                          playback.autoplayNext
                            ? "bg-primary shadow-[0_0_15px_rgba(0,85,255,0.6)]"
                            : "bg-surface-container-high border border-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            playback.autoplayNext
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-5 cyber-glass rounded-2xl border border-primary/20 flex items-center justify-between gap-6">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface dark:text-white text-base">
                          High-Contrast Captions
                        </h4>
                        <p className="text-xs font-mono text-secondary mt-1">
                          Enable high-contrast backgrounds for subtitles to make them easier to read.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          updatePlaybackSetting(
                            "highContrastCaptions",
                            !playback.highContrastCaptions,
                          )
                        }
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative ${
                          playback.highContrastCaptions
                            ? "bg-primary shadow-[0_0_15px_rgba(0,85,255,0.6)]"
                            : "bg-surface-container-high border border-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            playback.highContrastCaptions
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: SECURITY & ACCESS */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-10"
                >
                  <div className="border-b border-primary/20 pb-5">
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary animate-pulse" />
                      <span>Password & Security Settings</span>
                    </h2>
                    <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                      Manage your account password, active sessions, and two-factor verification
                    </p>
                  </div>

                  {/* Multi-Factor Authentication */}
                  <div className="p-8 hi-tech-panel rounded-3xl border border-primary/40 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white leading-tight">
                          Two-Factor Authentication (2FA)
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-secondary max-w-lg">
                        Requires a security verification code from an authenticator app (like Google Authenticator or Authy) when you log in.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span
                           className={`w-2.5 h-2.5 rounded-full ${twoFactorEnabled ? "bg-success animate-ping" : "bg-warning"}`}
                        />
                        <span
                          className={`text-xs font-mono font-extrabold uppercase tracking-widest ${twoFactorEnabled ? "text-success" : "text-warning"}`}
                        >
                          {twoFactorEnabled
                            ? "2FA Enabled"
                            : "2FA Disabled"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={toggle2FA}
                      className={`px-6 py-3.5 rounded-2xl font-mono text-xs font-extrabold uppercase tracking-widest transition-all shadow-lg ${
                        twoFactorEnabled
                          ? "bg-error/20 border border-error text-error hover:bg-error hover:text-white shadow-[0_0_15px_rgba(255,0,0,0.3)]"
                          : "signature-gradient text-white shadow-[0_0_20px_rgba(0,85,255,0.5)] hover:scale-105 active:scale-95"
                      }`}
                    >
                      {twoFactorEnabled ? "Deactivate 2FA" : "Set Up 2FA"}
                    </button>
                  </div>

                  {/* Update Access Key (Password) */}
                  <form
                    onSubmit={handleUpdatePassword}
                    className="space-y-6 cyber-glass p-8 rounded-3xl border border-primary/20"
                  >
                    <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <span>Change Password</span>
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                          Current Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              current: e.target.value,
                            })
                          }
                          placeholder="••••••••••••"
                          className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-inner"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                            New Password
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwords.new}
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                new: e.target.value,
                              })
                            }
                            placeholder="••••••••••••"
                            className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-inner"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold text-secondary uppercase tracking-wider block">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={passwords.confirm}
                            onChange={(e) =>
                              setPasswords({
                                ...passwords,
                                confirm: e.target.value,
                              })
                            }
                            placeholder="••••••••••••"
                            className="w-full px-4 py-3.5 bg-background/90 border border-primary/30 rounded-2xl font-mono text-sm text-on-surface focus:outline-none focus:border-primary shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs font-mono text-primary flex items-center gap-2 hover:underline"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span>
                          {showPassword ? "Hide Passwords" : "Show Passwords"}
                        </span>
                      </button>

                      <button
                        type="submit"
                        className="px-8 py-3.5 signature-gradient text-white font-mono font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,85,255,0.4)] hover:scale-105 active:scale-95 transition-all"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white flex items-center gap-2">
                      <Laptop className="w-5 h-5 text-primary" />
                      <span>Active Logged-in Devices</span>
                    </h3>
                    <p className="text-xs font-mono text-secondary mb-4">
                      Devices currently logged into your account.
                    </p>

                    <div className="space-y-3">
                      {sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="cyber-glass p-5 rounded-2xl border border-primary/20 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary border border-primary/30 rounded-xl">
                              {sess.device.includes("Mobile") ? (
                                <Smartphone className="w-6 h-6" />
                              ) : (
                                <Laptop className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-headline font-bold text-on-surface dark:text-white text-base">
                                  {sess.device}
                                </h4>
                                {sess.current && (
                                  <span className="bg-success/20 text-success border border-success/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold tracking-widest uppercase shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                                    Current Device
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-mono text-secondary mt-1">
                                {sess.location}
                              </p>
                              <p className="text-[10px] font-mono text-primary mt-0.5">
                                Last active: {sess.lastActive}
                              </p>
                            </div>
                          </div>

                          {!sess.current && (
                            <button
                              onClick={() => revokeSession(sess.id)}
                              className="px-4 py-2 bg-error/10 border border-error/30 text-error hover:bg-error hover:text-white rounded-xl text-xs font-mono uppercase tracking-widest transition-all shadow-sm"
                            >
                              Logout Device
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: BILLING & TIERS */}
              {activeTab === "billing" && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="border-b border-primary/20 pb-5">
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-primary animate-pulse" />
                      <span>Subscription & Invoices</span>
                    </h2>
                    <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                      Review your subscription plan and billing history
                    </p>
                  </div>

                  {/* Active Plan Card */}
                  <div className="p-8 hi-tech-panel rounded-3xl border border-primary/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
                    <div>
                      <span className="bg-primary/20 text-primary border border-primary/40 px-3.5 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-widest uppercase shadow-[0_0_15px_rgba(0,85,255,0.3)]">
                        Course Access Plan
                      </span>
                      <h3 className="text-3xl font-headline font-black text-on-surface dark:text-white mt-3 mb-1">
                        Full Access Course Pass
                      </h3>
                      <p className="text-xs font-mono text-secondary max-w-md leading-relaxed">
                        Unlimited access to all video lectures, live mentoring sessions, and practice code exercises.
                      </p>
                      <p className="text-xs font-mono text-primary mt-4 flex items-center gap-2 font-bold">
                        <Check className="w-4 h-4 text-success" /> Auto-renews
                        June 01, 2026
                      </p>
                    </div>

                    <div className="shrink-0 text-left md:text-right">
                      <p className="text-4xl font-headline font-black text-on-surface dark:text-white">
                        ₹4,999
                        <span className="text-sm font-mono text-secondary font-normal">
                          /mo
                        </span>
                      </p>
                      <button className="mt-4 px-6 py-3.5 signature-gradient text-white rounded-2xl font-mono text-xs font-extrabold tracking-widest uppercase shadow-[0_0_25px_rgba(0,85,255,0.4)] hover:scale-105 active:scale-95 transition-all">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>

                  {/* Saved Payment Method */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white">
                      Payment Method
                    </h3>
                    <div className="cyber-glass p-6 rounded-3xl border border-primary/20 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-headline font-black italic shadow-md">
                          VISA
                        </div>
                        <div>
                          <p className="font-headline font-bold text-on-surface dark:text-white text-base">
                            •••• •••• •••• 4242
                          </p>
                          <p className="text-xs font-mono text-secondary mt-0.5">
                            Expires 12/28
                          </p>
                        </div>
                      </div>
                      <span className="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest font-bold">
                        Default Card
                      </span>
                    </div>
                  </div>

                  {/* Invoice Logs */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white">
                      Invoice History
                    </h3>
                    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-background/50 backdrop-blur">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-primary/20 bg-primary/10 text-primary">
                            <th className="p-4 font-bold uppercase tracking-wider">
                              Invoice ID
                            </th>
                            <th className="p-4 font-bold uppercase tracking-wider">
                              Date
                            </th>
                            <th className="p-4 font-bold uppercase tracking-wider">
                              Course Plan
                            </th>
                            <th className="p-4 font-bold uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="p-4 font-bold uppercase tracking-wider text-right">
                              Download Invoice
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {invoices.map((inv) => (
                            <tr
                              key={inv.id}
                              className="hover:bg-primary/5 transition-colors"
                            >
                              <td className="p-4 font-extrabold text-on-surface dark:text-white">
                                {inv.id}
                              </td>
                              <td className="p-4 text-secondary">{inv.date}</td>
                              <td className="p-4 text-secondary">{inv.plan}</td>
                              <td className="p-4 font-bold text-on-surface dark:text-white">
                                {inv.amount}
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => downloadInvoice(inv.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-primary/20 hover:text-primary text-secondary rounded-lg transition-all border border-surface-dim"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>PDF</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: NEXUS ADMIN CONSOLE */}
              {activeTab === "admin" && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  <div className="border-b border-primary/20 pb-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/20 border border-error/40 text-error rounded-full text-xs font-mono font-bold uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                      <span>System Controls</span>
                    </div>
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface dark:text-white flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-primary animate-pulse" />
                      <span>Admin Control Panel</span>
                    </h2>
                    <p className="text-xs font-mono text-secondary uppercase tracking-widest mt-1">
                      Manage platform-wide settings and administrative actions
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="p-6 hi-tech-panel rounded-3xl border border-warning/40 flex items-center justify-between gap-6 shadow-xl">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface dark:text-white text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-warning" />
                          <span>Platform Maintenance Mode</span>
                        </h4>
                        <p className="text-xs font-mono text-secondary mt-1 max-w-xl leading-relaxed">
                          Disables access to the platform for all regular users during updates. Use only for maintenance.
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAdminSetting("maintenanceMode")}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                          adminSettings.maintenanceMode
                            ? "bg-warning shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                            : "bg-surface-container-high border border-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            adminSettings.maintenanceMode
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 cyber-glass rounded-3xl border border-primary/20 flex items-center justify-between gap-6">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface dark:text-white text-base">
                          Instant Course Enrollment
                        </h4>
                        <p className="text-xs font-mono text-secondary mt-1 max-w-xl">
                          Enrolls students in courses automatically after successful payment without manual verification.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          toggleAdminSetting("autoEnrollmentApproval")
                        }
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                          adminSettings.autoEnrollmentApproval
                            ? "bg-primary shadow-[0_0_15px_rgba(0,85,255,0.6)]"
                            : "bg-surface-container-high border border-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            adminSettings.autoEnrollmentApproval
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-6 cyber-glass rounded-3xl border border-primary/20 flex items-center justify-between gap-6">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface dark:text-white text-base">
                          Strict Rate Limiting (DDoS Protection)
                        </h4>
                        <p className="text-xs font-mono text-secondary mt-1 max-w-xl">
                          Enforces strict API rate limits to protect the site from spam and overload.
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAdminSetting("strictRateLimiting")}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 relative shrink-0 ${
                          adminSettings.strictRateLimiting
                            ? "bg-primary shadow-[0_0_15px_rgba(0,85,255,0.6)]"
                            : "bg-surface-container-high border border-surface-dim"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                            adminSettings.strictRateLimiting
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Production API Key Generator */}
                  <div className="space-y-4 pt-4 border-t border-primary/20">
                    <h3 className="text-xl font-headline font-bold text-on-surface dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>External Integration API Key</span>
                    </h3>
                    <p className="text-xs font-mono text-secondary mb-2">
                      Use this API key to integrate Star LMS with external applications or services.
                    </p>

                    <div className="flex items-center gap-4">
                      <input
                        type="text"
                        readOnly
                        value={adminSettings.apiKey}
                        className="flex-1 px-5 py-4 bg-background border border-primary/30 rounded-2xl font-mono text-sm text-primary tracking-widest font-bold shadow-inner"
                      />
                      <button
                        onClick={regenerateApiKey}
                        className="px-6 py-4 signature-gradient text-white font-mono font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,85,255,0.4)] hover:scale-105 active:scale-95 transition-all shrink-0"
                      >
                        Regenerate Key
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Simulated 2FA Modal */}
      <AnimatePresence>
        {showTwoFactorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full cyber-glass p-8 rounded-[2.5rem] border border-primary shadow-[0_0_50px_rgba(0,85,255,0.5)] text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-success/20 text-success border border-success/40 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-pulse">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-black text-on-surface dark:text-white mb-2">
                Set Up Two-Factor Authentication
              </h3>
              <p className="text-xs font-mono text-secondary mb-6 leading-relaxed">
                Scan the QR code below using Google Authenticator or Authy to link your account.
              </p>

              <div className="w-48 h-48 bg-white p-4 rounded-2xl mx-auto mb-6 border-4 border-primary shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-[radial-gradient(#005ac1_2px,transparent_2px)] [background-size:12px_12px] bg-white rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-mono text-black font-extrabold bg-white p-2 rounded border border-black uppercase">
                    Star LMS Setup QR Code
                  </span>
                </div>
              </div>

              <div className="bg-background/90 p-3.5 rounded-xl border border-primary/30 font-mono text-xs text-primary tracking-widest font-bold mb-6">
                STRLMS-8492-X91A-0492
              </div>

              <button
                onClick={() => {
                  setShowTwoFactorModal(false);
                  toast.success(
                    "Two-Factor Authentication set up successfully!",
                  );
                }}
                className="w-full py-4 signature-gradient text-white rounded-xl font-mono text-xs font-extrabold tracking-widest uppercase shadow-[0_0_25px_rgba(0,85,255,0.5)] hover:scale-105 transition-all"
              >
                Verify & Complete
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
