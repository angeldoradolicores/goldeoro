-- =====================================================
-- STORAGE BUCKET: products
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. Create the 'products' bucket (public so uploaded media URLs work without tokens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  209715200, -- 200 MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 209715200,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo'
  ];

-- 2. RLS policies for storage.objects (products bucket)

-- Public read access to all files in 'products' bucket
DROP POLICY IF EXISTS "Public can read product media" ON storage.objects;
CREATE POLICY "Public can read product media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Only admins can upload
DROP POLICY IF EXISTS "Admins can upload product media" ON storage.objects;
CREATE POLICY "Admins can upload product media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Only admins can update
DROP POLICY IF EXISTS "Admins can update product media" ON storage.objects;
CREATE POLICY "Admins can update product media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- Only admins can delete
DROP POLICY IF EXISTS "Admins can delete product media" ON storage.objects;
CREATE POLICY "Admins can delete product media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )
  );

-- =====================================================
-- REALTIME: Enable realtime on orders table (for bell notification)
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'products';
-- Check policies:
-- SELECT * FROM storage.policies WHERE bucket_id = 'products';
