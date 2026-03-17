-- Storage setup for employee photos
-- Run this in Supabase SQL Editor after running schema.sql

-- Create storage bucket for employee photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-photos', 'employee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public access
CREATE POLICY "Public Access for Employee Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can upload employee photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can update employee photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated users can delete employee photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'employee-photos');

