import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Toaster } from "sonner";
import { BottomNav } from "./components/layout/BottomNav";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";

// Lazy Pages
const Home = React.lazy(() => import("./pages/public/Home"));
const Catalog = React.lazy(() => import("./pages/public/Catalog"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const ForgotPassword = React.lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));
const CourseDetail = React.lazy(() => import("./pages/public/CourseDetail"));
const NotFound = React.lazy(() => import("./pages/public/NotFound"));
const Unauthorized = React.lazy(() => import("./pages/public/Unauthorized"));
const Dashboard = React.lazy(() => import("./pages/student/Dashboard"));
const Profile = React.lazy(() => import("./pages/student/Profile"));
const CoursePlayer = React.lazy(() => import("./pages/student/CoursePlayer"));
const AllDeadlines = React.lazy(() => import("./pages/student/AllDeadlines"));
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const MyCourses = React.lazy(() => import("./pages/student/MyCourses"));
const Certificates = React.lazy(() => import("./pages/student/Certificates"));
const MyDoubts = React.lazy(() => import("./pages/student/MyDoubts"));
const Settings = React.lazy(() => import("./pages/student/Settings"));
const Referral = React.lazy(() => import("./pages/student/Referral"));
const AdminCourses = React.lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseManager = React.lazy(
  () => import("./pages/admin/AdminCourseManager"),
);
const AdminDoubts = React.lazy(() => import("./pages/admin/AdminDoubts"));
const VerifyCertificate = React.lazy(
  () => import("./pages/public/VerifyCertificate"),
);
const BlogList = React.lazy(() => import("./pages/public/BlogList"));
const BlogPost = React.lazy(() => import("./pages/public/BlogPost"));
const AdminBlogs = React.lazy(() => import("./pages/admin/AdminBlogs"));
const AdminFeedbacks = React.lazy(() => import("./pages/admin/AdminFeedbacks"));
const StudentFeedback = React.lazy(
  () => import("./pages/student/StudentFeedback"),
);
const CodeLab = React.lazy(() => import("./pages/student/CodeLab"));
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col">
          <Header />
          <main className="flex-grow pt-20 pb-20 md:pb-8 w-full max-w-[1920px] mx-auto">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/course/:id" element={<CourseDetail />} />
                <Route
                  path="/verify-certificate"
                  element={<VerifyCertificate />}
                />
                <Route
                  path="/verify-certificate/:code"
                  element={<VerifyCertificate />}
                />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route
                  path="/auth"
                  element={<Navigate to="/login" replace />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/auth/register"
                  element={<Navigate to="/register" replace />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/student/deadlines" element={<AllDeadlines />} />
                <Route path="/student/course/:id" element={<CoursePlayer />} />
                <Route path="/student/codelab" element={<CodeLab />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/my-doubts" element={<MyDoubts />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/referral" element={<Referral />} />
                <Route path="/feedback" element={<StudentFeedback />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route
                  path="/admin/courses/:id"
                  element={<AdminCourseManager />}
                />
                <Route path="/admin/doubts" element={<AdminDoubts />} />
                <Route path="/admin/blogs" element={<AdminBlogs />} />
                <Route path="/admin/feedbacks" element={<AdminFeedbacks />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </React.Suspense>
          </main>
          <Footer />
          <BottomNav />
          <Toaster
            position="top-right"
            richColors
            duration={5000}
            closeButton
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
