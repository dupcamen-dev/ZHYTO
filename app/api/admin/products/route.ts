import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { supabase } from '@/lib/supabase';

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    if (supabase) return supabase;
    throw new Error('Supabase client not available — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

function respond(data: any, status = 200) {
  return Response.json(data, { status });
}

function respondError(msg: string, status = 500) {
  console.error(msg);
  return Response.json({ error: msg }, { status });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const client = getClient();
    const { data, error } = await client.from('products').insert(body).select().single();
    if (error) return respondError(`Database insert error: ${error.message} ${error.details || ''}`, 500);
    return respond({ product: data });
  } catch (error: any) {
    return respondError(error?.message || 'Unknown error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { id, ...payload } = body;
    if (!id) return respondError('id is required', 400);
    const client = getClient();
    const { data, error } = await client.from('products').update(payload).eq('id', id).select().single();
    if (error) return respondError(`Database update error: ${error.message} ${error.details || ''}`, 500);
    if (!data) return respondError('Product not found', 404);
    return respond({ product: data });
  } catch (error: any) {
    return respondError(error?.message || 'Unknown error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return respondError('id is required', 400);
    const client = getClient();
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) return respondError(`Database delete error: ${error.message} ${error.details || ''}`, 500);
    return respond({ success: true });
  } catch (error: any) {
    return respondError(error?.message || 'Unknown error', 500);
  }
}
