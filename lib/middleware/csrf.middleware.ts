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

  const source = origin || referer || '';

  // Allow same-origin requests
  const host = request.headers.get('host');
  if (host && (source === `https://${host}` || source === `http://${host}`)) return;

  if (ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed))) return;

  throw new ValidationError('CSRF: недозволене джерело запиту');
}
