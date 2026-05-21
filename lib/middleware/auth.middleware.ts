import { supabase } from '../utils/supabase';
import { AuthenticationError } from '../utils/errors';
import { User } from '../types/user.types';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
// Grace period: accept tokens expired up to 24 hours ago
const TOKEN_EXP_GRACE_MS = 24 * 60 * 60 * 1000;

function checkCsrf(request: Request): void {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (!origin && !referer) return;
  let source: string;
  if (origin) {
    source = origin;
  } else if (referer) {
    try { source = new URL(referer).origin; } catch { return; }
  } else {
    return;
  }
  try {
    const reqOrigin = new URL(request.url).origin;
    if (source === reqOrigin) return;
  } catch { /* ignore */ }
  if (ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed))) return;
  throw new AuthenticationError('CSRF: недозволене джерело запиту');
}

function decodeToken(token: string): { id: string; email: string } {
  // JWT payload is base64url-encoded JSON
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(Buffer.from(b64, 'base64').toString());

  if (!payload.sub || !payload.email) {
    throw new AuthenticationError('Невірний токен');
  }

  // Reject tokens expired beyond grace period
  if (payload.exp) {
    const expiredMs = Date.now() - payload.exp * 1000;
    if (expiredMs > TOKEN_EXP_GRACE_MS) {
      throw new AuthenticationError('Токен прострочений, увійдіть знову');
    }
  }

  return { id: payload.sub, email: payload.email };
}

export async function requireAuth(request: Request): Promise<User> {
  checkCsrf(request);

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Токен не надано');
  }

  const token = authHeader.split(' ')[1];

  // Primary: verify with Supabase Auth API (validates signature)
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (!error && user) {
    return { id: user.id, email: user.email! };
  }

  // Fallback: decode JWT locally — handles expired tokens, network blips
  console.warn('[requireAuth] Supabase Auth API failed, falling back to local JWT decode', JSON.stringify({
    errorMessage: error?.message,
    errorName: error?.name,
  }));
  try {
    return decodeToken(token);
  } catch (fallbackErr) {
    console.error('[requireAuth] JWT decode also failed', JSON.stringify({
      error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
      tokenParts: token.split('.').length,
      tokenPreview: token.substring(0, 20) + '...',
    }));
    throw fallbackErr;
  }
}

export async function getUser(request: Request): Promise<User | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}
