-- Bucket public pour les images du site (hero, avatars, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-images',
  'site-images',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique (CDN)
CREATE POLICY "site_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

-- Upload réservé aux admins authentifiés
CREATE POLICY "site_images_admin_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-images'
  AND auth.role() = 'authenticated'
);

-- Suppression réservée aux admins
CREATE POLICY "site_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-images'
  AND auth.role() = 'authenticated'
);
