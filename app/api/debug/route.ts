import { NextRequest } from 'next/server';
import { supabase } from '@/lib/utils/supabase';

export async function GET(request: NextRequest) {
  const info: Record<string, unknown> = {
    hasOrigin: !!request.headers.get('origin'),
    hasReferer: !!request.headers.get('referer'),
    hasAuth: !!request.headers.get('authorization'),
    requestUrl: request.url,
  };

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const parts = token.split('.');
    info.tokenParts = parts.length;
    info.tokenPreview = token.substring(0, 15) + '...';

    if (parts.length === 3) {
      try {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const text = Buffer.from(b64, 'base64').toString();
        const payload = JSON.parse(text);
        info.payload = {
          sub: payload.sub,
          email: payload.email ? payload.email.substring(0, 3) + '...' : null,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
          iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
        };
      } catch (e: unknown) {
        info.decodeError = e instanceof Error ? e.message : String(e);
      }

      try {
        const { data, error } = await supabase.auth.getUser(token);
        info.getUserResult = {
          hasUser: !!data?.user,
          error: error ? { message: error.message, name: error.name } : null,
        };
      } catch (e: unknown) {
        info.getUserException = e instanceof Error ? e.message : String(e);
      }
    }
  } else {
    info.authHeaderPreview = authHeader ? authHeader.substring(0, 20) + '...' : null;
  }

  return Response.json(info);
}
