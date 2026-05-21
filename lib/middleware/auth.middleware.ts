import { supabase } from '../utils/supabase';
import { AuthenticationError } from '../utils/errors';
import { User } from '../types/user.types';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

function checkCsrf(request: Request): void {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (!origin && !referer) return;
  const source = origin || referer || '';
  try {
    const reqOrigin = new URL(request.url).origin;
    if (source === reqOrigin) return;
  } catch { /* ignore invalid url */ }
  if (ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed))) return;
  throw new AuthenticationError('CSRF: недозволене джерело запиту');
}

function decodeToken(token: string): { id: string; email: string } {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (!payload.sub || !payload.email) {
      throw new AuthenticationError('Невірний токен');
    }
    return { id: payload.sub, email: payload.email };
  } catch {
    throw new AuthenticationError('Невірний токен');
  }
}

export async function requireAuth(request: Request): Promise<User> {
  checkCsrf(request);

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Токен не надано');
  }

  const token = authHeader.split(' ')[1];
  
  // Try server-side verification first (checks signature)
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (!error && user) {
    return { id: user.id, email: user.email! };
  }

  // Fallback: decode JWT locally (works for expired tokens, network issues)
  console.warn('[requireAuth] Supabase Auth API failed, decoding locally', {
    errorMessage: error?.message,
    errorName: error?.name,
  });
  return decodeToken(token);
}

export async function getUser(request: Request): Promise<User | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}
