import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireAdmin } from '@/lib/admin-auth';

// Map MIME → extension (source unique de vérité, empêche le spoofing d'extension)
const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(req: NextRequest) {
  // 1. Authentification admin obligatoire
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string | null) ?? 'uploads';

    // 2. Sanitisation du dossier — empêche le path traversal (ex: "../../etc")
    const folder = rawFolder.replaceAll(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    // 3. Validation du type MIME — l'extension est dérivée du MIME, pas du nom du fichier
    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.' },
        { status: 400 }
      );
    }

    // 4. Validation de la taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo).' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from('site-images')
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (upErr) {
      // Erreur interne loguée côté serveur, message générique renvoyé au client
      console.error('[upload] Supabase storage error:', upErr.message);
      return NextResponse.json({ error: 'Échec de l\'upload. Réessayez.' }, { status: 500 });
    }

    const { data } = supabase.storage.from('site-images').getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error('[upload] Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'upload.' }, { status: 500 });
  }
}
