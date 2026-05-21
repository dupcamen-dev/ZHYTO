import { getSupabaseAdmin } from '@/lib/utils/supabase';

export async function GET() {
  try {
    await getSupabaseAdmin().from('settings').select('id', { count: 'exact', head: true });
    return Response.json({ ok: true, ts: Date.now() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
