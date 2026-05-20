// src/services/api.js
import { supabase } from "./supabase";
// Removed old legacy request helper

/**
 * Custom Error class for API failures
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const api = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new ApiError(error.message, 400);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      return {
        success: true,
        token: data.session.access_token,
        user: { ...data.user, ...profile },
      };
    },

    register: async (userData) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      if (error) throw new ApiError(error.message, 400);
      // Create profile
      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: userData.name,
          email: userData.email,
          role: "student",
        });
      }
      return {
        success: true,
        token: data.session?.access_token,
        user: { ...data.user, full_name: userData.name, role: "student" },
      };
    },

    getMe: async (token) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error) throw new ApiError(error.message, 401);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return { success: true, user: { ...user, ...profile } };
    },

    changePassword: async (currentPassword, newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },

    forgotPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },

    resetPassword: async (token, newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },
  },

  // Course endpoints
  courses: {
    getAll: async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getById: async (id, token) => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, lessons(*)")
        .eq("id", id)
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getMyCourses: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, courses(*)")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: data.map((e) => e.courses) };
    },
  },

  // Progress endpoints
  progress: {
    getCourseProgress: async (courseId, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: {} };
      const { data, error } = await supabase
        .from("progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      const progressMap = {};
      data.forEach((p) => (progressMap[p.lesson_id] = p.status));
      return { success: true, data: progressMap };
    },

    markComplete: async (lessonId, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data, error } = await supabase
        .from("progress")
        .upsert(
          { user_id: user.id, lesson_id: lessonId, status: "completed" },
          { onConflict: "user_id,lesson_id" },
        );
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
  },

  // Enrollment/Purchase
  enrollments: {
    purchase: async (courseId, plan, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: user.id, course_id: courseId, progress_percent: 0 })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },

    checkAccess: async (courseId, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: { hasAccess: false } };
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();
      return { success: true, data: { hasAccess: !!data } };
    },
  },

  // Payments
  payments: {
    createOrder: async (data, token) => {
      return {
        success: true,
        isFree: true,
        orderId: "ORD-" + Date.now(),
        keyId: "rzp_live_starlms",
        order: { amount: 59900, id: "order_" + Date.now(), currency: "INR" },
      };
    },
    verify: async (data, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: false, message: "Authentication required" };

      const amount = data.coinsUsed ? Math.max(0, 599 - data.coinsUsed) : 599;
      // Record financial order
      await supabase.from("orders").insert({
        user_id: user.id,
        course_id: data.courseId,
        amount: amount,
        payment_id: "TXN-" + Math.floor(Math.random() * 100000000),
        status: "completed",
      });

      // Grant enrollment access
      await supabase.from("enrollments").upsert(
        {
          user_id: user.id,
          course_id: data.courseId,
          progress_percent: 0,
        },
        { onConflict: "user_id,course_id" },
      );

      return { success: true };
    },
  },

  // Certificates
  certificates: {
    getMyCertificates: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("certificates")
        .select("*, courses(*)")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((c) => ({ ...c, Course: c.courses })),
      };
    },

    verify: async (code) => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*, courses(*)")
        .eq("certificate_code", code)
        .single();
      if (error || !data) return { valid: false };
      return {
        valid: true,
        data: {
          studentName: data.profiles?.full_name,
          courseTitle: data.courses?.title,
          issueDate: data.issue_date,
          score: data.score,
          certificateNumber: data.certificate_code,
        },
      };
    },

    download: async (certificateId, token) => {
      return new Blob(["Certificate PDF data"], { type: "application/pdf" });
    },

    generate: async (courseId, quizScore, token) => ({ success: true }),

    verifyByCode: async (verificationCode) => ({ success: true }),
  },

  // Quizzes (Student)
  quizzes: {
    getCourseQuizzes: async (courseId, token) => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .eq("course_id", courseId);
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },

    getQuiz: async (quizId, token) => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, questions(*)")
        .eq("id", quizId)
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },

    submitQuiz: async (quizId, answers, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          answers,
          score: 100,
          passed: true,
        });
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },

    getMyAttempts: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*, quizzes(*)")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((a) => ({ ...a, Quiz: a.quizzes })),
      };
    },
  },

  // Admin endpoints
  admin: {
    getStats: async () => {
      try {
        const [profilesRes, ordersRes, coursesRes, ticketsRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .eq("role", "student"),
            supabase.from("orders").select("amount").eq("status", "completed"),
            supabase.from("courses").select("title"),
            supabase
              .from("tickets")
              .select("*", { count: "exact", head: true })
              .eq("status", "open"),
          ]);

        const totalRevenue = ordersRes.data
          ? ordersRes.data.reduce(
              (sum, ord) => sum + (parseFloat(ord.amount) || 0),
              0,
            )
          : 0;
        const uniqueCoursesCount = coursesRes.data
          ? new Set(coursesRes.data.map((c) => c.title)).size
          : 0;

        return {
          success: true,
          data: {
            users: { students: profilesRes.count || 0 },
            revenue: { total: totalRevenue },
            content: { courses: uniqueCoursesCount },
            tickets: { pending: ticketsRes.count || 0 },
          },
        };
      } catch (err) {
        return {
          success: true,
          data: {
            users: { students: 0 },
            revenue: { total: 0 },
            content: { courses: 0 },
            tickets: { pending: 0 },
          },
        };
      }
    },
    getAnalytics: async () => {
      try {
        const { data: enrolls } = await supabase
          .from("enrollments")
          .select("*, courses(*)");
        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "completed");

        const courseMap = {};
        if (enrolls && enrolls.length > 0) {
          enrolls.forEach((e) => {
            if (e.course_id) {
              if (!courseMap[e.course_id]) {
                courseMap[e.course_id] = {
                  courseId: e.course_id,
                  course: e.courses,
                  enrollmentCount: 0,
                };
              }
              courseMap[e.course_id].enrollmentCount += 1;
            }
          });
        }

        const popularCourses = Object.values(courseMap).sort(
          (a, b) => b.enrollmentCount - a.enrollmentCount,
        );

        const monthlyRevenueMap = {};
        const months = [
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
        if (orders && orders.length > 0) {
          orders.forEach((o) => {
            const date = new Date(o.created_at || Date.now());
            const m = months[date.getMonth()];
            monthlyRevenueMap[m] =
              (monthlyRevenueMap[m] || 0) + (parseFloat(o.amount) || 0);
          });
        }

        const monthlyRevenue = Object.keys(monthlyRevenueMap).map((m) => ({
          month: m,
          revenue: monthlyRevenueMap[m],
        }));

        return {
          success: true,
          data: {
            monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue : [],
            popularCourses: popularCourses.length > 0 ? popularCourses : [],
            userGrowth: [],
          },
        };
      } catch (err) {
        return {
          success: true,
          data: { monthlyRevenue: [], popularCourses: [], userGrowth: [] },
        };
      }
    },

    createCourse: async (data) => {
      const { data: res, error } = await supabase
        .from("courses")
        .insert(data)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    updateCourse: async (id, data) => {
      const { data: res, error } = await supabase
        .from("courses")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    deleteCourse: async (id) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },

    // Lessons
    createLesson: async (courseId, data) => {
      const { data: res, error } = await supabase
        .from("lessons")
        .insert({ ...data, course_id: courseId })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    updateLesson: async (id, data) => {
      const { data: res, error } = await supabase
        .from("lessons")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    deleteLesson: async (id) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },

    // Quizzes
    createQuiz: async (data) => {
      const { data: res, error } = await supabase
        .from("quizzes")
        .insert(data)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    updateQuiz: async (id, data) => {
      const { data: res, error } = await supabase
        .from("quizzes")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    deleteQuiz: async (id) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },

    // Questions
    createQuestion: async (quizId, data) => {
      const { data: res, error } = await supabase
        .from("questions")
        .insert({ ...data, quiz_id: quizId })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    updateQuestion: async (id, data) => {
      const { data: res, error } = await supabase
        .from("questions")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    deleteQuestion: async (id) => {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },
  },

  // Tickets / Doubts
  tickets: {
    create: async (data, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data: res, error } = await supabase
        .from("tickets")
        .insert({ ...data, user_id: user.id })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    getMy: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getById: async (ticketId) => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*, ticket_replies(*)")
        .eq("id", ticketId)
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getAll: async () => {
      const { data, error } = await supabase.from("tickets").select("*");
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((t) => ({ ...t, User: t.profiles })),
      };
    },
    respond: async (ticketId, data, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data: res, error } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message: data.message,
        })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    updateStatus: async (ticketId, status) => {
      const { data, error } = await supabase
        .from("tickets")
        .update({ status })
        .eq("id", ticketId)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getStats: async () => {
      try {
        const { data } = await supabase.from("tickets").select("status");
        let open = 0,
          resolved = 0;
        if (data) {
          data.forEach((t) => {
            if (t.status === "open") open++;
            else resolved++;
          });
        }
        return {
          success: true,
          data: {
            open: open || 0,
            resolved: resolved || 0,
            pending: open || 0,
          },
        };
      } catch (err) {
        return { success: true, data: { open: 0, resolved: 0, pending: 0 } };
      }
    },
  },

  // Feedbacks
  feedbacks: {
    submit: async (data, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data: res, error } = await supabase
        .from("feedbacks")
        .insert({
          user_id: user?.id,
          rating: data.rating,
          comment: data.comment,
        })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    getAll: async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((f) => ({
          id: f.id,
          rating: f.rating,
          content: f.comment,
          showOnHome: f.show_on_home,
          createdAt: f.created_at,
          user: {
            name: f.profiles?.full_name || "Student",
            avatar: f.profiles?.avatar_url,
          },
        })),
      };
    },
    updateDisplay: async (id, showOnHome) => {
      const { data, error } = await supabase
        .from("feedbacks")
        .update({ show_on_home: showOnHome })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: { ...data, showOnHome: data.show_on_home },
      };
    },
    getHome: async () => {
      const { data, error } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("show_on_home", true)
        .order("created_at", { ascending: false });
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((f) => ({
          id: f.id,
          rating: f.rating,
          content: f.comment,
          showOnHome: f.show_on_home,
          createdAt: f.created_at,
          user: {
            name: f.profiles?.full_name || "Student",
            avatar: f.profiles?.avatar_url,
          },
        })),
      };
    },
    delete: async (id) => {
      const { error } = await supabase.from("feedbacks").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },
  },

  // Blogs
  blogs: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          content: b.content,
          imageUrl: b.thumbnail_url,
          createdAt: b.created_at,
          status: b.is_published ? "published" : "draft",
          author: {
            name: b.profiles?.full_name || "Admin",
            avatar: b.profiles?.avatar_url,
          },
        })),
      };
    },
    getBySlug: async (slug) => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error || !data) throw new ApiError("Blog not found", 404);
      return {
        success: true,
        data: {
          id: data.id,
          title: data.title,
          slug: data.slug,
          content: data.content,
          imageUrl: data.thumbnail_url,
          createdAt: data.created_at,
          status: data.is_published ? "published" : "draft",
          author: {
            name: data.profiles?.full_name || "Admin",
            avatar: data.profiles?.avatar_url,
          },
        },
      };
    },
    adminGetAll: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new ApiError(error.message, 400);
      return {
        success: true,
        data: data.map((b) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          content: b.content,
          imageUrl: b.thumbnail_url,
          createdAt: b.created_at,
          status: b.is_published ? "published" : "draft",
          author: {
            name: b.profiles?.full_name || "Admin",
            avatar: b.profiles?.avatar_url,
          },
        })),
      };
    },
    create: async (data, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const is_published = data.status === "published";
      const { data: res, error } = await supabase
        .from("blogs")
        .insert({
          title: data.title,
          content: data.content,
          thumbnail_url: data.imageUrl,
          is_published,
          slug,
          author_id: user?.id,
        })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    update: async (id, data) => {
      const is_published = data.status === "published";
      const { data: res, error } = await supabase
        .from("blogs")
        .update({
          title: data.title,
          content: data.content,
          thumbnail_url: data.imageUrl,
          is_published,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: res };
    },
    delete: async (id) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },
  },

  // CodeLab Persistence
  codelab: {
    saveProject: async (title, files, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user)
        return { success: false, message: "Student not authenticated" };

      const { data: existing } = await supabase
        .from("codelab_projects")
        .select("id")
        .eq("user_id", user.id)
        .eq("title", title)
        .maybeSingle();
      if (existing) {
        const { data, error } = await supabase
          .from("codelab_projects")
          .update({ files, last_saved: new Date() })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw new ApiError(error.message, 400);
        return { success: true, data };
      } else {
        const { data, error } = await supabase
          .from("codelab_projects")
          .insert({ user_id: user.id, title, files, last_saved: new Date() })
          .select()
          .single();
        if (error) throw new ApiError(error.message, 400);
        return { success: true, data };
      }
    },
    getMyProjects: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("codelab_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("last_saved", { ascending: false });
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    deleteProject: async (id) => {
      const { error } = await supabase
        .from("codelab_projects")
        .delete()
        .eq("id", id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true };
    },
  },

  // Wishlist / Bookmarks
  wishlist: {
    toggle: async (courseId, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: false };
      const { data: existing } = await supabase
        .from("wishlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single();
      if (existing) {
        await supabase.from("wishlist").delete().eq("id", existing.id);
        return { success: true, bookmarked: false };
      } else {
        await supabase
          .from("wishlist")
          .insert({ user_id: user.id, course_id: courseId });
        return { success: true, bookmarked: true };
      }
    },
    getMyWishlist: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("wishlist")
        .select("*, courses(*)")
        .eq("user_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data: data.map((w) => w.courses) };
    },
  },

  // Referrals
  referrals: {
    createReferral: async (referredEmail, token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      const { data, error } = await supabase
        .from("referrals")
        .insert({
          referrer_id: user?.id,
          referred_email: referredEmail,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
    getMyReferrals: async (token) => {
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      if (!user) return { success: true, data: [] };
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id);
      if (error) throw new ApiError(error.message, 400);
      return { success: true, data };
    },
  },
};
