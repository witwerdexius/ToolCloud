-- Create public storage bucket for item images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'items',
  'items',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access on items bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'items');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload to items bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'items');

-- Allow users to update/delete their own uploads
CREATE POLICY "Users can update own objects in items bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own objects in items bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'items' AND auth.uid()::text = (storage.foldername(name))[1]);
