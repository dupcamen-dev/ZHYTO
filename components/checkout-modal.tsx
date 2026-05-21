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
import { CardPaymentModal } from '@/components/card-payment-modal'
import { WalletPaymentModal } from '@/components/wallet-payment-modal'
import { PayPalPaymentModal } from '@/components/paypal-payment-modal'
import { PaymentMethodModal, PaymentMethodType } from '@/components/payment-method-modal'
import { toast } from 'sonner'
import { ArrowLeft, Package, Truck, CreditCard, Smartphone, Chrome, Loader, Percent, Wallet } from 'lucide-react'
import { useDeliverySettings, calcDelivery } from '@/lib/use-delivery'
import { useLanguage } from '@/components/language-context'

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

const methodIcons: Record<PaymentMethodType, typeof CreditCard> = {
  card:     CreditCard,
  applepay: Smartphone,
  googlepay:Smartphone,
  paypal:   Wallet,
}

export function CheckoutModal({ open, onOpenChange, products }: CheckoutModalProps) {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user, loading: authLoading, signInWithGoogle } = useAuth()
  const { settings } = useDeliverySettings()
  const { t } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [paypalModalOpen, setPaypalModalOpen] = useState(false)
  const [methodModalOpen, setMethodModalOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [promoError, setPromoError] = useState('')
  const [promoCodes, setPromoCodes] = useState<Record<string, { type: 'percentage' | 'free_delivery'; value: number }>>({})

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'promo_codes').single().then(({ data }) => {
      if (data?.value) {
        const codes = data.value as { code: string; type: 'percentage' | 'free_delivery'; value: number }[]
        const map: Record<string, { type: 'percentage' | 'free_delivery'; value: number }> = {}
        codes.forEach(c => { map[c.code.toUpperCase()] = { type: c.type, value: c.value } })
        setPromoCodes(map)
      }
    })
  }, [])

  const cartItems = Object.entries(cart)
    .map(([id, item]) => {
      const product = products.find(p => p.id === Number(id))
      return product ? { ...product, image: item.image || product.image, qty: item.qty } : null
    })
    .filter(Boolean) as (Product & { qty: number })[]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = calcDelivery(subtotal, settings)
  const appliedPromo = promoCode ? promoCodes[promoCode.toUpperCase()] : null
  const promoDiscount = appliedPromo?.type === 'percentage' ? subtotal * (appliedPromo.value / 100) : 0
  const promoDelivery = appliedPromo?.type === 'free_delivery' && delivery ? delivery : 0
  const total = subtotal - promoDiscount + (delivery ?? 0) - promoDelivery

  const applyPromoCode = () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    const match = promoCodes[code]
    if (!match) {
      setPromoError(t.checkout.invalidPromo)
      return
    }
    setPromoCode(code)
    setPromoError('')
    setPromoInput('')
    toast.success(match.type === 'free_delivery' ? t.checkout.promoFreeDelivery : t.checkout.promoApplied.replace('{value}', `${match.value}%`))
  }

  const removePromoCode = () => {
    setPromoCode(null)
    setPromoError('')
  }

  useEffect(() => {
    if (user && !showPayment && !authLoading && open && cartItems.length > 0) {
      setShowPayment(true)
    }
  }, [user, authLoading, open])

  useEffect(() => {
    if (!open) {
      setShowPayment(false)
      setSelectedMethod(null)
      setClientSecret(null)
      setDeliveryAddress('')
    }
  }, [open])

  const handleMethodSelect = async (method: PaymentMethodType) => {
    setSelectedMethod(method)

    if (method === 'paypal') {
      setPaypalModalOpen(true)
      return
    }

    if (method === 'applepay' || method === 'googlepay') {
      if (!hasStripe) return
      setSubmitting(true)
      try {
        const data = await createOrderViaApi(false)
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setWalletModalOpen(true)
        } else {
          toast.error(t.checkout.paymentUnavailable)
          setSelectedMethod(null)
        }
      } catch (e: any) {
        console.error('Apple Pay error:', e?.message || e)
        toast.error(e?.message || 'Payment service unavailable. Please try again.')
        setSelectedMethod(null)
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!hasStripe) return

    setSubmitting(true)
    try {
      const data = await createOrderViaApi(false)
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setCardModalOpen(true)
      } else {
        toast.error(t.checkout.paymentUnavailable)
        setSelectedMethod(null)
      }
    } catch (e: any) {
      console.error('Card payment error:', e?.message || e)
      toast.error(e?.message || 'Payment service unavailable. Please try again.')
      setSelectedMethod(null)
    } finally {
      setSubmitting(false)
    }
  }

  const createOrderViaApi = async (skipPayment = false) => {
    if (!user) throw new Error('User not authenticated')
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token || ''
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: cartItems.map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.qty })),
        customer_name: user.user_metadata?.full_name || '',
        customer_email: user.email || '',
        delivery_address: deliveryAddress,
        skip_payment: skipPayment,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error || 'Order creation failed')
    }
    return res.json()
  }

  const handleMockPayment = async () => {
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      await createOrderViaApi(true)
    } catch (e: any) {
      toast.error('Order was not saved. Please contact support.')
      setSubmitting(false)
      return
    }
    toast.success(t.checkout.orderConfirmed)
    clearCart()
    onOpenChange(false)
    setShowPayment(false)
    setSelectedMethod(null)
    setClientSecret(null)
    setSubmitting(false)
    router.push('/account')
  }

  const handlePaymentSuccess = async () => {
    toast.success(t.checkout.orderConfirmed)
    clearCart()
    onOpenChange(false)
    setShowPayment(false)
    setSelectedMethod(null)
    setClientSecret(null)
    router.push('/account')
  }

  const handlePostRedirectSuccess = () => {
    toast.success(t.checkout.orderConfirmed)
    clearCart()
    onOpenChange(false)
    setShowPayment(false)
    setSelectedMethod(null)
    setClientSecret(null)
    router.push('/account')
  }

  const handleBackToMethods = () => {
    setSelectedMethod(null)
    setClientSecret(null)
  }

  const stripePromise = hasStripe ? getStripe() : null

  const renderPaymentStep = () => (
    <div className="space-y-5">
      {/* User summary */}
      {user && (
        <div className="glass-card rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-base tracking-[0.2em] text-foreground/60 mb-2">
            <Package className="w-3.5 h-3.5" />
            {t.checkout.account}
          </div>
          <p className="text-[18px] text-foreground">{user.user_metadata?.full_name || ''}</p>
          <p className="text-[16px] text-foreground/60">{user.email}</p>
        </div>
      )}

      {/* Delivery address */}
      <div className="space-y-1.5">
        <Label htmlFor="delivery-address" className="text-[18px] text-foreground/60 tracking-[0.1em]">
          {t.checkout.deliveryAddress}
        </Label>
        <Textarea
          id="delivery-address"
          value={deliveryAddress}
          onChange={e => setDeliveryAddress(e.target.value)}
          className="bg-transparent border-border/50 text-foreground text-[16px] rounded-none focus:border-primary min-h-[60px]"
          placeholder={t.checkout.addressPlaceholder}
        />
      </div>

      {/* Promo code */}
      <div className="space-y-1.5">
        <Label className="text-[18px] text-foreground/60 tracking-[0.1em]">
          {t.checkout.promoCode}
        </Label>
        {promoCode ? (
          <div className="flex items-center justify-between glass-card rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-[16px] text-foreground font-medium">{promoCode}</span>
              {appliedPromo?.type === 'percentage' && (
                <span className="text-[14px] text-primary">-{appliedPromo.value}%</span>
              )}
              {appliedPromo?.type === 'free_delivery' && (
                <span className="text-[14px] text-primary">{t.checkout.freeDelivery}</span>
              )}
            </div>
            <button onClick={removePromoCode} className="text-[14px] text-destructive hover:text-destructive/80 transition-colors cursor-pointer">
              {t.checkout.remove}
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={e => { setPromoInput(e.target.value); setPromoError('') }}
              onKeyDown={e => e.key === 'Enter' && applyPromoCode()}
              className="flex-1 bg-transparent border border-border/50 rounded-lg px-4 py-2.5 text-[16px] text-foreground focus:border-primary outline-none"
              placeholder={t.checkout.promoPlaceholder}
            />
            <button
              onClick={applyPromoCode}
              className="px-4 py-2.5 bg-primary/10 text-primary text-[14px] tracking-[0.15em] rounded-lg hover:bg-primary/20 transition-colors cursor-pointer whitespace-nowrap"
            >
              {t.checkout.apply}
            </button>
          </div>
        )}
        {promoError && <p className="text-[14px] text-destructive">{promoError}</p>}
      </div>
      <div className="glass-card rounded-lg px-4 py-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[16px] text-foreground/60">
            {cartItems.reduce((s, i) => s + i.qty, 0)} {t.cart.items}
          </span>
          <span className="text-[16px] text-foreground/60">£{subtotal.toFixed(2)}</span>
        </div>
        {promoDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-primary">{t.checkout.discount} ({promoCode})</span>
            <span className="text-[14px] text-primary">-£{promoDiscount.toFixed(2)}</span>
          </div>
        )}
        {promoDelivery > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-primary">{t.checkout.discount} ({promoCode})</span>
            <span className="text-[14px] text-primary">-£{promoDelivery.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/20 pt-1">
          <span className="font-serif text-lg text-foreground">{t.checkout.total}</span>
          <span className="font-serif text-lg text-primary">£{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Selected method info or Select Method button */}
      {selectedMethod ? (
        <div className="text-center py-4 text-muted-foreground">
          <div className="flex items-center justify-center gap-3 mb-2">
            {(() => {
              const Icon = methodIcons[selectedMethod]
              return <Icon className="w-5 h-5 text-primary" />
            })()}
            <span className="text-[16px] text-foreground">
              {t.checkout[selectedMethod === 'card' ? 'payByCard' : selectedMethod === 'applepay' ? 'applePay' : selectedMethod === 'googlepay' ? 'googlePay' : 'payPal']}
            </span>
          </div>
          {selectedMethod !== 'paypal' && !clientSecret && (
            <p className="text-[14px]">Setting up payment...</p>
          )}
          <button onClick={handleBackToMethods} className="text-primary hover:underline mt-3 text-[16px] tracking-[0.15em] cursor-pointer">
            {t.checkout.changeMethod}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setMethodModalOpen(true)}
          disabled={submitting || !deliveryAddress.trim()}
          className="w-full py-4 text-[16px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow disabled:opacity-50 cursor-pointer"
        >
          {t.checkout.selectMethod}
        </button>
      )}

      {delivery !== null && delivery > 0 && (
        <div className="flex items-center gap-3 text-[16px] text-foreground/60 bg-border/10 rounded-lg px-4 py-3">
          <Truck className="w-4 h-4 shrink-0 text-primary" />
          <span>
            {delivery === settings.fee
              ? t.checkout.deliveryFee.replace('{fee}', String(settings.fee)).replace('{amount}', (settings.free_threshold - subtotal).toFixed(0))
              : t.checkout.minimumOrder.replace('{min}', String(settings.min_order)).replace('{amount}', (settings.min_order - subtotal).toFixed(0))}
          </span>
        </div>
      )}

      {/* Fallback mock payment when stripe not available */}
      {!hasStripe && selectedMethod && (
        <div className="space-y-4">
          <div className="bg-border/10 border border-border/20 rounded-lg p-4 text-center">
            <p className="font-serif text-3xl text-primary mb-1">£{total}</p>
            <p className="text-[18px] text-foreground/60 tracking-[0.1em]">{t.checkout.totalToPay}</p>
          </div>
          <Button
            type="button"
            onClick={handleMockPayment}
            disabled={submitting || !deliveryAddress.trim()}
            size="lg"
            className="w-full text-[16px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50"
          >
            {submitting ? t.checkout.processing : t.checkout.confirmPayment.replace('{amount}', total.toFixed(2))}
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border/30 sm:max-w-lg max-h-[100dvh] sm:max-h-[90vh] flex flex-col p-4 sm:p-6 max-sm:max-w-full max-sm:rounded-none max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:translate-x-0 max-sm:overflow-x-hidden gap-2">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl tracking-[0.1em] text-foreground">
            {showPayment ? t.checkout.paySecurely : user ? t.checkout.checkout : t.checkout.signIn}
          </DialogTitle>
          <DialogDescription className="text-[16px] tracking-[0.2em] text-foreground/60">
            {showPayment
              ? t.checkout.completePayment
              : user
                ? t.checkout.reviewOrder.replace('{count}', String(cartItems.reduce((s, i) => s + i.qty, 0)))
                : t.checkout.signInToOrder}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 sm:pr-4">
          <div className="pb-4 max-sm:overflow-x-hidden">
          {!showPayment ? (
            <div className="space-y-5">
              {cartItems.length === 0 && !user && (
                <div className="glass-card rounded-lg p-5 space-y-4">
                  <p className="text-base tracking-[0.2em] text-foreground/60 text-center">
                    {t.checkout.signInToCheckout}
                  </p>
                  <p className="text-[16px] text-muted-foreground text-center leading-relaxed">
                    {t.checkout.signInDesc}
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    className="w-full flex items-center justify-center gap-3 border border-border/50 rounded-lg px-4 py-3 text-base text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <Chrome className="w-5 h-5" />
                    {t.checkout.signInWithGoogle}
                  </button>
                </div>
              )}

              {cartItems.length > 0 && (
                <>
                  <div className="glass-card rounded-lg p-4 space-y-2">
                    <p className="text-base tracking-[0.2em] text-foreground/60 mb-3">{t.checkout.orderSummary}</p>
                    {cartItems.map(item => (
                      <div key={item.id} className="flex justify-between text-base">
                        <span className="text-foreground">{item.name} × {item.qty}</span>
                        <span className="text-primary">£{item.price * item.qty}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/20 pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-[16px]">
                        <span className="text-foreground/60">{t.checkout.delivery}</span>
                        <span className="text-foreground/60">{delivery === null ? t.cart.na : delivery === 0 ? t.checkout.free : `£${delivery}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-serif">
                        <span className="text-foreground">{t.checkout.total}</span>
                        <span className="text-primary">£{total}</span>
                      </div>
                    </div>
                  </div>

                  {!user && !authLoading && (
                    <div className="glass-card rounded-lg p-5 space-y-4">
                      <p className="text-base tracking-[0.2em] text-foreground/60 text-center">
                        {t.checkout.signInToCheckout}
                      </p>
                      <p className="text-[16px] text-muted-foreground text-center leading-relaxed">
                        {t.checkout.signInDesc}
                      </p>
                      <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 border border-border/50 rounded-lg px-4 py-3 text-base text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        <Chrome className="w-5 h-5" />
                        {t.checkout.signInWithGoogle}
                      </button>
                    </div>
                  )}

                  {user && !showPayment && (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}

                  {delivery !== null && delivery > 0 && (
                    <div className="flex items-center gap-3 text-[16px] text-foreground/60 bg-border/10 rounded-lg px-4 py-3">
                      <Truck className="w-4 h-4 shrink-0 text-primary" />
                      <span>
                        {delivery === settings.fee
                          ? t.checkout.deliveryFee.replace('{fee}', String(settings.fee)).replace('{amount}', (settings.free_threshold - subtotal).toFixed(0))
                          : t.checkout.minimumOrder.replace('{min}', String(settings.min_order)).replace('{amount}', (settings.min_order - subtotal).toFixed(0))}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => onOpenChange(false)}
                      disabled={submitting}
                      className="flex-1 text-[16px] tracking-[0.2em] rounded-none border-border/50 hover:bg-transparent whitespace-normal"
                    >
                      {t.checkout.cancel}
                    </Button>
                    <Button
                      type="button"
                      disabled={submitting || cartItems.length === 0 || !user || subtotal < settings.min_order}
                      className="flex-1 text-[16px] tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gold-glow py-6 disabled:opacity-50 whitespace-normal text-balance"
                    >
                      {!user ? t.checkout.signInToContinue : submitting ? t.checkout.pleaseWait : subtotal < settings.min_order ? t.checkout.minOrder.replace('{min}', String(settings.min_order)).replace('{amount}', (settings.min_order - subtotal).toFixed(0)) : t.checkout.continueToPay}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            renderPaymentStep()
          )}
          </div>
        </ScrollArea>
      </DialogContent>

      <PaymentMethodModal
        open={methodModalOpen}
        onOpenChange={setMethodModalOpen}
        onSelect={handleMethodSelect}
        total={total}
      />

      <CardPaymentModal
        open={cardModalOpen}
        onOpenChange={(open) => {
          setCardModalOpen(open)
          if (!open) {
            setSelectedMethod(null)
            setClientSecret(null)
          }
        }}
        clientSecret={clientSecret || ''}
        amount={total}
        onSuccess={handlePaymentSuccess}
        userName={user?.user_metadata?.full_name || ''}
        userEmail={user?.email || ''}
      />

      <WalletPaymentModal
        open={walletModalOpen}
        onOpenChange={(open) => {
          setWalletModalOpen(open)
          if (!open) {
            setSelectedMethod(null)
            setClientSecret(null)
          }
        }}
        clientSecret={clientSecret || ''}
        amount={total}
        onSuccess={handlePaymentSuccess}
      />

      <PayPalPaymentModal
        open={paypalModalOpen}
        onOpenChange={(open) => {
          setPaypalModalOpen(open)
          if (!open) {
            setSelectedMethod(null)
          }
        }}
        amount={total}
        onSuccess={handlePostRedirectSuccess}
        onBeforePay={async () => {
          const result = await createOrderViaApi(true)
          return result.order?.id
        }}
      />
    </Dialog>
  )
}
