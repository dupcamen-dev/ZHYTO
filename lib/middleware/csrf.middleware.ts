import { ValidationError } from '../utils/errors';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

export function validateCsrf(request: Request): void {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    return;
  }

  let source: string;
  if (origin) {
    source = origin;
  } else if (referer) {
    try { source = new URL(referer).origin; } catch { return; }
  } else {
    return;
  }

  // Allow same-origin requests — use request.url (reliable in Next.js serverless)
  try {
    const reqOrigin = new URL(request.url).origin;
    if (source === reqOrigin) return;
  } catch { /* ignore invalid url */ }

  if (ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed))) return;

  throw new ValidationError('CSRF: недозволене джерело запиту');
}
