import { api } from '@/shared/api/client';

export async function subscribeNewsletter(email: string): Promise<void> {
  await api('/newsletter-subscriptions', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  await api('/contact-messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
