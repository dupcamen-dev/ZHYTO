import { NextRequest } from 'next/server';
import { reviewsService } from '@/lib/services/reviews.service';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { handleError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reviews = await reviewsService.getAllReviews();
    const filtered = status === 'approved'
      ? reviews.filter(r => r.approved)
      : status === 'pending'
        ? reviews.filter(r => !r.approved)
        : reviews;
    return Response.json({ reviews: filtered });
  } catch (error) {
    return handleError(error);
  }
}
