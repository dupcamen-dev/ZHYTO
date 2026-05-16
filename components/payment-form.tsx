"use client"

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CreditCard, Smartphone } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onBack: () => void
  addressFilled: boolean
}

export function PaymentForm({ amount, onSuccess, onBack, addressFilled }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/`,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message ?? 'Payment failed')
      } else {
        toast.success('Payment successful! We will prepare your order.')
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
      {/* Payment method labels */}
      <div className="flex items-center gap-4 text-[11px] tracking-[0.15em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Apple Pay / Google Pay</span>
        </div>
        <span className="text-border/30">|</span>
        <div className="flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Card</span>
        </div>
        <span className="text-border/30">|</span>
        <span>Pay by Bank</span>
      </div>

      {/* Stripe Payment Element */}
      <div className="glass-card rounded-lg p-5">
        <PaymentElement
          onReady={() => setReady(true)}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          <p className="text-[12px] text-destructive leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="flex-1 text-[12px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent"
        >
          BACK
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || !ready || loading || !addressFilled}
          size="lg"
          className="flex-1 text-[12px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
        >
          {loading ? 'PROCESSING...' : `PAY £${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}
