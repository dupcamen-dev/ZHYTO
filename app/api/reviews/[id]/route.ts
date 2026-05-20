import { NextRequest } from 'next/server';
import { reviewsService } from '@/lib/services/reviews.service';
import { requireAdmin } from '@/lib/middleware/admin.middleware';
import { ModerateReviewSchema } from '@/lib/validations/review.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    
    const validated = ModerateReviewSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const review = await reviewsService.moderateReview(Number(id), validated.data.approved);
    return Response.json(review);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await reviewsService.deleteReview(Number(id));
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
