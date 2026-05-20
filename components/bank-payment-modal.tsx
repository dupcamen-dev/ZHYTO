"use client"

import { useState, useRef } from 'react'
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
import { Banknote, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface BankPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onSuccess: () => void
  onBeforePay?: () => Promise<string | undefined>
}

function BankForm({ amount, onSuccess, onClose, onBeforePay }: {
  amount: number
  onSuccess: () => void
  onClose: () => void
  onBeforePay?: () => Promise<string | undefined>
}) {
  const stripe = useStripe()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const bankDetails = [
    { label: 'Account Name', value: 'ZHYTO LONDON LTD' },
    { label: 'Sort Code', value: '60-83-71' },
    { label: 'Account Number', value: '20517627' },
    { label: 'Reference', value: `ZHYTO-${Date.now().toString(36).toUpperCase()}` },
  ]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleBankTransfer = async () => {
    if (!stripe) return
    setLoading(true)
    setError(null)

    try {
      const orderId = onBeforePay ? await onBeforePay() : undefined

      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMethodType: 'bank', orderId }),
      })
      const data = await res.json()
      if (!data.clientSecret) {
        setError('Failed to create payment. Please try again.')
        setLoading(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCustomerBalancePayment(data.clientSecret)

      if (confirmError) {
        setError(confirmError.message ?? 'Bank transfer failed')
      } else if (paymentIntent?.status === 'requires_action' && paymentIntent?.next_action?.display_bank_transfer_instructions) {
        setShowDetails(true)
        toast.success('Bank transfer initiated. Order will be processed after payment is received.')
        onSuccess()
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Bank transfer succeeded. Order confirmed!')
        onSuccess()
      } else {
        setShowDetails(true)
        toast.success('Bank transfer initiated. Follow the instructions below.')
        onSuccess()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (showDetails) {
    return (
      <div className="space-y-5">
        <div className="glass-card rounded-xl p-5 space-y-4">
          <p className="text-base tracking-[0.2em] text-foreground/60">BANK TRANSFER DETAILS</p>
          <p className="text-[16px] text-muted-foreground leading-relaxed">
            Please transfer the amount to the account below. Your order will be processed once the payment is received.
          </p>
          <div className="bg-background/80 border border-border/20 rounded-xl p-4 space-y-3">
            {bankDetails.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-sm tracking-[0.1em] text-muted-foreground shrink-0">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-mono text-foreground">{item.value}</span>
                  <button
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="text-primary/60 hover:text-primary transition-colors cursor-pointer"
                  >
                    {copied === item.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Button type="button" onClick={onClose} size="lg" className="w-full text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6">
          CLOSE
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 text-foreground/60">
          <Banknote className="w-5 h-5 text-primary" />
          <span className="text-lg tracking-[0.15em]">Pay by Bank Transfer</span>
        </div>
        <p className="text-[16px] text-muted-foreground leading-relaxed">
          Pay directly from your bank account. After confirming, you will receive the bank details to complete the transfer.
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
        onClick={handleBankTransfer}
        disabled={!stripe || loading}
        size="lg"
        className="w-full text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
      >
        {loading ? 'PROCESSING...' : `CONFIRM BANK TRANSFER — £${amount.toFixed(2)}`}
      </Button>
    </div>
  )
}

export function BankPaymentModal({ open, onOpenChange, amount, onSuccess, onBeforePay }: BankPaymentModalProps) {
  const stripePromise = getStripe()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Bank Transfer
          </DialogTitle>
        </DialogHeader>

        {stripePromise ? (
          <Elements stripe={stripePromise} options={{
            mode: 'payment',
            amount: Math.round(amount * 100),
            currency: 'gbp',
          }}>
            <BankForm
              amount={amount}
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
