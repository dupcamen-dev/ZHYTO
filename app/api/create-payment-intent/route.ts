import { getStripeServer } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const stripe = getStripeServer()

  if (!stripe) {
    return NextResponse.json(
      { error: 'Payment not configured' },
      { status: 503 }
    )
  }

  try {
    const { amount, paymentMethodType } = await req.json()

    let paymentIntent

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
      })
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        payment_method_types: ['card'],
      })
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
