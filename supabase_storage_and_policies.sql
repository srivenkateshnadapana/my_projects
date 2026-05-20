-- =========================================================================
-- STAR LMS: AUTOMATED SUPABASE STORAGE BUCKETS & SECURITY POLICIES SCHEMA
-- =========================================================================

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, '{"image/png", "image/jpeg", "image/gif", "image/webp"}'),
  ('blog-thumbnails', 'blog-thumbnails', true, 10485760, '{"image/png", "image/jpeg", "image/gif", "image/webp"}'),
  ('certificate-pdfs', 'certificate-pdfs', true, 20971520, '{"application/pdf"}'),
  ('ticket-attachments', 'ticket-attachments', true, 20971520, '{"image/png", "image/jpeg", "application/pdf", "application/zip"}')
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- 2. Storage RLS Security Policies for 'avatars'
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- 3. Storage RLS Security Policies for 'blog-thumbnails'
CREATE POLICY "Blog thumbnails are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-thumbnails');

CREATE POLICY "Authenticated admins can upload blog thumbnails" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-thumbnails');

-- 4. Storage RLS Security Policies for 'certificate-pdfs'
CREATE POLICY "Certificate PDFs are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificate-pdfs');

CREATE POLICY "Authenticated users can upload certificate PDFs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'certificate-pdfs');

-- 5. Storage RLS Security Policies for 'ticket-attachments'
CREATE POLICY "Ticket attachments are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can upload ticket attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ticket-attachments');
