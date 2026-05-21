import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { SignInSchema } from '@/lib/validations/auth.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';
import { rateLimitMiddleware } from '@/lib/services/rate-limiter';
import { validateCsrf } from '@/lib/middleware/csrf.middleware';

export async function POST(request: NextRequest) {
  try {
    validateCsrf(request);
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResponse = rateLimitMiddleware(`login:${ip}`, 10, 60_000);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    
    const validated = SignInSchema.safeParse(body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0].message);
    }

    const result = await authService.signIn(validated.data);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
