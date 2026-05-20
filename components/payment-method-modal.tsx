"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, Smartphone, Wallet, Loader, Info } from 'lucide-react'
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
  const [walletSupport, setWalletSupport] = useState<{ applepay: boolean | null; googlepay: boolean | null; raw: any }>({ applepay: null, googlepay: null, raw: null })
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!open) {
      setWalletSupport({ applepay: null, googlepay: null, raw: null })
      setChecking(true)
      return
    }

    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!pk || !pk.startsWith('pk_')) {
      setWalletSupport({ applepay: false, googlepay: false, raw: 'Stripe key not configured' })
      setChecking(false)
      return
    }

    loadStripe(pk).then(stripe => {
      if (!stripe || !stripe.paymentRequest) {
        setWalletSupport({ applepay: false, googlepay: false, raw: 'paymentRequest unavailable' })
        setChecking(false)
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
        setWalletSupport({
          applepay: !!(result?.applePay),
          googlepay: !!(result?.googlePay),
          raw: result,
        })
        setChecking(false)
      })
    }).catch(err => {
      setWalletSupport({ applepay: false, googlepay: false, raw: `loadStripe error: ${err?.message || err}` })
      setChecking(false)
    })
  }, [open, total])

  const handleSelect = (method: PaymentMethodType) => {
    onSelect(method)
    onOpenChange(false)
  }

  const isUnavailable = (method: PaymentMethodType) => {
    if (method === 'applepay' && walletSupport.applepay === false) return true
    if (method === 'googlepay' && walletSupport.googlepay === false) return true
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-sm max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Payment Method
          </DialogTitle>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3 py-2">
            {(Object.entries(methodConfig) as [PaymentMethodType, typeof methodConfig['card']][]).map(([key, config]) => {
              const Icon = config.icon
              const unavailable = isUnavailable(key)
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  disabled={unavailable}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                    unavailable
                      ? 'border-border/10 bg-card/30 opacity-40 cursor-not-allowed'
                      : 'border-border/30 bg-card/50 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-foreground font-medium">{t.checkout[config.label]}</p>
                    <p className={`text-base tracking-[0.1em] ${unavailable ? 'text-destructive/60' : 'text-muted-foreground'}`}>
                      {unavailable ? 'Not available on this device' : t.checkout[config.desc]}
                    </p>
                  </div>
                  {unavailable && <Info className="w-4 h-4 text-destructive/60 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}

        {walletSupport.raw !== null && !walletSupport.applepay && !walletSupport.googlepay && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs font-mono text-muted-foreground break-all">
              canMakePayment: {JSON.stringify(walletSupport.raw)}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
