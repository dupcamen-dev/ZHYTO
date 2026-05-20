"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Banknote, Copy, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface BankPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onSuccess: () => void
}

export function BankPaymentModal({ open, onOpenChange, amount, onSuccess }: BankPaymentModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const reference = `ZHYTO-${Date.now().toString(36).toUpperCase()}`

  const bankDetails = [
    { label: 'Account Name', value: 'ZHYTO LONDON LTD' },
    { label: 'Sort Code', value: '60-83-71' },
    { label: 'Account Number', value: '20517627' },
    { label: 'Reference', value: reference },
  ]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirm = () => {
    setConfirmed(true)
    toast.success('Bank transfer instructions saved. Order will be processed after payment is received.')
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            Bank Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-foreground/60">
              <Banknote className="w-5 h-5 text-primary" />
              <span className="text-lg tracking-[0.15em]">Pay by Bank Transfer</span>
            </div>
            <p className="text-[16px] text-muted-foreground leading-relaxed">
              Pay directly from your bank account. Your order will be processed once the payment is received.
            </p>

            <div className="bg-background/80 border border-border/20 rounded-xl p-4 text-center">
              <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
              <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
            </div>

            <div className="bg-background/80 border border-border/20 rounded-xl p-4 space-y-3">
              {bankDetails.map(item => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm tracking-[0.1em] text-muted-foreground shrink-0">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-mono text-foreground">{item.value}</span>
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
          </div>

          <Button
            type="button"
            onClick={handleConfirm}
            size="lg"
            className="w-full text-[16px] tracking-[0.2em] rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6"
          >
            I WILL TRANSFER — CONFIRM ORDER
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
