import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { SignInSchema } from '@/lib/validations/auth.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
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
