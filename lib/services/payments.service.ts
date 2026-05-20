import { stripe } from '../utils/stripe';
import Stripe from 'stripe';

export const paymentsService = {
  async createPaymentIntent(amount: number, orderId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe використовує копійки
      currency: 'usd', // Або 'eur' залежно від вашої валюти
      metadata: {
        order_id: orderId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  },

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  },

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET не налаштований');
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },
};
