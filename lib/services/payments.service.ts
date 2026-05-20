import { getStripe } from '../utils/stripe';
import Stripe from 'stripe';

export const paymentsService = {
  async createPaymentIntent(amount: number, paymentMethodType: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const stripe = getStripe();

    let paymentIntent: Stripe.PaymentIntent;

    if (paymentMethodType === 'bank') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method_types: ['customer_balance'],
        payment_method_options: {
          customer_balance: {
            funding_type: 'bank_transfer',
            bank_transfer: {
              type: 'gb_bank_transfer',
            },
          },
        },
      });
    } else if (paymentMethodType === 'paypal') {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method_types: ['paypal'],
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method_types: ['card'],
      });
    }

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  },

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    const stripe = getStripe();
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    const stripe = getStripe();
    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
  },

  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET не налаштований');
    }
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },
};
