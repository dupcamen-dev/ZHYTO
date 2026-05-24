import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { handleError } from '@/lib/utils/errors';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      return Response.json({ error: 'Storage not configured' }, { status: 503 });
    }

    const supabase = createClient(url, serviceRoleKey);

    // Ensure bucket exists
    const { error: bucketError } = await supabase.storage.getBucket('product-images');
    if (bucketError?.message?.includes('not found')) {
      const { error: createError } = await supabase.storage.createBucket('product-images', {
        public: true,
      });
      if (createError) {
        return Response.json({ error: `Bucket creation failed: ${createError.message}` }, { status: 500 });
      }
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `about-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      return Response.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path);

    return Response.json({ url: urlData.publicUrl });
  } catch (error) {
    return handleError(error);
  }
}
