import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { getStripeOrNull } from '@/lib/utils/stripe';
import { requireAuth } from '@/lib/middleware/auth.middleware';
import { supabase } from '@/lib/utils/supabase';
import { handleError, ValidationError } from '@/lib/utils/errors';

export async function POST(req: NextRequest) {
  if (!getStripeOrNull()) {
    return Response.json(
      { error: 'Payment not configured' },
      { status: 503 }
    );
  }

  try {
    const user = await requireAuth(req);
    const { amount, paymentMethodType, orderId } = await req.json();

    if (!amount) {
      return Response.json(
        { error: 'amount is required' },
        { status: 400 }
      );
    }

    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        throw new ValidationError('Order not found');
      }
      if (order.user_id !== user.id) {
        throw new ValidationError('Order does not belong to this user');
      }
    }

    const payment = await paymentsService.createPaymentIntent(amount, paymentMethodType || 'card', orderId);

    return Response.json({ clientSecret: payment.clientSecret });
  } catch (error) {
    return handleError(error);
  }
}
