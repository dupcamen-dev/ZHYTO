"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { toast } from 'sonner'

interface CardPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientSecret: string
  amount: number
  onSuccess: () => void
  userName?: string
  userEmail?: string
}

const elementStyle = {
  base: {
    fontSize: '16px',
    color: '#f5f0e8',
    fontFamily: 'Georgia, serif',
    '::placeholder': {
      color: '#6b6358',
    },
  },
  invalid: {
    color: '#ef4444',
  },
}

const elementOptions = { style: elementStyle }

function CardForm({ clientSecret, amount, onSuccess, userName, userEmail, onBack }: {
  clientSecret: string
  amount: number
  onSuccess: () => void
  userName?: string
  userEmail?: string
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardNumberElement)
      if (!cardElement) {
        setError('Card element not found')
        setLoading(false)
        return
      }

      const { error: submitError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: userName || '',
            email: userEmail || '',
          },
        },
      })

      if (submitError) {
        setError(submitError.message ?? 'Payment failed')
      } else {
        toast.success('Payment successful!')
        onSuccess()
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label className="text-base tracking-[0.1em] text-foreground/60">Card Number</label>
        <div className="bg-background/80 border border-border/50 rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
          <CardNumberElement options={elementOptions} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-base tracking-[0.1em] text-foreground/60">Expiry Date</label>
          <div className="bg-background/80 border border-border/50 rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
            <CardExpiryElement options={elementOptions} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-base tracking-[0.1em] text-foreground/60">CVV</label>
          <div className="bg-background/80 border border-border/50 rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
            <CardCvcElement options={elementOptions} />
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 text-center">
        <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
        <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
          <p className="text-[16px] text-destructive leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={loading} className="flex-1 text-[16px] tracking-[0.2em] rounded-xl border-border/50 hover:bg-transparent">
          BACK
        </Button>
        <Button type="submit" disabled={!stripe || loading} size="lg" className="flex-1 text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50">
          {loading ? 'PROCESSING...' : `PAY £${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}

export function CardPaymentModal({ open, onOpenChange, clientSecret, amount, onSuccess, userName, userEmail }: CardPaymentModalProps) {
  const stripePromise = getStripe()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Pay with Card
          </DialogTitle>
        </DialogHeader>

        {stripePromise && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CardForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={onSuccess}
              userName={userName}
              userEmail={userEmail}
              onBack={() => onOpenChange(false)}
            />
          </Elements>
        ) : (
          <div className="text-center py-8 text-foreground/60">
            Loading payment...
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
