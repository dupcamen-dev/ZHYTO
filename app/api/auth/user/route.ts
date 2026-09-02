import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { authService } from '@/lib/services/auth.service';
import { handleError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const profile = await authService.getUserProfile(user.id);

    return Response.json({ user: { ...user, profile } });
  } catch (error) {
    return handleError(error);
  }
}
