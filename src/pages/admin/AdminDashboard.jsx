import * as React from "react";
import { AdminProtectedRoute } from "../../context/AdminProtectedRoute";
import { StorageService } from "../../services/storage";
import {
  Users,
  BookOpen,
  IndianRupee,
  TrendingUp,
  BarChart3,
  Layout,
  ShieldCheck,
  Activity,
  Plus,
  ArrowUpRight,
  Search,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState(false);
  const navigate = useNavigate();

  const [analytics, setAnalytics] = React.useState(null);
  const [ticketStats, setTicketStats] = React.useState(null);
  const [timeSpan, setTimeSpan] = React.useState("7D");

  const velocityChartData = React.useMemo(() => {
    if (timeSpan === "24H") {
      return [
        "00:00",
        "04:00",
        "08:00",
        "12:00",
        "16:00",
        "20:00",
        "24:00",
      ].map((t) => ({ label: t, revenue: 0 }));
    } else if (timeSpan === "7D") {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
        label: d,
        revenue: 0,
      }));
    } else {
      const allMonths = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const revMap = {};
      if (analytics?.monthlyRevenue && analytics.monthlyRevenue.length > 0) {
        analytics.monthlyRevenue.forEach(
          (item) => (revMap[item.month] = parseFloat(item.revenue) || 0),
        );
      }
      return allMonths.map((m) => ({ label: m, revenue: revMap[m] || 0 }));
    }
  }, [timeSpan, analytics]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = StorageService.getToken();
        if (!token) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        const [statsRes, analyticsRes, ticketsRes] = await Promise.all([
          api.admin.getStats(token),
          api.admin.getAnalytics(token),
          api.tickets.getStats(token),
        ]);

        if (statsRes?.success) setStats(statsRes.data);
        if (analyticsRes?.success) setAnalytics(analyticsRes.data);
        if (ticketsRes?.success) setTicketStats(ticketsRes.data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
        if (err.status === 403) {
          setAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );

  if (authError)
    return (
      <div className="min-h-screen bg-surface pt-24 pb-20 px-8 flex items-center justify-center">
        <div className="bg-surface-container-lowest border border-error/20 rounded-3xl p-12 text-center max-w-lg shadow-xl">
          <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-primary mb-3">
            Session Expired
          </h2>
          <p className="text-on-surface-variant mb-2">
            Your admin session is no longer valid.
          </p>
          <p className="text-sm text-outline mb-8">
            Your login token may have expired or was issued before admin access
            was granted. Please log out and log back in as admin.
          </p>
          <button
            onClick={() => {
              StorageService.logout();
              window.location.href = "/login";
            }}
            className="px-8 py-3 signature-gradient text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Log Out &amp; Re-Login
          </button>
        </div>
      </div>
    );

  const metrics = [
    {
      label: "Active Learners",
      value: (stats?.users?.students || 0).toLocaleString(),
      icon: Users,
      trend: "+12.4%",
      color: "primary",
    },
    {
      label: "Total Revenue",
      value: `₹${(stats?.revenue?.total || 0).toLocaleString()}`,
      icon: IndianRupee,
      trend: "+8.2%",
      color: "secondary",
    },
    {
      label: "Total Courses",
      value: stats?.content?.courses || 0,
      icon: BookOpen,
      trend: "+3",
      color: "primary",
    },
    {
      label: "Active Doubts",
      value: ticketStats?.open || 0,
      icon: MessageCircle,
      trend: `${ticketStats?.resolved || 0} Resolved`,
      color: "secondary",
    },
  ];

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-8 font-body">
      <div className="max-w-7xl mx-auto">
        {/* Management Header */}
        <section className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.4em]">
                Admin Control Center • Live
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-extrabold text-primary tracking-tighter italic">
              Platform Analytics
            </h1>
            <p className="text-on-surface-variant text-lg font-medium opacity-60 mt-2">
              Overseeing student enrollment metrics, revenue performance, and course status.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/doubts"
              className="px-8 py-4 bg-surface-container-low border border-surface-dim/20 rounded-2xl font-bold text-secondary text-sm hover:bg-surface-container transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Student Doubts
            </Link>
            <Link
              to="/admin/blogs"
              className="px-8 py-4 bg-surface-container-low border border-surface-dim/20 rounded-2xl font-bold text-secondary text-sm hover:bg-surface-container transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Blogs
            </Link>
            <Link
              to="/admin/feedbacks"
              className="px-8 py-4 bg-surface-container-low border border-surface-dim/20 rounded-2xl font-bold text-secondary text-sm hover:bg-surface-container transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Feedbacks
            </Link>
            <Link
              to="/admin/courses"
              className="px-8 py-4 signature-gradient text-white rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Course
            </Link>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-surface-dim/20 shadow-xl shadow-primary/5 group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`w-14 h-14 rounded-2xl ${m.color === "primary" ? "bg-primary text-on-primary shadow-lg shadow-primary/30" : "bg-secondary text-on-secondary shadow-lg shadow-secondary/30"} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  <m.icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                  {m.trend}
                </span>
              </div>
              <p className="text-xs font-bold text-outline uppercase tracking-[0.2em] mb-1">
                {m.label}
              </p>
              <p className="text-4xl font-headline font-extrabold text-primary tracking-tighter">
                {m.value}
              </p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Traffic Shard */}
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-xl shadow-primary/5 border border-surface-dim/20 relative overflow-hidden h-[450px]">
              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-2xl font-headline font-bold text-primary italic flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Enrollment Velocity
                </h3>
                <div className="flex gap-1.5 bg-surface-container-low p-1.5 rounded-full border border-surface-dim/20 shadow-inner">
                  {["24H", "7D", "30D"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setTimeSpan(p)}
                      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                        p === timeSpan
                          ? "bg-primary text-on-primary shadow-md shadow-primary/30 scale-105"
                          : "text-on-surface hover:bg-surface-container hover:text-primary active:scale-95"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-grow flex items-end justify-between h-64 border-b-2 border-dashed border-surface-dim/30 pb-4 relative z-10 px-4">
                {velocityChartData.map((data, index) => {
                  const maxRevenue =
                    Math.max(...velocityChartData.map((d) => d.revenue)) ||
                    1000;
                  const heightPercent = Math.max(
                    (data.revenue / maxRevenue) * 100,
                    5,
                  );
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-2 group flex-1 mx-1"
                    >
                      <div
                        className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-colors rounded-t-xl relative shadow-sm"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-high px-2.5 py-1 rounded-lg text-xs font-bold text-primary transition-opacity whitespace-nowrap shadow-lg border border-surface-dim/20">
                          ₹{data.revenue.toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
            </div>

            {/* Recent Courses Table */}
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-xl shadow-primary/5 border border-surface-dim/20">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-bold text-primary italic">
                  Active Courses
                </h3>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Course search..."
                    className="pl-11 pr-6 py-3 bg-surface-container-low border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/10 transition-all w-64 text-on-surface"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {analytics?.popularCourses &&
                analytics.popularCourses.length > 0 ? (
                  analytics.popularCourses.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 bg-surface-container-low/50 rounded-2xl hover:bg-surface-container-low transition-all group border border-surface-dim/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                          <Layout className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-on-surface">
                            {item.course
                              ? item.course.title
                              : `Course ${item.courseId}`}
                          </p>
                          <p className="text-xs font-bold text-secondary uppercase tracking-wider mt-1">
                            {item.enrollmentCount} Enrolled Students
                          </p>
                        </div>
                      </div>
                      <button className="p-3 bg-surface-container rounded-xl text-primary hover:bg-primary hover:text-on-primary transition-colors shadow-sm">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-secondary text-sm font-bold bg-surface-container-low/30 rounded-2xl border border-surface-dim/10">
                    No active courses.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="signature-gradient p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-success animate-pulse" />{" "}
                  Platform Status
                </h4>
                <p className="text-6xl font-headline font-extrabold tracking-tighter mb-4 text-white drop-shadow-md">
                  99.8%
                </p>
                <p className="text-sm font-bold text-white/90 leading-relaxed mb-8">
                  Overall platform completion rate across all active programs.
                </p>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden mb-8 backdrop-blur-sm border border-white/10">
                  <div
                    className="h-full bg-white rounded-full shadow-lg"
                    style={{ width: "99.8%" }}
                  />
                </div>
                <button className="w-full py-4 bg-white text-slate-900 font-black text-sm rounded-2xl shadow-2xl hover:bg-white/90 active:scale-[0.98] transition-all uppercase tracking-widest border border-black/10">
                  Download Report
                </button>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
            </div>

            <div className="bg-surface-container-lowest p-10 rounded-[3rem] border border-surface-dim/20 shadow-xl shadow-primary/5">
              <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-8">
                Recent Activity
              </h4>
              <div className="space-y-6">
                {analytics?.popularCourses &&
                analytics.popularCourses.length > 0 ? (
                  analytics.popularCourses.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-start border-l-4 border-primary pl-4 py-1.5 bg-surface-container-low/30 rounded-r-xl pr-4"
                    >
                      <div>
                        <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                          Course Title
                        </p>
                        <p className="text-sm font-bold text-on-surface">
                          {item.course
                            ? item.course.title
                            : `Course ${item.courseId}`}{" "}
                          active
                        </p>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                        Recent
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary text-sm bg-surface-container-low/20 rounded-2xl border border-surface-dim/10">
                    No recent activity recorded in database.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
