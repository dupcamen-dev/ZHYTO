"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user, loading: authLoading, signInWithGoogle, signInWithApple } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => {
      const product = products.find(p => p.id === Number(id))
      return product ? { ...product, qty } : null
    })
    .filter(Boolean) as (Product & { qty: number })[]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = subtotal >= 50 ? 0 : subtotal >= 25 ? 5 : null
  const total = subtotal + (delivery ?? 0)

  // Advance to payment when user logs in (only if items in cart)
  useEffect(() => {
    if (user && !showPayment && !authLoading && open && !submitting && cartItems.length > 0) {
      handleContinue()
    }
  }, [user, authLoading, open])

  useEffect(() => {
    if (!open) {
      setShowPayment(false)
      setClientSecret(null)
      setDeliveryAddress('')
    }
  }, [open])

  const handleContinue = async () => {
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
      customer_name: user.user_metadata?.full_name || '',
      customer_email: user.email || '',
      delivery_address: deliveryAddress,
    })
  }

  const handleMockPayment = async () => {
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await saveOrder()
    toast.success('Order confirmed! Expect your delivery. Enjoy!')
    clearCart()
    onOpenChange(false)
    setShowPayment(false)
    setClientSecret(null)
    setSubmitting(false)
    router.push('/account')
  }

  const handlePaymentSuccess = () => {
    saveOrder()
    toast.success('Order confirmed! Expect your delivery. Enjoy!')
    clearCart()
    onOpenChange(false)
    setShowPayment(false)
    setClientSecret(null)
    router.push('/account')
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
            {showPayment ? 'Pay securely' : user ? 'Checkout' : 'Sign in'}
          </DialogTitle>
          <DialogDescription className="text-[13px] tracking-[0.2em] text-foreground/60">
            {showPayment
              ? 'Complete your payment — your details are secure'
              : user
                ? `Review your order — ${cartItems.reduce((s, i) => s + i.qty, 0)} items`
                : 'Sign in to place your order'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {!showPayment ? (
            <div className="space-y-5">
              {/* Empty cart — pure login modal */}
              {cartItems.length === 0 && !user && (
                <div className="glass-card rounded-lg p-5 space-y-4">
                  <p className="text-[11px] tracking-[0.2em] text-foreground/60 text-center">
                    SIGN IN TO YOUR ACCOUNT
                  </p>
                  <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
                    Sign in with your Google or Apple account
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

              {/* Items in cart — show full checkout with auth */}
              {cartItems.length > 0 && (
                <>
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
                        <span className="text-foreground/60">{delivery === null ? 'N/A' : delivery === 0 ? 'FREE' : `£${delivery}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-serif">
                        <span className="text-foreground">Total</span>
                        <span className="text-primary">£{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auth step — only when not logged in */}
                  {!user && !authLoading && (
                    <div className="glass-card rounded-lg p-5 space-y-4">
                      <p className="text-[11px] tracking-[0.2em] text-foreground/60 text-center">
                        SIGN IN TO CHECKOUT
                      </p>
                      <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
                        Sign in with your Google or Apple account — no forms needed
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

                  {/* Loading indicator while advancing to payment */}
                  {user && !showPayment && (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Delivery threshold info */}
                  {delivery !== null && delivery > 0 && (
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
                      disabled={submitting || cartItems.length === 0 || !user || subtotal < 25}
                      size="lg"
                      className="flex-1 text-[13px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
                    >
                      {!user ? 'SIGN IN TO CONTINUE' : submitting ? 'PLEASE WAIT...' : subtotal < 25 ? `MINIMUM £25 — ADD £${(25 - subtotal).toFixed(0)} MORE` : 'CONTINUE TO PAY'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Back button */}
              {!hasStripe && (
                <button
                  onClick={handleBackToForm}
                  className="inline-flex items-center gap-2 text-[12px] tracking-[0.15em] text-foreground/60 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  BACK
                </button>
              )}

              {/* User summary */}
              {user && (
                <div className="glass-card rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-foreground/60 mb-2">
                    <Package className="w-3.5 h-3.5" />
                    ACCOUNT
                  </div>
                  <p className="text-[15px] text-foreground">{user.user_metadata?.full_name || 'Guest'}</p>
                  <p className="text-[13px] text-foreground/60">{user.email}</p>
                </div>
              )}

              {/* Delivery address */}
              <div className="space-y-1.5">
                <Label htmlFor="delivery-address" className="text-[12px] text-foreground/60 tracking-[0.1em]">
                  Delivery Address *
                </Label>
                <Textarea
                  id="delivery-address"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  className="bg-transparent border-border/50 text-foreground text-[16px] rounded-none focus:border-primary min-h-[60px]"
                  placeholder="Street, postcode, city"
                />
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
                    addressFilled={!!deliveryAddress.trim()}
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

                  <Button
                    type="button"
                    onClick={handleMockPayment}
                    disabled={submitting || !deliveryAddress.trim()}
                    size="lg"
                    className="w-full text-[13px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
                  >
                    {submitting ? 'PROCESSING...' : `CONFIRM PAYMENT — £${total}`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
