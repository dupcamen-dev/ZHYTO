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
    const { amount } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'gbp',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
