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
  Elements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface PayPalPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientSecret: string
  amount: number
  onSuccess: () => void
  onBeforePay?: () => Promise<void>
}

function PayPalForm({ amount, clientSecret, onSuccess, onClose, onBeforePay }: {
  amount: number
  clientSecret: string
  onSuccess: () => void
  onClose: () => void
  onBeforePay?: () => Promise<void>
}) {
  const stripe = useStripe()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayPal = async () => {
    if (!stripe || !clientSecret) return
    setLoading(true)
    setError(null)

    try {
      if (onBeforePay) await onBeforePay()

      const { error: confirmError } = await stripe.confirmPayPalPayment(clientSecret, {
        return_url: `${window.location.origin}/account`,
      })

      if (confirmError) {
        setError(confirmError.message ?? 'PayPal payment failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 text-foreground/60">
          <Wallet className="w-5 h-5 text-primary" />
          <span className="text-lg tracking-[0.15em]">PayPal</span>
        </div>
        <p className="text-[16px] text-muted-foreground leading-relaxed">
          You will be redirected to PayPal to complete your payment.
        </p>
        <div className="bg-background/80 border border-border/20 rounded-xl p-4 text-center">
          <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
          <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
          <p className="text-[16px] text-destructive leading-relaxed">{error}</p>
        </div>
      )}

      <Button
        type="button"
        onClick={handlePayPal}
        disabled={!stripe || loading}
        size="lg"
        className="w-full text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
      >
        {loading ? 'REDIRECTING...' : `PAY WITH PAYPAL — £${amount.toFixed(2)}`}
      </Button>
    </div>
  )
}

export function PayPalPaymentModal({ open, onOpenChange, clientSecret, amount, onSuccess }: PayPalPaymentModalProps) {
  const stripePromise = getStripe()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            PayPal
          </DialogTitle>
        </DialogHeader>

        {stripePromise && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PayPalForm
              amount={amount}
              clientSecret={clientSecret}
              onSuccess={onSuccess}
              onClose={() => onOpenChange(false)}
              onBeforePay={onBeforePay}
            />
          </Elements>
        ) : (
          <div className="text-center py-8 text-foreground/60">Loading payment...</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
