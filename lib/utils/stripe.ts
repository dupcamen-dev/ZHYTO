import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY не налаштований');
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
  return _stripe;
}

export function getStripeOrNull(): Stripe | null {
  try {
    return getStripe();
  } catch {
    return null;
  }
}
