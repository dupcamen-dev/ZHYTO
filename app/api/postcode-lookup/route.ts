import { NextRequest } from 'next/server';
import { validatePostcode } from '@/lib/postcodes';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get('postcode');
  if (!postcode || !postcode.trim()) {
    return Response.json({ error: 'Postcode required' }, { status: 400 });
  }

  const result = validatePostcode(postcode);
  if (!result.valid) {
    return Response.json({ valid: false });
  }

  return Response.json({
    valid: true,
    postcode: result.postcode,
    district: result.district || 'London',
    region: 'London',
  });
}
