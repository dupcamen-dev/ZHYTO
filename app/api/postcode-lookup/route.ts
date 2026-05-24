import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const postcode = request.nextUrl.searchParams.get('postcode');
    if (!postcode || !postcode.trim()) {
      return Response.json({ error: 'Postcode required' }, { status: 400 });
    }

    const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`);

    if (res.status === 404) {
      return Response.json({ valid: false });
    }

    if (!res.ok) {
      return Response.json({ error: 'Lookup failed' }, { status: res.status });
    }

    const body = await res.json();
    const r = body.result;

    return Response.json({
      valid: true,
      postcode: r.postcode,
      district: r.admin_district || r.region || '',
      region: r.region || '',
      country: r.country || '',
    });
  } catch {
    return Response.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
