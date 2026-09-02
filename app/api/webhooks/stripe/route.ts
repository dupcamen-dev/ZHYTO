import { NextRequest } from 'next/server';
import { paymentsService } from '@/lib/services/payments.service';
import { ordersService } from '@/lib/services/orders.service';
import { productsService } from '@/lib/services/products.service';
import { emailService } from '@/lib/services/email.service';
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

    // Обробка події payment_intent.succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        // Оновлюємо статус замовлення
        const order = await ordersService.updateOrderStatus(orderId, 'confirmed');

        // Зменшуємо stock
        for (const item of order.items) {
          await productsService.updateStock(item.product_id, -item.quantity);
        }

        // Відправляємо email
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
