"use client"

import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-context'
import { useDeliverySettings, calcDelivery } from '@/lib/use-delivery'
import { useLanguage } from '@/components/language-context'

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  onCheckout: () => void
}

export function CartDrawer({ open, onOpenChange, products, onCheckout }: CartDrawerProps) {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems } = useCart()
  const { settings } = useDeliverySettings()
  const { t } = useLanguage()

  const cartItems = Object.entries(cart)
    .map(([id, item]) => {
      const product = products.find(p => p.id === Number(id))
      return product ? { ...product, image: item.image || product.image, qty: item.qty } : null
    })
    .filter(Boolean) as (Product & { qty: number })[]

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = calcDelivery(subtotal, settings)
  const total = subtotal + (delivery ?? 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-border/30 flex flex-col p-0 max-h-dvh">
        <SheetHeader className="p-4 sm:p-6 pb-0">
          <SheetTitle className="font-serif text-xl sm:text-2xl tracking-[0.1em] text-foreground">
            {t.cart.yourCart}
          </SheetTitle>
          <SheetDescription className="text-base tracking-[0.2em] text-foreground/60">
            {totalItems} {totalItems === 1 ? t.cart.item : t.cart.items} {t.cart.inYourCart}
          </SheetDescription>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground text-[18px] tracking-[0.15em] mb-2">{t.cart.cartEmpty}</p>
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="mt-4 text-lg tracking-[0.2em] rounded-none border-border/50"
                  onClick={() => { document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}
                >
                  {t.cart.continueShopping}
                </Button>
              </SheetClose>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 glass-card rounded-lg p-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-lg text-foreground mb-1">{item.name}</h4>
                      <p className="text-primary font-serif text-lg mb-3">£{item.price}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-[18px] w-6 text-center font-medium text-foreground">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => updateQuantity(item.id, 0)}
                          className="ml-auto w-7 h-7 rounded-full border border-border/50 flex items-center justify-center hover:border-destructive hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border/30 p-4 sm:p-6 space-y-3">
              <div className="flex justify-between text-[18px]">
                <span className="text-muted-foreground">{t.cart.subtotal}</span>
                <span className="text-foreground">£{subtotal}</span>
              </div>
              <div className="flex justify-between text-[18px]">
                <span className="text-muted-foreground">{t.cart.delivery}</span>
                <span className="text-foreground">{delivery === null ? t.cart.na : delivery === 0 ? t.cart.free : `£${delivery}`}</span>
              </div>
              <div className="flex justify-between text-[20px] font-serif pt-2 border-t border-border/20">
                <span className="text-foreground">{t.cart.total}</span>
                <span className="text-primary">£{total}</span>
              </div>

              {/* Delivery progress bar */}
              {subtotal < settings.free_threshold && (
                <div className="space-y-2">
                  <div className="relative h-1.5 bg-border/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/60 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / settings.free_threshold) * 100, 100)}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '50%' }}>
                      <div className="w-2 h-2 rounded-full bg-border/50" />
                    </div>
                  </div>
                  <div className="flex justify-between text-base tracking-[0.1em] text-foreground/60">
                    <span>£0</span>
                    <span>£{settings.min_order}</span>
                    <span>£{settings.free_threshold}</span>
                  </div>
                  <p className="text-[18px] text-foreground/60 tracking-[0.1em]">
                    {subtotal < settings.min_order
                      ? t.cart.addMoreMin.replace('{amount}', (settings.min_order - subtotal).toFixed(0)).replace('{min}', settings.min_order)
                      : t.cart.addMoreFree.replace('{amount}', (settings.free_threshold - subtotal).toFixed(0))}
                  </p>
                  {cartItems.length > 0 && (
                    <button
                      onClick={() => clearCart()}
                      className="w-full text-base tracking-[0.15em] text-foreground/40 hover:text-destructive transition-colors py-1"
                    >
                      {t.cart.clearAll}
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <SheetClose asChild>
                  <Button variant="outline" size="lg" className="flex-1 text-lg tracking-[0.2em] rounded-none border-border/50">
                    {t.cart.continue}
                  </Button>
                </SheetClose>
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    onCheckout()
                  }}
                  size="lg"
                  disabled={subtotal < settings.min_order}
                  className="flex-1 text-lg tracking-[0.2em] rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t.cart.checkout}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
