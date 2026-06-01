import { NextRequest } from 'next/server';
import { processTelegramUpdate } from '@/lib/services/telegram.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await processTelegramUpdate(body);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: true });
  }
}
