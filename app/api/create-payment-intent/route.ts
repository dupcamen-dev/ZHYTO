import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    
    const body = await request.json();
    const { amount, orderId } = body;

    if (!amount || !orderId) {
      throw new ValidationError('amount та orderId обов\'язкові');
    }

    const payment = await paymentsService.createPaymentIntent(amount, orderId);

    return Response.json({
      clientSecret: payment.clientSecret,
      paymentIntentId: payment.paymentIntentId,
    });
  } catch (error) {
    return handleError(error);
  }
}
