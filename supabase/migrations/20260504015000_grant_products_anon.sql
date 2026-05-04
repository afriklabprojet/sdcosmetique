-- Accorder les permissions nécessaires sur products au rôle anon et authenticated
-- Sans ce GRANT, PostgREST retourne 404 même avec une RLS policy USING(true)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
