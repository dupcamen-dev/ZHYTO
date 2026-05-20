"use client"

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { Banknote } from 'lucide-react'
import { toast } from 'sonner'

interface PayPalPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  onSuccess: () => void
}

export function PayPalPaymentModal({ open, onOpenChange, amount, onSuccess }: PayPalPaymentModalProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const [loading, setLoading] = useState(false)

  if (!clientId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">PayPal</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            PayPal is not configured.
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const createOrder = async () => {
    const res = await fetch('/api/create-paypal-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const data = await res.json()
    if (!data.id) throw new Error(data.error || 'Failed to create order')
    return data.id
  }

  const onApprove = async (data: { orderID: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/api/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      })
      const result = await res.json()
      if (result.status === 'COMPLETED') {
        toast.success('Payment successful!')
        onSuccess()
      } else {
        toast.error('Payment failed. Please try again.')
      }
    } catch {
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-md max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">PayPal</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="glass-card rounded-xl p-4 text-center">
            <p className="font-serif text-3xl text-primary mb-1">£{amount.toFixed(2)}</p>
            <p className="text-base text-foreground/60 tracking-[0.1em]">Total to pay</p>
          </div>

          <PayPalScriptProvider options={{ clientId, currency: 'GBP' }}>
            <PayPalButtons
              createOrder={createOrder}
              onApprove={onApprove}
              style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
              disabled={loading}
            />
          </PayPalScriptProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}
