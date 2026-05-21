import { type SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { handleError, ValidationError } from '@/lib/utils/errors';

let _db: SupabaseClient | null = null;
function adminDb() {
  if (!_db) _db = getSupabaseAdmin();
  return _db;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      const { data, error } = await adminDb()
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();

      if (error) throw error;
      return Response.json(data);
    }

    const { data, error } = await adminDb()
      .from('settings')
      .select('*');

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    
    if (!body.key || !body.value) {
      throw new ValidationError('key and value are required');
    }

    const { data, error } = await adminDb()
      .from('settings')
      .upsert({
        key: body.key,
        value: body.value,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}
