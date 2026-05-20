"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditCard, Smartphone, Wallet } from 'lucide-react'
import { useLanguage } from '@/components/language-context'

export type PaymentMethodType = 'card' | 'applepay' | 'googlepay' | 'paypal'

interface PaymentMethodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (method: PaymentMethodType) => void
}

const methodConfig: Record<PaymentMethodType, { icon: typeof CreditCard; label: string; desc: string }> = {
  card:     { icon: CreditCard,  label: 'payByCard',   desc: 'cardDesc' },
  applepay: { icon: Smartphone,  label: 'applePay',   desc: 'applePayDesc' },
  googlepay:{ icon: Smartphone,  label: 'googlePay',  desc: 'googlePayDesc' },
  paypal:   { icon: Wallet,      label: 'payPal',     desc: 'payPalDesc' },
}

export function PaymentMethodModal({ open, onOpenChange, onSelect }: PaymentMethodModalProps) {
  const { t } = useLanguage()

  const handleSelect = (method: PaymentMethodType) => {
    onSelect(method)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-sm max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {(Object.entries(methodConfig) as [PaymentMethodType, typeof methodConfig['card']][]).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-foreground font-medium">{t.checkout[config.label]}</p>
                  <p className="text-base text-muted-foreground tracking-[0.1em]">{t.checkout[config.desc]}</p>
                </div>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
