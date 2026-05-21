import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { SignUpSchema } from '@/lib/validations/auth.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';
import { rateLimitMiddleware } from '@/lib/services/rate-limiter';
import { validateCsrf } from '@/lib/middleware/csrf.middleware';

export async function POST(request: NextRequest) {
  try {
    validateCsrf(request);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResponse = rateLimitMiddleware(`signup:${ip}`, 3, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    
    const validated = SignUpSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const result = await authService.signUp(validated.data);

    return Response.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
