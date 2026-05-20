"use client"

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { loadStripe } from '@stripe/stripe-js'
import { Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface WalletPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientSecret: string
  amount: number
  onSuccess: () => void
}

export function WalletPaymentModal({ open, onOpenChange, clientSecret, amount, onSuccess }: WalletPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [available, setAvailable] = useState<boolean | null>(null)
  const clientSecretRef = useRef(clientSecret)
  clientSecretRef.current = clientSecret

  useEffect(() => {
    if (!open) {
      setError(null)
      setLoading(false)
      setAvailable(null)
      return
    }

    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) {
      setError('Stripe is not configured')
      setAvailable(false)
      return
    }

    loadStripe(key).then(stripe => {
      if (!stripe || !stripe.paymentRequest) {
        setError('Payment Request API is not available')
        setAvailable(false)
        return
      }

      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: { label: 'ZHYTO', amount: Math.round(amount * 100) },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      pr.canMakePayment().then((result: any) => {
        setAvailable(!!result)
        if (!result) {
          setError('Apple Pay / Google Pay is not available on this device.')
        }
      })
    })
  }, [open, amount])

  const handlePay = async () => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!key) return

    setLoading(true)
    setError(null)

    try {
      const stripe = await loadStripe(key)
      if (!stripe || !stripe.paymentRequest) {
        setError('Payment Request API is not available')
        setLoading(false)
        return
      }

      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: { label: 'ZHYTO', amount: Math.round(amount * 100) },
        requestPayerName: true,
        requestPayerEmail: true,
      })

      const canPay = await pr.canMakePayment()
      if (!canPay) {
        setError('Apple Pay / Google Pay is not available on this device.')
        setLoading(false)
        return
      }

      pr.on('paymentmethod', async (event: any) => {
        setLoading(true)
        const cs = clientSecretRef.current
        if (!cs) {
          event.complete('fail')
          setError('Payment not initialized. Please try again.')
          setLoading(false)
          return
        }
        const { error: confirmError } = await stripe.confirmCardPayment(cs, {
          payment_method: event.paymentMethod.id,
        })
        if (confirmError) {
          event.complete('fail')
          setError(confirmError.message ?? 'Payment failed')
          setLoading(false)
        } else {
          event.complete('success')
          toast.success('Payment successful!')
          onSuccess()
        }
      })

      await pr.show()
    } catch {
      setError('Apple Pay / Google Pay failed. Please try another method.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Pay with Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-primary" />
          </div>

          <div className="glass-card rounded-xl p-4 text-center w-full">
            <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
            <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
          </div>

          {available === null && !loading && (
            <p className="text-base text-muted-foreground">Checking availability...</p>
          )}

          {available === true && (
            <Button
              type="button"
              onClick={handlePay}
              disabled={loading}
              size="lg"
              className="w-full text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'APPLE PAY / GOOGLE PAY'}
            </Button>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 w-full">
              <p className="text-[16px] text-destructive leading-relaxed">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
