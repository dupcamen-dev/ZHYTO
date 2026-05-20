import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { SignUpSchema } from '@/lib/validations/auth.schema';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
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
