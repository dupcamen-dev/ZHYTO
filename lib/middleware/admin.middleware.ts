import { getSupabaseAdmin } from '../utils/supabase';
import { AuthorizationError } from '../utils/errors';
import { requireAuth } from './auth.middleware';
import { User } from '../types/user.types';

export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireAuth(request);
  const client = getSupabaseAdmin();

  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile || profile.role !== 'admin') {
    throw new AuthorizationError('Потрібні права адміністратора');
  }

  return user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const client = getSupabaseAdmin();
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.role === 'admin';
}
