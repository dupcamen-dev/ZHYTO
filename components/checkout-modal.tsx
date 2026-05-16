"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Elements } from '@stripe/react-stripe-js'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/components/auth-context'
import { supabase } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'
import { PaymentForm } from '@/components/payment-form'
import { toast } from 'sonner'
import { ArrowLeft, Package, Truck, CreditCard, Smartphone, Banknote, Chrome } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
}

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
}

const hasStripe = typeof process !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')

export function CheckoutModal({ open, onOpenChange, products }: CheckoutModalProps) {
  const { cart, clearCart } = useCart()
  const { user, loading: authLoading, signInWithGoogle, signInWithApple } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find(p => p.id === Number(id))
      return product ? { ...product, qty } : null
    })
    .filter(Boolean) as (Product & { qty: number })[]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal >= 50 ? 0 : subtotal >= 25 ? 5 : 0
  const total = subtotal + delivery

  // Auto-fill from auth on mount & when user changes
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name: user.user_metadata?.full_name || f.name,
        email: user.email || f.email,
      }))
    }
  }, [user])

  useEffect(() => {
    if (!open) {
      setShowPayment(false)
      setClientSecret(null)
    }
  }, [open])

  // Advance to payment once authenticated
  useEffect(() => {
    if (user && showPayment === false && !authLoading && open) {
      // User just logged in — keep them on the order step so they can fill address
    }
  }, [user, authLoading, showPayment, open])

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.address.trim()) errs.address = 'Delivery address is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = async () => {
    if (!validate()) return

    if (hasStripe) {
      setSubmitting(true)
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total }),
        })
        const data = await res.json()
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setShowPayment(true)
        } else {
          toast.error('Payment service unavailable. Please try again.')
        }
      } catch {
        toast.error('Payment service unavailable. Please try again.')
      } finally {
        setSubmitting(false)
      }
    } else {
      // Mock mode — show payment step without Stripe
      setShowPayment(true)
    }
  }

  const saveOrder = async () => {
    if (!supabase || !user) return
    await supabase.from('orders').insert({
      user_id: user.id,
      items: cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      total,
      delivery_fee: delivery,
      status: 'pending',
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      delivery_address: form.address,
      notes: form.notes,
    })
  }

  const handleMockPayment = async () => {
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await saveOrder()
    toast.success('Order confirmed! Expect your delivery. Enjoy!')
    clearCart()
    onOpenChange(false)
    setForm({ name: '', email: '', phone: '', address: '', notes: '' })
    setErrors({})
    setShowPayment(false)
    setClientSecret(null)
    setSubmitting(false)
  }

  const handlePaymentSuccess = () => {
    saveOrder()
    toast.success('Order confirmed! Expect your delivery. Enjoy!')
    clearCart()
    onOpenChange(false)
    setForm({ name: '', email: '', phone: '', address: '', notes: '' })
    setErrors({})
    setShowPayment(false)
    setClientSecret(null)
  }

  const handleBackToForm = () => {
    setShowPayment(false)
    setClientSecret(null)
  }

  const stripePromise = hasStripe ? getStripe() : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-lg max-h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            {showPayment ? 'Pay securely' : 'Checkout'}
          </DialogTitle>
          <DialogDescription className="text-[13px] tracking-[0.2em] text-foreground/60">
            {showPayment
              ? 'Complete your payment — your details are secure'
              : `Review your order — ${cartItems.reduce((s, i) => s + i.qty, 0)} items`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {!showPayment ? (
            <div className="space-y-5">
              {/* Order summary */}
              <div className="glass-card rounded-lg p-4 space-y-2">
                <p className="text-[11px] tracking-[0.2em] text-foreground/60 mb-3">ORDER SUMMARY</p>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-[14px]">
                    <span className="text-foreground">{item.name} × {item.qty}</span>
                    <span className="text-primary">£{item.price * item.qty}</span>
                  </div>
                ))}
                <div className="border-t border-border/20 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-foreground/60">Delivery</span>
                    <span className="text-foreground/60">{delivery === 0 ? 'FREE' : `£${delivery}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-serif">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">£{total}</span>
                  </div>
                </div>
              </div>

              {/* Auth step — show when not logged in */}
              {!user && !authLoading && (
                <div className="glass-card rounded-lg p-5 space-y-4">
                  <p className="text-[11px] tracking-[0.2em] text-foreground/60 text-center">
                    SIGN IN TO CHECKOUT
                  </p>
                  <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
                    No manual forms — just sign in with your Google or Apple account
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 border border-border/50 rounded-lg px-4 py-3 text-[14px] text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <Chrome className="w-5 h-5" />
                    Continue with Google
                  </button>
                  <button
                    onClick={signInWithApple}
                    className="w-full flex items-center justify-center gap-3 border border-border/50 rounded-lg px-4 py-3 text-[14px] text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </button>
                </div>
              )}

              {/* Contact/delivery info — shown after auth */}
              <div className="space-y-3">
                <p className="text-[11px] tracking-[0.2em] text-foreground/60">
                  {user ? 'DELIVERY DETAILS' : 'CONTACT DETAILS'}
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(e => ({ ...e, name: '' })) }}
                    className={`bg-transparent text-foreground text-[14px] rounded-none focus:border-primary ${errors.name ? 'border-destructive' : 'border-border/50'}`}
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-[12px] text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(e => ({ ...e, email: '' })) }}
                      className={`bg-transparent text-foreground text-[14px] rounded-none focus:border-primary ${errors.email ? 'border-destructive' : 'border-border/50'}`}
                      placeholder="your@email.com"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p className="text-[12px] text-destructive mt-1">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="bg-transparent border-border/50 text-foreground text-[14px] rounded-none focus:border-primary"
                      placeholder="+44..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                    Delivery Address *
                  </Label>
                  <Textarea
                    id="address"
                    value={form.address}
                    onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(e => ({ ...e, address: '' })) }}
                    className={`bg-transparent text-foreground text-[14px] rounded-none focus:border-primary min-h-[60px] ${errors.address ? 'border-destructive' : 'border-border/50'}`}
                    placeholder="Street, postcode, city"
                    aria-invalid={!!errors.address}
                  />
                  {errors.address && <p className="text-[12px] text-destructive mt-1">{errors.address}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                    Order Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className="bg-transparent border-border/50 text-foreground text-[14px] rounded-none focus:border-primary min-h-[60px]"
                    placeholder="Any special requests..."
                  />
                </div>
              </div>

              {/* Delivery threshold info */}
              {delivery > 0 && (
                <div className="flex items-center gap-3 text-[13px] text-foreground/60 bg-border/10 rounded-lg px-4 py-3">
                  <Truck className="w-4 h-4 shrink-0 text-primary" />
                  <span>
                    {delivery === 5
                      ? `£5 delivery — add £${(50 - subtotal).toFixed(0)} more for free`
                      : `Minimum £25 — add £${(25 - subtotal).toFixed(0)} more`}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="flex-1 text-[13px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent"
                >
                  CANCEL
                </Button>
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={submitting || cartItems.length === 0 || !user}
                  size="lg"
                  className="flex-1 text-[13px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
                >
                  {!user ? 'SIGN IN TO CONTINUE' : submitting ? 'PLEASE WAIT...' : 'CONTINUE TO PAY'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Back button */}
              <button
                onClick={handleBackToForm}
                className="inline-flex items-center gap-2 text-[12px] tracking-[0.15em] text-foreground/60 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                BACK TO DETAILS
              </button>

              {/* Delivery summary */}
              <div className="glass-card rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-foreground/60 mb-2">
                  <Package className="w-3.5 h-3.5" />
                  DELIVERY TO
                </div>
                <p className="text-[15px] text-foreground">{form.name}</p>
                <p className="text-[13px] text-foreground/60">{form.address}</p>
                {(form.email || form.phone) && (
                  <p className="text-[12px] text-foreground/50">{form.email}{form.phone ? ` — ${form.phone}` : ''}</p>
                )}
              </div>

              {/* Compact order total */}
              <div className="flex items-center justify-between glass-card rounded-lg px-4 py-3">
                <span className="text-[13px] text-foreground/60">
                  {cartItems.reduce((s, i) => s + i.qty, 0)} items
                </span>
                <span className="font-serif text-lg text-primary">£{total}</span>
              </div>

              {/* Stripe payment */}
              {hasStripe && clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#c8a24e',
                        colorBackground: 'oklch(0.12 0.01 50)',
                        colorText: 'oklch(0.95 0.01 85)',
                        colorDanger: '#ef4444',
                        fontFamily: 'Georgia, serif',
                        borderRadius: '8px',
                      },
                      rules: {
                        '.Input': {
                          border: '1px solid oklch(0.25 0.01 50)',
                          backgroundColor: 'oklch(0.1 0.01 50)',
                        },
                        '.Input:focus': {
                          borderColor: '#c8a24e',
                        },
                        '.Label': {
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          color: 'oklch(0.6 0.02 85)',
                        },
                        '.Tab': {
                          backgroundColor: 'oklch(0.14 0.01 50)',
                          border: '1px solid oklch(0.25 0.01 50)',
                        },
                        '.Tab--selected': {
                          backgroundColor: 'oklch(0.18 0.01 50)',
                          borderColor: '#c8a24e',
                        },
                      },
                    },
                  }}
                >
                  <PaymentForm
                    amount={total}
                    onSuccess={handlePaymentSuccess}
                    onBack={handleBackToForm}
                  />
                </Elements>
              ) : (
                /* Mock payment — when Stripe is not configured */
                <div className="space-y-4">
                  <div className="glass-card rounded-lg p-5">
                    <p className="text-[11px] tracking-[0.2em] text-foreground/60 mb-4">PAYMENT METHOD</p>

                    <div className="flex items-center gap-4 text-[12px] tracking-[0.15em] text-foreground/60 mb-5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Card</span>
                      </div>
                      <span className="text-border/30">|</span>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Apple Pay / Google Pay</span>
                      </div>
                      <span className="text-border/30">|</span>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Pay by Bank</span>
                      </div>
                    </div>

                    <div className="bg-border/10 border border-border/20 rounded-lg p-4 text-center">
                      <p className="font-serif text-3xl text-primary mb-1">£{total}</p>
                      <p className="text-[12px] text-foreground/60 tracking-[0.1em]">Total to pay</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleBackToForm}
                      disabled={submitting}
                      className="flex-1 text-[13px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent"
                    >
                      BACK
                    </Button>
                    <Button
                      type="button"
                      onClick={handleMockPayment}
                      disabled={submitting}
                      size="lg"
                      className="flex-1 text-[13px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
                    >
                      {submitting ? 'PROCESSING...' : `CONFIRM PAYMENT — £${total}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
