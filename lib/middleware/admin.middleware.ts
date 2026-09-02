import { supabase } from '../utils/supabase';
import { AuthorizationError } from '../utils/errors';
import { requireAuth } from './auth.middleware';
import { User } from '../types/user.types';

export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireAuth(request);

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    throw new AuthorizationError('Потрібні права адміністратора');
  }

  return user;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'admin';
}
