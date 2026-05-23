import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { handleError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseAdmin();
    const keys = ['delivery', 'categories', 'categories_desc', 'categories_names', 'promo_codes'];

    const { data, error } = await db
      .from('settings')
      .select('key, value')
      .in('key', keys);

    if (error) throw error;

    const result: Record<string, unknown> = {};
    for (const row of data || []) {
      result[row.key] = row.value;
    }

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
