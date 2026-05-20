import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json({ error: 'PayPal not configured' }, { status: 503 });
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'GBP',
          value: amount.toFixed(2),
        },
      }],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json({ error: data.message || 'Failed to create PayPal order' }, { status: 500 });
  }

  return Response.json({ id: data.id });
}
