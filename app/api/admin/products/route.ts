import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { handleError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('products').insert(body).select().single();
    if (error) throw error;
    return Response.json({ product: data });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { id, ...payload } = body;
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) throw error;
    if (!data) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    return Response.json({ product: data });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'id is required' }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
