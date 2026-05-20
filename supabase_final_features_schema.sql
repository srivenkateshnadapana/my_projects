-- ==========================================
-- STAR LMS: FINAL MISSING FEATURES SCHEMA
-- ==========================================

-- 1. BLOGS TABLE (Articles & Announcements)
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. FEEDBACKS TABLE (Student Testimonials & Reviews)
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL DEFAULT 5,
    comment TEXT NOT NULL,
    show_on_home BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CODELAB PROJECTS TABLE (Saves Student IDE Code)
CREATE TABLE IF NOT EXISTS public.codelab_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'Untitled Project',
    files JSONB NOT NULL DEFAULT '{"index.html": "<h1>Hello CodeLab!</h1>", "styles.css": "body { font-family: sans-serif; }", "script.js": "console.log(\"Ready!\");"}'::jsonb,
    last_saved TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. WISHLIST TABLE (Saved Courses)
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, course_id)
);

-- 5. REFERRALS TABLE (Viral Loop & Coin Rewards)
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    reward_coins INTEGER DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDERS TABLE (Stripe/Payment Gateway Records)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ASSIGNMENTS TABLE (Deadlines & Student Tasks)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SUBMISSIONS TABLE (Student Assignment Turn-ins)
CREATE TABLE IF NOT EXISTS public.student_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    grade INTEGER,
    status TEXT DEFAULT 'submitted', -- 'submitted', 'graded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(assignment_id, user_id)
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL NEW TABLES
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codelab_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- CREATE IDEMPOTENT POLICIES (Allow read & write so everything works instantly)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.blogs;
CREATE POLICY "Enable read access for all users" ON public.blogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.blogs;
CREATE POLICY "Enable write for authenticated users" ON public.blogs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.feedbacks;
CREATE POLICY "Enable read access for all users" ON public.feedbacks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.feedbacks;
CREATE POLICY "Enable write for authenticated users" ON public.feedbacks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.codelab_projects;
CREATE POLICY "Enable read access for all users" ON public.codelab_projects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.codelab_projects;
CREATE POLICY "Enable write for authenticated users" ON public.codelab_projects FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.wishlist;
CREATE POLICY "Enable read access for all users" ON public.wishlist FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.wishlist;
CREATE POLICY "Enable write for authenticated users" ON public.wishlist FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.referrals;
CREATE POLICY "Enable read access for all users" ON public.referrals FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.referrals;
CREATE POLICY "Enable write for authenticated users" ON public.referrals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.orders;
CREATE POLICY "Enable write for authenticated users" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.assignments;
CREATE POLICY "Enable read access for all users" ON public.assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.assignments;
CREATE POLICY "Enable write for authenticated users" ON public.assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.student_submissions;
CREATE POLICY "Enable read access for all users" ON public.student_submissions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write for authenticated users" ON public.student_submissions;
CREATE POLICY "Enable write for authenticated users" ON public.student_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
