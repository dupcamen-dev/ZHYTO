import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { supabase } from '@/lib/supabase';

function getClient() {
  try { return getSupabaseAdmin() } catch { return supabase }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { key, value } = await request.json();
    if (!key) return Response.json({ error: 'key is required' }, { status: 400 });
    const client = getClient();
    const { data, error } = await client.from('settings').upsert({ key, value }, { onConflict: 'key' }).select().single();
    if (error) throw error;
    return Response.json({ setting: data });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
