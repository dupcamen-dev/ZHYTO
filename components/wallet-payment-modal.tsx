"use client"

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useStripe,
  PaymentRequestButtonElement,
  Elements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface WalletPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientSecret: string
  amount: number
  onSuccess: () => void
}

function WalletForm({ amount, clientSecret, onSuccess, onClose }: {
  amount: number
  clientSecret: string
  onSuccess: () => void
  onClose: () => void
}) {
  const stripe = useStripe()
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientSecretRef = useRef(clientSecret)
  clientSecretRef.current = clientSecret

  useEffect(() => {
    if (!stripe || !stripe.paymentRequest) return

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: { label: 'ZHYTO', amount: Math.round(amount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    pr.canMakePayment().then((result: any) => {
      const available = !!(result?.applePay || result?.googlePay)
      setCanMakePayment(available)
      if (!available) {
        setError('Apple Pay / Google Pay is not available on this device.')
      }
    })

    pr.on('paymentmethod', async (event: any) => {
      setLoading(true)
      const cs = clientSecretRef.current
      if (!cs) {
        event.complete('fail')
        setError('Payment not initialized.')
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

    setPaymentRequest(pr)
    return () => { pr.off('paymentmethod') }
  }, [stripe, amount, onSuccess])

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Smartphone className="w-8 h-8 text-primary" />
      </div>

      <div className="glass-card rounded-xl p-4 text-center w-full">
        <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
        <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
      </div>

      {canMakePayment && paymentRequest ? (
        <div className="w-full min-h-[48px] flex justify-center [&>div]:w-full" style={{ minWidth: '200px' }}>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'buy',
                  theme: 'dark',
                  height: '48px',
                },
              },
            }}
          />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 w-full">
          <p className="text-[16px] text-destructive leading-relaxed">{error}</p>
        </div>
      ) : (
        <p className="text-base text-muted-foreground">Loading payment options...</p>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground">Processing payment...</p>
      )}

      <button onClick={onClose} className="text-base tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors cursor-pointer">
        CHANGE METHOD
      </button>
    </div>
  )
}

export function WalletPaymentModal({ open, onOpenChange, clientSecret, amount, onSuccess }: WalletPaymentModalProps) {
  const stripePromise = getStripe()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Pay with Wallet
          </DialogTitle>
        </DialogHeader>

        {stripePromise && clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <WalletForm
              amount={amount}
              clientSecret={clientSecret}
              onSuccess={onSuccess}
              onClose={() => onOpenChange(false)}
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
