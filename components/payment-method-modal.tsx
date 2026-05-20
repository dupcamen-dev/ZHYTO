"use client"

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, Smartphone, Wallet, Loader } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { useLanguage } from '@/components/language-context'

export type PaymentMethodType = 'card' | 'applepay' | 'googlepay' | 'paypal'

interface PaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (method: PaymentMethodType) => void
  total?: number
}

const methodConfig: Record<PaymentMethodType, { icon: typeof CreditCard; label: string; desc: string }> = {
  card:     { icon: CreditCard,  label: 'payByCard',   desc: 'cardDesc' },
  applepay: { icon: Smartphone,  label: 'applePay',   desc: 'applePayDesc' },
  googlepay:{ icon: Smartphone,  label: 'googlePay',  desc: 'googlePayDesc' },
  paypal:   { icon: Wallet,      label: 'payPal',     desc: 'payPalDesc' },
}

export function PaymentMethodModal({ open, onOpenChange, onSelect, total = 0 }: PaymentMethodModalProps) {
  const { t } = useLanguage()
  const [available, setAvailable] = useState<{ applepay: boolean; googlepay: boolean }>({ applepay: false, googlepay: false })
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)
  const checkingDone = useRef(false)

  useEffect(() => {
    if (!open) {
      checkingDone.current = false
      return
    }

    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!pk || !pk.startsWith('pk_')) {
      setLoading(false)
      return
    }

    loadStripe(pk).then(stripe => {
      if (!stripe || !stripe.paymentRequest) {
        setLoading(false)
        return
      }
      const pr = stripe.paymentRequest({
        country: 'GB',
        currency: 'gbp',
        total: { label: 'ZHYTO', amount: Math.round(total * 100) },
        requestPayerName: true,
        requestPayerEmail: true,
      })
      pr.canMakePayment().then((result: any) => {
        setAvailable({
          applepay: !!(result?.applePay),
          googlepay: !!(result?.googlePay),
        })
        setLoading(false)
      })
    }).catch(() => setLoading(false))
  }, [open, total])

  const handleSelect = (method: PaymentMethodType) => {
    if (method === 'applepay' && !available.applepay) return
    if (method === 'googlepay' && !available.googlepay) return
    setSelectedMethod(method)
    setTimeout(() => {
      onSelect(method)
      onOpenChange(false)
    }, 200)
  }

  const showMethod = (method: PaymentMethodType) => {
    if (method === 'applepay') return available.applepay
    if (method === 'googlepay') return available.googlepay
    return true
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-sm max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Payment Method
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3 py-2">
            {(Object.entries(methodConfig) as [PaymentMethodType, typeof methodConfig['card']][]).map(([key, config]) => {
              if (!showMethod(key)) return null
              const Icon = config.icon
              const selected = selectedMethod === key
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={selected}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer disabled:cursor-default ${
                    selected
                      ? 'border-primary bg-primary/10'
                      : 'border-border/30 bg-card/50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-foreground font-medium">{t.checkout[config.label]}</p>
                    <p className="text-base text-muted-foreground tracking-[0.1em]">{t.checkout[config.desc]}</p>
                  </div>
                  {selected && <Loader className="w-4 h-4 text-primary animate-spin" />}
                </button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
