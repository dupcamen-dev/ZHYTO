import { NextRequest } from 'next/server';
import { handleError } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const postcode = request.nextUrl.searchParams.get('postcode');
    if (!postcode || !postcode.trim()) {
      return Response.json({ error: 'Postcode is required' }, { status: 400 });
    }

    const apiKey = process.env.IDEAL_POSTCODES_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Postcode lookup not configured' }, { status: 500 });
    }

    const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
    const res = await fetch(
      `https://api.ideal-postcodes.co.uk/v1/postcodes/${clean}/addresses?api_key=${apiKey}`,
      { headers: { Accept: 'application/json' } }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return Response.json({ addresses: [] });
      }
      return Response.json({ error: 'Postcode lookup failed' }, { status: res.status });
    }

    const body = await res.json();

    let hits: any[] = []
    if (Array.isArray(body.result)) {
      hits = body.result
    } else if (body.result?.hits) {
      hits = body.result.hits
    }

    if (hits.length === 0) {
      return Response.json({ addresses: [] });
    }

    const addresses = hits.map((h: any) => ({
      line_1: h.line_1 || '',
      line_2: h.line_2 || '',
      postcode: h.postcode || clean,
      city: h.post_town || '',
      county: h.county || '',
    }));

    return Response.json({ addresses });
  } catch (error) {
    return handleError(error);
  }
}
