import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { getStripeOrNull } from '@/lib/utils/stripe';

export async function POST(req: NextRequest) {
  if (!getStripeOrNull()) {
    return Response.json(
      { error: 'Payment not configured' },
      { status: 503 }
    );
  }

  try {
    const { amount, paymentMethodType, orderId } = await req.json();

    if (!amount) {
      return Response.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    const payment = await paymentsService.createPaymentIntent(amount, paymentMethodType || 'card', orderId);

    return Response.json({ clientSecret: payment.clientSecret });
  } catch {
    return Response.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
