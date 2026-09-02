import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(key || 'sk_test_placeholder', {
    apiVersion: '2024-12-18.acacia',
  });
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    const client = getStripe();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
