import { ValidationError } from '../utils/errors';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://zhyto.london').split(',');

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

  const isAllowed = ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed));
  if (!isAllowed) {
    throw new ValidationError('CSRF: недозволене джерело запиту');
  }
}
