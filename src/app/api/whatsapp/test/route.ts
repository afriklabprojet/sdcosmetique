import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { normalizePhone } from '@/lib/whatsapp';

export const runtime = 'nodejs';

/**
 * POST /api/whatsapp/test
 * Body: { phone: string }
 * Envoie le template hello_world au numéro indiqué.
 * Réservé aux admins — sert à vérifier que les credentials fonctionnent.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { phone?: string };
  try { body = await req.json(); } catch { body = {}; }

  const raw = body.phone;
  if (!raw) return NextResponse.json({ error: 'phone_required' }, { status: 400 });

  const phone = normalizePhone(raw);

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return NextResponse.json(
      { error: 'WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID absent du serveur.' },
      { status: 500 }
    );
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: { name: 'hello_world', language: { code: 'en_US' } },
  };

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error('[whatsapp/test]', json);
    return NextResponse.json({ error: json }, { status: res.status });
  }

  return NextResponse.json({ ok: true, phone, result: json });
}
