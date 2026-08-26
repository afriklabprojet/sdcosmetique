import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { requireAdmin } from '@/shared/auth/admin.guard';
import { rateLimit, getIp, rateLimitHeaders } from '@/shared/http/rate-limit.guard';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

function detectMimeFromBytes(buf: Uint8Array): string | null {
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return 'image/webp';
  return null;
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const rl = await rateLimit(`upload:${getIp(req)}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate_limit_exceeded' }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string | null) ?? 'uploads';

    const folder = rawFolder.replaceAll(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez JPG, PNG, WEBP ou GIF.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5 Mo).' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const realMime = detectMimeFromBytes(bytes);
    if (realMime !== file.type) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas à son type déclaré.' },
        { status: 400 }
      );
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, Buffer.from(bytes));

    const publicUrl = `/uploads/${folder}/${filename}`;
    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('[upload] Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'upload.' }, { status: 500 });
  }
}
