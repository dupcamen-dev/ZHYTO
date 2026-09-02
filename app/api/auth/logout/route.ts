import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { handleError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    await authService.signOut();
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
