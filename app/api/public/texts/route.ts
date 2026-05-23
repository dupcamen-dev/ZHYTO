import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { handleError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('settings')
      .select('value')
      .eq('key', 'site_texts')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return Response.json({});
      throw error;
    }

    return Response.json(data?.value || {});
  } catch (error) {
    return handleError(error);
  }
}
