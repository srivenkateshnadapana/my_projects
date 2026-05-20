-- ==========================================
-- STAR LMS: EXTENDED SUPABASE SCHEMA
-- ==========================================

-- 1. PROGRESS TABLE (Tracks lesson completion)
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- 2. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUESTIONS TABLE (Belongs to Quizzes)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Stored as an array of strings ["A", "B", "C"]
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. QUIZ ATTEMPTS TABLE (Student Scores)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TICKETS TABLE (Student Doubts/Support)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TICKET REPLIES (Admin/Student Chat inside a Doubt)
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    certificate_code TEXT UNIQUE NOT NULL,
    score INTEGER NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- CREATE BASIC SECURITY POLICIES (Allow everyone to read/write for now while we build)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.progress;
CREATE POLICY "Enable read access for all users" ON public.progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.progress;
CREATE POLICY "Enable insert for authenticated users" ON public.progress FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
CREATE POLICY "Enable read access for all users" ON public.quizzes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable read access for all users" ON public.questions;
CREATE POLICY "Enable read access for all users" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.quiz_attempts;
CREATE POLICY "Enable read access for all users" ON public.quiz_attempts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.quiz_attempts;
CREATE POLICY "Enable insert for authenticated users" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.tickets;
CREATE POLICY "Enable read access for all users" ON public.tickets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tickets;
CREATE POLICY "Enable insert for authenticated users" ON public.tickets FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.ticket_replies;
CREATE POLICY "Enable read access for all users" ON public.ticket_replies FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ticket_replies;
CREATE POLICY "Enable insert for authenticated users" ON public.ticket_replies FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.certificates;
CREATE POLICY "Enable read access for all users" ON public.certificates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.certificates;
CREATE POLICY "Enable insert for authenticated users" ON public.certificates FOR INSERT TO authenticated WITH CHECK (true);
