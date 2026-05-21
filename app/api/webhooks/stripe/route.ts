import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { ordersService } from '@/lib/services/orders.service';
import { emailService } from '@/lib/services/email.service';
import { getSupabaseAdmin } from '@/lib/utils/supabase';
import { handleError } from '@/lib/utils/errors';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 });
    }

    const event = paymentsService.verifyWebhookSignature(body, signature);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        const order = await ordersService.updateOrderStatus(orderId, 'confirmed');

        const adminClient = getSupabaseAdmin();
        await adminClient.from('order_payments').insert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount_received / 100,
          status: 'succeeded',
        }).maybeSingle();

        await emailService.sendOrderConfirmation(order);
        await emailService.sendAdminNotification(order);

        console.log('✅ Замовлення підтверджено:', orderId);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return handleError(error);
  }
}
