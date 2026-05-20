-- ====================================================================
-- STAR LMS: PREMIUM INDUSTRY-ALIGNED MASTERCLASS SEED & RLS
-- ====================================================================

-- 1. Ensure Table Permissions & RLS Policies allow Public Read & Admin Write
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on courses" ON public.courses;
CREATE POLICY "Allow public read access on courses" ON public.courses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to modify courses" ON public.courses;
CREATE POLICY "Allow authenticated users to modify courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

-- 2. Ensure all subscription duration and type columns exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS course_type TEXT DEFAULT 'mega';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS allowed_plan TEXT DEFAULT '3months';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_1month DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_3months DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_4months DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_5months DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_6months DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS prices JSONB DEFAULT '{}'::jsonb;

-- 3. Clean up existing entries to guarantee no duplicates
DELETE FROM public.courses;

-- 4. Insert the 6 Elite Industry Masterclasses
INSERT INTO public.courses (
    id, 
    title, 
    description, 
    category, 
    level, 
    price, 
    thumbnail_url, 
    is_published, 
    course_type, 
    allowed_plan, 
    price_4months, 
    price_5months, 
    price_6months, 
    prices,
    created_at
)
VALUES 
(
    gen_random_uuid(),
    'Applied Generative AI & LLM Systems Engineering',
    'Move beyond basic ChatGPT prompts. Learn to build enterprise-grade AI applications from scratch. You will construct Retrieval-Augmented Generation (RAG) pipelines using Pinecone, fine-tune open-source models like Llama 3 using PyTorch, and deploy low-latency AI microservices with LangChain and FastAPI.',
    'Artificial Intelligence',
    'Advanced / Job-Ready',
    49900.00,
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '4months',
    49900.00,
    0.00,
    0.00,
    '{"4months": 49900}'::jsonb,
    now()
),
(
    gen_random_uuid(),
    'Full-Stack Cloud Native Engineering (Next.js 15 & Supabase)',
    'Learn how modern startups build hyper-scalable apps without expensive server teams. Master Next.js App Router, TypeScript, state management, Supabase PostgreSQL with advanced RLS security policies, Redis caching, and automated AWS CI/CD pipelines.',
    'Advanced Web Dev',
    'Advanced / Job-Ready',
    41500.00,
    'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '6months',
    0.00,
    0.00,
    41500.00,
    '{"6months": 41500}'::jsonb,
    now()
),
(
    gen_random_uuid(),
    'Autonomous AI Agents & Robotic Automation',
    'Explore the frontier of automated work. Design multi-agent swarms using AutoGen and CrewAI that write code, research data, and execute tasks autonomously. Learn Python computer vision (OpenCV/YOLO) and simulated robotics workflows using ROS2.',
    'Robotics & Automation',
    'Advanced / Job-Ready',
    58200.00,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '5months',
    0.00,
    58200.00,
    0.00,
    '{"5months": 58200}'::jsonb,
    now()
),
(
    gen_random_uuid(),
    'Zero-Trust Cloud Security & DevSecOps',
    'Security is no longer an afterthought. Learn to architect impenetrable cloud environments. Master Kubernetes security, automated penetration testing pipelines, Terraform Infrastructure-as-Code (IaC), AWS IAM least-privilege policies, and SIEM real-time threat logging.',
    'Cybersecurity',
    'Advanced / Job-Ready',
    45700.00,
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '4months',
    45700.00,
    0.00,
    0.00,
    '{"4months": 45700}'::jsonb,
    now()
),
(
    gen_random_uuid(),
    'Applied Data Science & Business Intelligence',
    'Every major corporation runs on data analytics. Master the complete data lifecycle: write complex SQL window functions, build automated Python scraping and cleaning pipelines with Pandas and NumPy, construct predictive machine learning models using Scikit-Learn, and design high-impact executive dashboards in Power BI and Tableau.',
    'Data Science & Analytics',
    'Advanced / Job-Ready',
    41500.00,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '5months',
    0.00,
    41500.00,
    0.00,
    '{"5months": 41500}'::jsonb,
    now()
),
(
    gen_random_uuid(),
    'AR/VR Spatial Computing & Unreal Engine 5 Architecture',
    'Spatial computing (Apple Vision Pro, Meta Quest) is revolutionizing software. Learn C++ and Visual Scripting in Unreal Engine 5, design photorealistic 3D environments with Nanite and Lumen, build VR physics interactions, and create immersive enterprise training simulations.',
    'Immersive Tech',
    'Advanced / Job-Ready',
    49900.00,
    'https://images.unsplash.com/photo-1551650975-87de59e977f1?w=800&auto=format&fit=crop&q=80',
    true,
    'mega',
    '6months',
    0.00,
    0.00,
    49900.00,
    '{"6months": 49900}'::jsonb,
    now()
);
