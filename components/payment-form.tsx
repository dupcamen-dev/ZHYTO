"use client"

import { useState, useEffect, useRef } from 'react'
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Smartphone, Banknote, Copy, Check } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  clientSecret: string
  paymentMethod: 'card' | 'wallet' | 'bank'
  onSuccess: () => void
  onBack: () => void
  addressFilled: boolean
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

const elementOptions = {
  style: elementStyle,
}

export function PaymentForm({ amount, clientSecret, paymentMethod, onSuccess, onBack, addressFilled, userName, userEmail }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = useState<any>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const clientSecretRef = useRef(clientSecret)
  clientSecretRef.current = clientSecret

  // Set up Apple Pay / Google Pay via Payment Request
  useEffect(() => {
    if (!stripe || paymentMethod !== 'wallet' || !stripe.paymentRequest) return

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: { label: 'ZHYTO', amount: Math.round(amount * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    })

    pr.canMakePayment().then((result: any) => {
      setCanMakePayment(!!result)
    })

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

    setPaymentRequest(pr)

    return () => {
      pr.off('paymentmethod')
    }
  }, [stripe, paymentMethod, amount, onSuccess])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // Card submit
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

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

  // Bank submit
  const handleBankSubmit = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account`,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message ?? 'Bank transfer failed')
      } else {
        setShowBankDetails(true)
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderCardForm = () => (
    <form onSubmit={handleCardSubmit} className="space-y-4">
      <div className="glass-card rounded-lg p-5 space-y-4">
        <p className="text-[11px] tracking-[0.2em] text-foreground/60">CARD DETAILS</p>

        <div className="space-y-1.5">
          <label className="text-[11px] tracking-[0.1em] text-muted-foreground">Card Number</label>
          <div className="bg-background/80 border border-border/50 rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
            <CardNumberElement options={elementOptions} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[11px] tracking-[0.1em] text-muted-foreground">Expiry Date</label>
            <div className="bg-background/80 border border-border/50 rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
              <CardExpiryElement options={elementOptions} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] tracking-[0.1em] text-muted-foreground">CVV</label>
            <div className="bg-background/80 border border-border/50 rounded-lg px-4 py-3 focus-within:border-primary transition-colors">
              <CardCvcElement options={elementOptions} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          <p className="text-[12px] text-destructive leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={loading} className="flex-1 text-[12px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent">
          CHANGE METHOD
        </Button>
        <Button type="submit" disabled={!stripe || !clientSecret || loading || !addressFilled} size="lg" className="flex-1 text-[12px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50">
          {loading ? 'PROCESSING...' : `PAY £${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )

  const renderWalletForm = () => (
    <div className="space-y-4">
      <div className="glass-card rounded-lg p-5 text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-foreground/60">
          <Smartphone className="w-5 h-5 text-primary" />
          <span className="text-[13px] tracking-[0.15em]">Pay with your wallet</span>
        </div>

        {canMakePayment && paymentRequest ? (
          <>
            <div className="flex justify-center">
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
            <button onClick={onBack} className="text-[11px] tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              CHANGE METHOD
            </button>
          </>
        ) : (
          <div className="text-[13px] text-muted-foreground py-4">
            <p>Apple Pay / Google Pay is not available on this device.</p>
            <button onClick={onBack} className="text-primary hover:underline mt-2 inline-block text-[12px] tracking-[0.15em] cursor-pointer">
              TRY ANOTHER METHOD
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          <p className="text-[12px] text-destructive leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  )

  const renderBankForm = () => {
    if (showBankDetails) {
      return (
        <div className="glass-card rounded-lg p-5 space-y-4">
          <p className="text-[11px] tracking-[0.2em] text-foreground/60">BANK TRANSFER DETAILS</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Please transfer the amount to the account below. Your order will be processed once the payment is received.
          </p>
          <div className="bg-background/80 border border-border/20 rounded-lg p-4 space-y-3">
            {[
              { label: 'Account Name', value: 'ZHYTO LONDON LTD' },
              { label: 'Sort Code', value: '60-83-71' },
              { label: 'Account Number', value: '20517627' },
              { label: 'Reference', value: `ZHYTO-${Date.now().toString(36).toUpperCase()}` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-[11px] tracking-[0.1em] text-muted-foreground shrink-0">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono text-foreground">{item.value}</span>
                  <button
                    onClick={() => copyToClipboard(item.value, item.label)}
                    className="text-primary/60 hover:text-primary transition-colors cursor-pointer"
                    title={`Copy ${item.label}`}
                  >
                    {copied === item.label ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" onClick={onBack} size="lg" className="w-full text-[12px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6">
            BACK TO METHODS
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3 text-foreground/60">
            <Banknote className="w-5 h-5 text-primary" />
            <span className="text-[13px] tracking-[0.15em]">Pay by Bank Transfer</span>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Pay directly from your bank account. After confirming, you will receive the bank details to complete the transfer.
          </p>
          <div className="bg-background/80 border border-border/20 rounded-lg p-4 text-center">
            <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
            <p className="text-[11px] text-foreground/60 tracking-[0.1em]">Total to pay</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
            <p className="text-[12px] text-destructive leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={loading} className="flex-1 text-[12px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent">
            CHANGE METHOD
          </Button>
          <Button type="button" onClick={handleBankSubmit} disabled={!stripe || !clientSecret || loading || !addressFilled} size="lg" className="flex-1 text-[12px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50">
            {loading ? 'PROCESSING...' : 'CONFIRM BANK TRANSFER'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {paymentMethod === 'card' && renderCardForm()}
      {paymentMethod === 'wallet' && renderWalletForm()}
      {paymentMethod === 'bank' && renderBankForm()}
    </div>
  )
}
