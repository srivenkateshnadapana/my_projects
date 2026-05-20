-- ====================================================================
-- STAR LMS: PREMIUM KNOWLEDGE BLOG SEED SCRIPT
-- ====================================================================

-- Clear existing sample blogs to avoid duplicate slugs
DELETE FROM public.blogs;

INSERT INTO public.blogs (slug, title, excerpt, content, thumbnail_url, is_published, created_at) VALUES
(
    'future-of-autonomous-ai-agents',
    'The Rise of Autonomous AI Agents & Multi-Agent Automation',
    'Explore how autonomous AI agents and robotic process automation are transforming enterprise workflows and software development.',
    '<p>Artificial Intelligence is undergoing a seismic shift from passive conversational chatbots to active, autonomous multi-agent systems. In enterprise environments, AI agents now collaborate, partition complex architectures into modular sub-tasks, and autonomously execute code deployments with minimal human intervention.</p><p>At <strong>STAR LMS</strong>, our cutting-edge AI Masterclass equips engineers with the deep foundational frameworks required to build, test, and deploy robust multi-agent systems utilizing LangGraph, AutoGen, and custom LLM toolchains.</p><h3>Key Takeaways for 2026:</h3><ul><li>Transition from prompt engineering to agentic workflows.</li><li>Self-healing autonomous CI/CD pipelines.</li><li>Integration of spatial vision and robotic actuators.</li></ul>',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    true,
    now() - interval '2 days'
),
(
    'nextjs-15-cloud-native-engineering',
    'Architecting Zero-Latency Web Apps with Next.js 15 & Supabase',
    'A deep dive into server components, edge caching, and real-time PostgreSQL synchronization for high-throughput cloud applications.',
    '<p>Modern web engineering demands uncompromising speed, seamless edge synchronization, and bulletproof security. Next.js 15 introduces revolutionary caching heuristics and asynchronous server components that redefine frontend performance.</p><p>When coupled with Supabase PostgreSQL and Row Level Security, full-stack developers can construct globally distributed web applications in record time. Discover the architectural blueprints used by elite engineering teams in our Full-Stack Cloud Native Engineering masterclass.</p>',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    true,
    now() - interval '5 days'
),
(
    'spatial-computing-unreal-engine-5',
    'Spatial Computing & Immersive XR: Building World-Scale Virtual Realms',
    'Discover how Unreal Engine 5 Nanite geometry and Apple Vision Pro ARKit are converging to create photorealistic spatial experiences.',
    '<p>The boundaries between digital interfaces and physical reality are dissolving. With the advent of advanced spatial computing hardware and Unreal Engine 5 real-time raytracing, creating photorealistic XR environments is now within reach for agile development teams.</p><p>This article explores real-time GPU pipelines, spatial audio propagation, and interactive XR physics engines. Join the XR revolution with STAR LMS masterclasses.</p>',
    'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=800&auto=format&fit=crop&q=80',
    true,
    now() - interval '10 days'
),
(
    'zero-trust-cloud-security-devsecops',
    'Zero-Trust Cloud Security: Hardening Kubernetes & Microservices',
    'Why legacy perimeter security is obsolete and how automated DevSecOps pipelines guarantee cryptographic identity across distributed nodes.',
    '<p>In a world of distributed cloud clusters and hybrid remote teams, perimeter defense is fundamentally broken. Zero-Trust architecture operates under a simple assumption: assume breach and verify every single request cryptographically.</p><p>Learn how to implement automated vulnerability scanning, mTLS mesh networks, and immutable infrastructure in our Zero-Trust Cloud Security Masterclass.</p>',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    true,
    now() - interval '14 days'
);
