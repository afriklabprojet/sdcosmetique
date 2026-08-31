export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(body || `API ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return base.replace(/\/$/, '');
}

function apiOrigin(): string {
  const base = apiBase();
  try {
    return new URL(base).origin;
  } catch {
    return base.replace(/\/(v\d+|api)\/?$/, '');
  }
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

let csrfPrimed = false;

async function primeCsrf(): Promise<void> {
  if (csrfPrimed || typeof document === 'undefined') return;
  const res = await fetch(`${apiOrigin()}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }
  csrfPrimed = true;
}

function isMutating(method: string): boolean {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function resolveUrl(path: string, root: boolean): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return root ? `${apiOrigin()}${suffix}` : `${apiBase()}${suffix}`;
}

async function request<T>(path: string, init: RequestInit | undefined, root: boolean): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase();
  if (isMutating(method)) {
    await primeCsrf();
  }

  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (init?.body !== undefined && !headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const xsrf = readCookie('XSRF-TOKEN');
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf);

  const res = await fetch(resolveUrl(path, root), {
    ...init,
    method,
    credentials: 'include',
    redirect: 'manual',
    headers,
  });

  if (res.status === 419) {
    csrfPrimed = false;
  }

  if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400)) {
    csrfPrimed = false;
    throw new ApiError(res.status || 0, 'Redirected');
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** Call a path under `NEXT_PUBLIC_API_URL` (includes `/api`). */
export function api<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init, false);
}

/** Call a path on the Laravel origin (`/login`, `/sanctum/csrf-cookie`, …). */
export function apiRoot<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, init, true);
}

export function unwrapData<T>(body: { data: T } | T): T {
  if (body !== null && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

const FORTIFY_FR: Record<string, string> = {
  'These credentials do not match our records.': 'Email ou mot de passe incorrect.',
  'The email has already been taken.': 'Un compte existe déjà avec cette adresse email.',
  'The password field confirmation does not match.': 'Les mots de passe ne correspondent pas.',
  'The provided password does not match your current password.': 'Le mot de passe actuel est incorrect.',
};

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) {
    return err instanceof Error ? err.message : fallback;
  }
  try {
    const parsed = JSON.parse(err.body) as {
      message?: string;
      error?: string;
      errors?: Record<string, string[] | string>;
    };
    if (parsed.errors) {
      const first = Object.values(parsed.errors)[0];
      const text = Array.isArray(first) ? first[0] : first;
      if (text) return FORTIFY_FR[text] ?? text;
    }
    const raw = parsed.message || parsed.error || err.body;
    return (raw && FORTIFY_FR[raw]) || raw || fallback;
  } catch {
    return err.body || fallback;
  }
}
