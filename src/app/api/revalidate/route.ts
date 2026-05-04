/**
 * POST /api/revalidate
 * Revalidation ISR on-demand — déclenché par un webhook Supabase,
 * un CMS ou un script de déploiement.
 *
 * Header requis : x-revalidate-secret: <REVALIDATE_SECRET>
 * Body (JSON) : { paths?: string[], tags?: string[] }
 *
 * Exemple :
 *   curl -X POST https://example.com/api/revalidate \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"tags":["products","categories"]}'
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { paths?: unknown; tags?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string')
    : [];
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === 'string')
    : [];

  if (paths.length === 0 && tags.length === 0) {
    return NextResponse.json(
      { error: 'provide at least one path or tag' },
      { status: 422 },
    );
  }

  const revalidated: { paths: string[]; tags: string[] } = { paths: [], tags: [] };

  for (const path of paths) {
    revalidatePath(path, 'page');
    revalidated.paths.push(path);
  }

  for (const tag of tags) {
    revalidateTag(tag, 'default');
    revalidated.tags.push(tag);
  }

  return NextResponse.json({ ok: true, revalidated });
}
