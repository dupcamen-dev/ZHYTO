import { supabase } from '../utils/supabase';
import { AuthenticationError } from '../utils/errors';
import { User } from '../types/user.types';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

function checkCsrf(request: Request): void {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (!origin && !referer) return;
  const source = origin || referer || '';
  // Allow same-origin requests
  const host = request.headers.get('host');
  if (host && (source === `https://${host}` || source === `http://${host}`)) return;
  // Check explicit whitelist
  if (ALLOWED_ORIGINS.some(allowed => source.startsWith(allowed))) return;
  throw new AuthenticationError('CSRF: недозволене джерело запиту');
}

export async function requireAuth(request: Request): Promise<User> {
  checkCsrf(request);

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Токен не надано');
  }

  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthenticationError('Невірний токен');
  }

  return { id: user.id, email: user.email! };
}

export async function getUser(request: Request): Promise<User | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}
