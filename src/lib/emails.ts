/**
 * Email helpers — Resend (HTTP API, no SDK required).
 *
 * Active uniquement si RESEND_API_KEY est défini. Sinon no-op silencieux.
 *
 * Variables d'environnement attendues:
 *   - RESEND_API_KEY        ex: re_xxx
 *   - RESEND_FROM_EMAIL     ex: "SD Cosmétique <bonjour@sdcosmetique.ci>"
 *   - SITE_URL              ex: https://sdcosmetique.ci  (pour les liens)
 */

import { formatPrice } from './products';
import type { OrderDraft } from './orders';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// ─── Helpers ────────────────────────────────────────────────────────────────
// Note: Using .replace(/pattern/g, replacement) instead of .replaceAll() for ES2017 compatibility
// Both are functionally equivalent for global replacements
function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function sendViaResend(payload: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return { ok: false, error: 'not_configured' };
  }
  try {
    const r = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, ...payload }),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      void txt;
      return { ok: false, error: `http_${r.status}` };
    }
    const j = (await r.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: j.id };
  } catch {
    return { ok: false, error: 'exception' };
  }
}

// ─── Templates ──────────────────────────────────────────────────────────────
function orderConfirmationHtml(order: OrderDraft): string {
  const siteUrl = process.env.SITE_URL ?? '';
  const items = order.items
    .map(it => {
      const line = `${escapeHtml(it.product.name)} × ${it.quantity}`;
      const price = formatPrice(it.product.price * it.quantity);
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333">${line}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right">${price}</td>
      </tr>`;
    })
    .join('');
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:22px;color:#1a1a1a;font-weight:600;margin:0 0 8px">Merci pour votre commande ✨</h1>
    <p style="font-size:14px;color:#555;margin:0 0 24px">
      Bonjour ${escapeHtml(order.delivery.firstName)}, nous avons bien reçu votre commande
      <strong>${escapeHtml(order.orderNumber)}</strong>. Vous recevrez un nouvel email dès qu'elle sera expédiée.
    </p>
    <div style="background:#fff;border:1px solid #e8e2d8;border-radius:12px;padding:20px;margin-bottom:20px">
      <table style="width:100%;border-collapse:collapse">
        ${items}
        <tr><td style="padding:10px 0 0;font-size:13px;color:#777">Sous-total</td>
            <td style="padding:10px 0 0;font-size:13px;color:#777;text-align:right">${formatPrice(order.subtotal)}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#777">Livraison</td>
            <td style="padding:4px 0;font-size:13px;color:#777;text-align:right">${formatPrice(order.shippingCost)}</td></tr>
        <tr><td style="padding:10px 0 0;font-size:15px;color:#1a1a1a;font-weight:700">Total</td>
            <td style="padding:10px 0 0;font-size:15px;color:#1a1a1a;font-weight:700;text-align:right">${formatPrice(order.total)}</td></tr>
      </table>
    </div>
    <p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 20px">
      <strong>Adresse de livraison</strong><br/>
      ${escapeHtml(order.delivery.firstName)} ${escapeHtml(order.delivery.lastName)}<br/>
      ${escapeHtml(order.delivery.address)}<br/>
      ${escapeHtml(order.delivery.city)}, ${escapeHtml(order.delivery.country)}<br/>
      ${escapeHtml(order.delivery.phone)}
    </p>
    ${siteUrl ? `<a href="${siteUrl}/compte" style="display:inline-block;padding:12px 22px;background:#D4A24E;color:#1a1a1a;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Suivre ma commande</a>` : ''}
    <p style="margin:32px 0 0;font-size:11px;color:#999">SD Cosmétique — La beauté qui vous ressemble.</p>
  </div>
</body></html>`;
}

function orderConfirmationText(order: OrderDraft): string {
  const lines = order.items.map(it => `- ${it.product.name} × ${it.quantity} — ${formatPrice(it.product.price * it.quantity)}`).join('\n');
  return [
    `Merci pour votre commande ${order.orderNumber} !`,
    '',
    'Récapitulatif :',
    lines,
    '',
    `Sous-total : ${formatPrice(order.subtotal)}`,
    `Livraison  : ${formatPrice(order.shippingCost)}`,
    `Total      : ${formatPrice(order.total)}`,
    '',
    `Livraison à : ${order.delivery.firstName} ${order.delivery.lastName}`,
    `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.country}`,
    '',
    'SD Cosmétique',
  ].join('\n');
}

// ─── Public API ─────────────────────────────────────────────────────────────
export async function sendOrderConfirmation(order: OrderDraft): Promise<void> {
  const to = order.delivery?.email?.trim();
  if (!to) return;
  await sendViaResend({
    to,
    subject: `Commande ${order.orderNumber} confirmée — SD Cosmétique`,
    html: orderConfirmationHtml(order),
    text: orderConfirmationText(order),
  });
}

export async function sendOrderShipped(order: OrderDraft, trackingUrl?: string): Promise<void> {
  const to = order.delivery?.email?.trim();
  if (!to) return;
  const html = `<!doctype html><html><body style="font-family:-apple-system,sans-serif;background:#f7f5f1;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e8e2d8">
      <h1 style="font-size:20px;color:#1a1a1a;margin:0 0 12px">Votre commande est en route 📦</h1>
      <p style="font-size:14px;color:#555;line-height:1.6">
        Bonjour ${escapeHtml(order.delivery.firstName)}, votre commande <strong>${escapeHtml(order.orderNumber)}</strong> vient d'être expédiée.
      </p>
      ${trackingUrl ? `<p><a href="${trackingUrl}" style="display:inline-block;padding:10px 18px;background:#D4A24E;color:#1a1a1a;border-radius:8px;text-decoration:none;font-weight:600">Suivre le colis</a></p>` : ''}
    </div>
  </body></html>`;
  await sendViaResend({
    to,
    subject: `Commande ${order.orderNumber} expédiée — SD Cosmétique`,
    html,
    text: `Votre commande ${order.orderNumber} est expédiée. ${trackingUrl ?? ''}`.trim(),
  });
}

// ─── Message de contact ───────────────────────────────────────────────────
export async function sendContactMessage(args: {
  nom: string;
  email: string;
  sujet: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { nom, email, sujet, message } = args;
  const adminEmail = process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1]
    ?? process.env.RESEND_FROM_EMAIL
    ?? '';
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f7f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <div style="background:#fff;border:1px solid #e8e2d8;border-radius:12px;padding:24px">
        <p style="font-size:11px;color:#999;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px">Formulaire de contact</p>
        <h1 style="font-size:18px;color:#1a1a1a;margin:0 0 18px">${escapeHtml(sujet)}</h1>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
          <tr><td style="font-size:12px;color:#777;padding:4px 0;width:80px">Nom</td><td style="font-size:14px;color:#333">${escapeHtml(nom)}</td></tr>
          <tr><td style="font-size:12px;color:#777;padding:4px 0">Email</td><td style="font-size:14px;color:#333"><a href="mailto:${escapeHtml(email)}" style="color:#D4A24E">${escapeHtml(email)}</a></td></tr>
        </table>
        <div style="background:#FAFAFA;border:1px solid #eee;border-radius:8px;padding:14px">
          <p style="font-size:14px;color:#333;line-height:1.7;margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      </div>
      <p style="font-size:11px;color:#999;text-align:center;margin:18px 0 0">SD Cosmétique — Répondez directement à cet email pour contacter ${escapeHtml(nom)}.</p>
    </div>
  </body></html>`;
  const text = `Nouveau message de contact\n\nNom : ${nom}\nEmail : ${email}\nSujet : ${sujet}\n\n${message}`;
  return sendViaResend({
    to: adminEmail,
    subject: `[Contact] ${sujet} — ${nom}`,
    html,
    text,
    reply_to: email,
  });
}

// ─── Notification points fidélité ─────────────────────────────────────────
export async function sendJekoPointsNotification(args: {
  to: string;
  firstName?: string;
  points: number;
  newBalance: number;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { to, firstName, points, newBalance, message } = args;
  const siteUrl = process.env.SITE_URL ?? '';
  const sign = points >= 0 ? '+' : '';
  const verb = points >= 0 ? 'crédités' : 'retirés';
  const color = points >= 0 ? '#4ade80' : '#f87171';
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f7f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:520px;margin:0 auto;padding:32px 24px">
      <div style="background:#fff;border:1px solid #e8e2d8;border-radius:12px;padding:24px">
        <p style="font-size:11px;color:#999;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 4px">SD Fidélité ✦</p>
        <h1 style="font-size:20px;color:#1a1a1a;margin:0 0 14px">Bonjour ${escapeHtml(firstName ?? '')},</h1>
        <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 18px">
          ${Math.abs(points)} point${Math.abs(points) > 1 ? 's' : ''} viennent d'être ${verb} sur votre compte fidélité.
        </p>
        <div style="background:#FFF7ED;border:1px solid #F4E1C7;border-radius:10px;padding:18px;text-align:center;margin-bottom:18px">
          <p style="font-size:11px;color:#92400E;margin:0 0 4px;letter-spacing:0.08em;text-transform:uppercase">Variation</p>
          <p style="font-size:32px;font-weight:800;color:${color};margin:0;letter-spacing:-0.02em">${sign}${points}</p>
          <p style="font-size:12px;color:#92400E;margin:6px 0 0">Solde actuel : <strong>${newBalance} pts</strong></p>
        </div>
        ${message ? `<p style="font-size:13px;color:#555;line-height:1.6;background:#FAFAFA;border-left:3px solid #D4A24E;padding:10px 14px;border-radius:4px;margin:0 0 18px"><em>${escapeHtml(message)}</em></p>` : ''}
        ${siteUrl ? `<a href="${siteUrl + '/compte'}" style="display:inline-block;padding:11px 22px;background:#D4A24E;color:#1a1a1a;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">Voir mon solde</a>` : ''}
      </div>
      <p style="font-size:11px;color:#999;text-align:center;margin:18px 0 0">SD Cosmétique — La beauté qui vous ressemble.</p>
    </div>
  </body></html>`;
  const text = `Bonjour ${firstName ?? ''},\n\n${Math.abs(points)} point${Math.abs(points) > 1 ? 's' : ''} ${verb} sur votre compte fidélité.\nSolde actuel : ${newBalance} pts.${message ? '\n\n' + message : ''}\n\nSD Cosmétique`;
  return sendViaResend({
    to,
    subject: `${sign}${points} points fidélité — SD Cosmétique`,
    html,
    text,
  });
}
