import { NextRequest } from 'next/server';
import { reviewsService } from '@/lib/services/reviews.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { CreateReviewSchema } from '@/lib/validations/review.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;

    const reviews = await reviewsService.getApprovedReviews(limit);
    return Response.json(reviews);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    
    const validated = CreateReviewSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    // TODO: Отримати ім'я користувача з профілю або auth metadata
    const userName = body.user_name || user.email;

    const review = await reviewsService.createReview(user.id, userName, validated.data);

    return Response.json(review, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
