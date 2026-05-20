# 🌟 StarLMS (Adhoc Test LMS) - Enterprise E-Learning Platform

An elite, industry-aligned enterprise Learning Management System (LMS) engineered to deliver premium tech masterclasses. Designed to bridge the gap between traditional academic curricula and the demanding skillsets required by top-tier global tech companies (FAANG, OpenAI, Stripe, Uber), StarLMS features modern aesthetics, robust state management, cloud IDE integration, gamification, and an expandable backend architecture powered by Supabase.

---

## 💎 Premium Course Catalog

StarLMS hosts 6 elite, job-ready masterclasses designed around cutting-edge industry demands:

| Course Name                                                        | Category                 | Duration | US Price ($) | Indian Price (₹) | Target Job Role                          |
| :----------------------------------------------------------------- | :----------------------- | :------: | :----------: | :--------------: | :--------------------------------------- |
| **1. Applied Generative AI & LLM Systems Engineering**             | Artificial Intelligence  | 4 Months |     $599     |     ₹49,900      | AI Systems Architect / Prompt Engineer   |
| **2. Full-Stack Cloud Native Engineering (Next.js 15 & Supabase)** | Advanced Web Dev         | 6 Months |     $499     |     ₹41,500      | Senior Full-Stack Engineer               |
| **3. Autonomous AI Agents & Robotic Automation**                   | Automation & AI          | 5 Months |     $699     |     ₹58,200      | AI Automation Engineer                   |
| **4. Zero-Trust Cloud Security & DevSecOps**                       | Cybersecurity            | 4 Months |     $549     |     ₹45,700      | Cloud Security / DevOps Engineer         |
| **5. Applied Data Science & Business Intelligence**                | Data Science & Analytics | 5 Months |     $499     |     ₹41,500      | Data Scientist / Senior Business Analyst |
| **6. AR/VR Spatial Computing & Unreal Engine 5 Architecture**      | Immersive Tech           | 6 Months |     $599     |     ₹49,900      | Spatial Computing / 3D Engine Developer  |

---

## 🛠️ Technology Stack & Ecosystem

The platform is built on a highly optimized, modern React stack leveraging state-of-the-art libraries:

- **Core Framework**: React 18 + Vite 6 (ESM, lightning-fast HMR)
- **Styling & UI**: Tailwind CSS 4 + Radix UI Primitives (Accessible Dialogs, Dropdowns, Tabs, Accordions)
- **Backend & Auth**: Supabase JS Client (`@supabase/supabase-js` v2) for PostgreSQL, RLS Policies, Storage, and Realtime
- **Interactive Code IDE**: Monaco Editor (`@monaco-editor/react`) for fully featured browser-based coding labs
- **Animations & Visuals**: Framer Motion for liquid transitions, Canvas Confetti for gamified milestone celebrations
- **Data Visualizations**: Recharts for dynamic Admin and Student dashboard analytics
- **Forms & Validation**: React Hook Form + Zod schema validation
- **State & Notifications**: Custom Singleton Store + Sonner Toast notifications
- **Utilities**: Date-fns, Lucide React icons, jszip, pdf-lib

---

## 🏛️ Core Architectural Patterns

### 1. Singleton Reactive Auth Store (`src/utils/authStore.js`)

Implements a clean Pub/Sub notification pattern. Components across the application subscribe to authentication state changes without polling `window` or `localStorage`. When user sessions update, all subscribed components (like `Header`, `ProtectedRoute`, and `AdminProtectedRoute`) re-render instantly and reactively.

### 2. Centralized Normalized API Gateway (`src/services/api.js`)

Eliminates scattered `fetch()` calls across components. All network requests funnel through a hardened request handler that automatically fetches JWT tokens, injects `Authorization` headers, normalizes JSON payload structures, and points to configurable environment variables (`VITE_API_URL`).

### 3. Atomized Course Player & Polymorphic Quiz Engine (`src/pages/student/CoursePlayer.jsx`)

Separates heavy rendering trees into focused sub-components. A student submitting a doubt or running code in the sandbox does not trigger re-renders in the video player or lesson sidebar. The quiz engine features polymorphic result parsing to flawlessly accommodate varying backend response object structures.

---

## 🗺️ Exhaustive Route & Navigation Map

```
├── Public Routes
│   ├── /                         -> Landing Page & Hero Overview
│   ├── /catalog                  -> Filterable Course Catalog
│   ├── /course/:id               -> Deep-Dive Course Details & Syllabus
│   ├── /verify-certificate       -> Certificate ID Lookup Page
│   ├── /verify-certificate/:code -> Automated Certificate Verification Badge
│   ├── /blog                     -> Public Tech Blog & Tutorials Archive
│   ├── /blog/:slug               -> Individual Blog Post Reader
│   ├── /terms                    -> Terms of Service
│   └── /privacy                  -> Privacy Policy
│
├── Authentication Routes
│   ├── /login                    -> User Login (Email/Password & OAuth)
│   ├── /register                 -> Student Onboarding & Account Creation
│   ├── /forgot-password          -> Password Reset Request
│   └── /reset-password/:token    -> Secure Password Reset Confirmation
│
├── Student Portal Routes (Protected)
│   ├── /dashboard                -> Student Hub (Active Enrollments, XP/Coins, Stats)
│   ├── /student/course/:id       -> Interactive Course Player & Video Streaming
│   ├── /student/codelab          -> Cloud Monaco IDE (HTML/JS/CSS & Python Sandbox)
│   ├── /student/deadlines        -> Assignments & Dynamic Deadlines Tracker
│   ├── /profile                  -> Student Profile & XP Gamification Summary
│   ├── /my-courses               -> Enrolled Courses Library
│   ├── /certificates             -> Earned Credentials & Verification Codes
│   ├── /my-doubts                -> Interactive Doubt Resolution (Ticketing System)
│   ├── /referral                 -> Affiliate Links & Coin Rewards Hub
│   ├── /feedback                 -> Student Course Review & Testimonial Form
│   └── /settings                 -> Account Profile & Preference Settings
│
└── Admin Portal Routes (Admin Protected)
    ├── /admin                    -> Real-time Revenue & Enrollment Analytics Hub
    ├── /admin/courses            -> Admin Course Master List
    ├── /admin/courses/:id        -> Comprehensive Curriculum & Lesson Editor
    ├── /admin/doubts             -> Admin Doubt Resolution & Ticket Response Desk
    ├── /admin/blogs              -> Rich-Text Blog Publisher & SEO Manager
    └── /admin/feedbacks          -> Student Review Curation & Homepage Feature Toggle
```

---

## 📊 Current Feature Status & Database Readiness Matrix

| Module               | Feature / Page                | Frontend UI | Backend Database | Current State                                                                                                                                                                     | What is Needed                                                             |
| :------------------- | :---------------------------- | :---------: | :--------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **Auth & Profiles**  | Unified Navigation & Profiles |   ✅ Full   |    ⚠️ Partial    | Streamlined 5-item primary navigation pill (`whitespace-nowrap`) and multi-tab settings (`/settings`) with General, Telemetry, Playback, Security, Billing, and Admin parameters. | Wire Supabase Storage for avatar uploads & sync XP/Coins to database.      |
| **Courses**          | Live Orders & Enrollments     |   ✅ Full   |     ✅ Full      | Enrolling/purchasing creates verified `orders` financial records and inserts active `enrollments` into Supabase.                                                                  | Add webhook listeners for external gateway sync.                           |
| **Courses**          | Wishlist / Favorites          |   ✅ Full   |     ✅ Full      | Fully synchronized across devices! Hybrid local cache with automatic background sync to `wishlist` Supabase PostgreSQL table.                                                     | None. Fully complete.                                                      |
| **Student**          | Interactive CodeLab IDE       |   ✅ Full   |     ✅ Full      | Live Cloud Synchronization! Students press `Ctrl+S` or click Save to cloud-sync multi-file Monaco workspaces to `codelab_projects` table.                                         | None. Fully complete.                                                      |
| **Student**          | Dynamic Deadlines & Tasks     |   ✅ Full   |    ❌ Mocked     | Deadlines are simulated based on course enrollment dates.                                                                                                                         | Create `assignments` & `deadlines` DB table for teacher-set due dates.     |
| **Certificates**     | PDF Certificate Generator     |   ✅ Full   |    ⚠️ Partial    | Verification codes work, but PDF download returns mock data.                                                                                                                      | Implement serverless PDF generation & save to Supabase storage bucket.     |
| **Doubts (Tickets)** | Live Helpdesk & Metrics       |   ✅ Full   |     ✅ Full      | Real-time Supabase queries for ticket creation, replies, and status metrics (`open`/`resolved`).                                                                                  | Connect file picker to `ticket-attachments` Supabase storage bucket.       |
| **Community**        | Blog & Articles System        |   ✅ Full   |    ❌ Stubbed    | Blog pages exist (`/blog`), but API returns empty arrays `[]`.                                                                                                                    | Create `blogs` table & wire Admin panel to publish rich-text articles.     |
| **Community**        | Student Feedbacks / Reviews   |   ✅ Full   |    ❌ Stubbed    | Review form exists, but API returns empty stubs.                                                                                                                                  | Create `feedbacks` DB table & allow admins to feature reviews on homepage. |
| **Growth**           | Referral & Affiliate Program  |   ✅ Full   |     ✅ Full      | Live email invite dispatcher and real-time tracking of referred colleagues synced to `referrals` Supabase table with automated 500★ Coin treasury updates.                        | None. Fully complete.                                                      |
| **Admin**            | Real-time Analytics & Revenue |   ✅ Full   |     ✅ Full      | Live SQL aggregations compute exact active learners, revenue, and deduplicated unique assets (6 masterclasses) with interactive 24H/7D/30D enrollment velocity chart switching.   | Expand custom date-range filtering.                                        |
| **Student**          | Real-time Dashboard Analytics |   ✅ Full   |     ✅ Full      | Learning velocity curve and radar skill charts compute real telemetry metrics from user activity without mock fallbacks.                                                          | Expand real-time WebSocket progress sync.                                  |

---

## ⚡ Future Feature Implementation Guide (How-To Manual)

This manual provides future developers with exact implementation specifications to seamlessly activate the missing backend functionality across StarLMS.

### 1. Interactive CodeLab Persistence (Cloud Monaco IDE)

- **Goal**: Allow students to save code workspaces in the browser and resume coding on any device.
- **Database Schema**:
  ```sql
  CREATE TABLE codelab_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Workspace',
    files_json JSONB NOT NULL DEFAULT '{"index.html": "", "script.js": "", "style.css": ""}',
    last_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- **Frontend Wiring**: In `src/pages/student/CodeLab.jsx`, capture `Ctrl+S` / `Cmd+S` inside the Monaco Editor keydown handler. Trigger `api.codelab.save(workspaceId, currentFiles)` to upsert the workspace data into the Supabase `codelab_projects` table.

### 2. Verified PDF Certificate Generation & Storage

- **Goal**: Generate high-fidelity PDF diplomas stamped with student verification codes upon course completion.
- **Supabase Bucket**: Create a public Supabase Storage bucket named `certificate-pdfs`.
- **Frontend/Backend Wiring**: In `src/pages/student/Certificates.jsx`, when the user clicks "Download Certificate", use `jspdf` / `html2canvas` (or an Edge Function) to render a pristine certificate layout with the user's name, course title, completion date, and unique `VERIFY-XXXX` code. Upload the generated blob to Supabase Storage and store the public URL in `user_certificates.pdf_url`.

### 3. Full Blog & Content Marketing Engine (`/blog`)

- **Goal**: Enable administrators to publish rich SEO articles that instantly render on public blog pages.
- **Database Schema**:
  ```sql
  CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL, -- Rich HTML or Markdown
    thumbnail_url TEXT,
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}'
  );
  ```
- **Frontend Wiring**: Connect `src/pages/admin/AdminBlogs.jsx` to `api.blogs.create()`. Ensure `src/pages/public/BlogList.jsx` and `BlogPost.jsx` fetch live records from Supabase via `api.blogs.getAll()` and `api.blogs.getBySlug()`.

### 4. Student Reviews & Homepage Social Proof

- **Goal**: Allow genuine student reviews to be submitted from the student portal and curated by admins to appear on the landing page hero section.
- **Database Schema**:
  ```sql
  CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    course_id UUID REFERENCES courses(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    show_on_home BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- **Frontend Wiring**: Connect `src/pages/student/StudentFeedback.jsx` to submit reviews. In `src/pages/admin/AdminFeedbacks.jsx`, add a toggle button that flips `show_on_home = true`. In `src/pages/public/Home.jsx`, query `feedbacks` where `show_on_home` is true to display dynamic testimonials.

### 5. Gamification, XP, Coins & Referral System

- **Goal**: Reward students with XP points for completing lessons and Coins for referring friends.
- **Database Schema**:
  ```sql
  CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id),
    referred_email TEXT UNIQUE NOT NULL,
    referral_code TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
    coins_awarded INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- **Frontend Wiring**: In `src/pages/student/Referral.jsx`, allow users to generate unique referral links (`/register?ref=USERCODE`). When a new user signs up with a referral code, trigger a Supabase RPC or webhook to credit 500 Coins to the referrer's profile balance.

### 6. Stripe / Razorpay Real Checkout Integration

- **Goal**: Process secure card/UPI transactions and automatically unlock courses upon successful payment webhook verification.
- **Database Schema**:
  ```sql
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    course_id UUID REFERENCES courses(id),
    amount_paid NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_gateway TEXT CHECK (payment_gateway IN ('stripe', 'razorpay')),
    transaction_id TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'successful', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
- **Frontend Wiring**: On `src/pages/public/CourseDetail.jsx`, clicking "Enroll Now" calls a backend endpoint / Edge Function to create a checkout session. The webhook listener verifies payment success, inserts the record into `orders`, and adds the course to `user_enrollments`.

### 7. Cross-Device Wishlist Sync

- **Goal**: Persist saved courses across web, tablet, and mobile logins instead of relying on local browser storage.
- **Database Schema**:
  ```sql
  CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
  );
  ```
- **Frontend Wiring**: In `src/pages/public/Catalog.jsx` and `CourseDetail.jsx`, replace `localStorage.setItem('wishlist', ...)` with `api.wishlist.toggle(courseId)`.

### 8. Supabase Avatar Storage & Profile Sync

- **Goal**: Securely store user profile images in Supabase Cloud Storage.
- **Supabase Bucket**: Create a private/public bucket named `avatars`.
- **Frontend Wiring**: In `src/pages/student/Profile.jsx` and `Settings.jsx`, wire the avatar image upload button to `supabase.storage.from('avatars').upload()`. Update `profiles.avatar_url` with the resulting public download URI.

---

## 📜 Included SQL Schemas & Database Seeds

The repository root includes fully prepared SQL seed and schema files ready to be executed in your Supabase SQL editor:

- **`supabase_final_features_schema.sql`**: Complete database definition including courses, profiles, enrollments, doubts, certificates, and RLS policies.
- **`supabase_extended_schema.sql`**: Extensions and auxiliary tables for advanced analytics.
- **`supabase_premium_courses_seed.sql`**: Pre-populates the database with the 6 premium industry-aligned masterclasses and complete lesson modules.
- **`supabase_blogs_seed.sql`**: Sample high-quality tech blog articles for testing community feeds.

---

## 💻 Local Development Setup

Follow these steps to run StarLMS locally:

1. **Clone & Open Project Directory**:

   ```bash
   git clone <repository-url>
   cd theme-google-material
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory (or review the existing `.env`):

   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_API_URL=https://your-backend-api-url.com/api
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will launch with blazing-fast Vite HMR at `http://localhost:5173`.
