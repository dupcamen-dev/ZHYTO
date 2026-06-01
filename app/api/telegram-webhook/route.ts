import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { setTelegramWebhook, getTelegramWebhookInfo } from '@/lib/services/telegram.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const origin = request.nextUrl.origin;
    const url = `${origin}/api/webhooks/telegram`;
    const result = await setTelegramWebhook(url);
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const info = await getTelegramWebhookInfo();
    return Response.json(info);
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
