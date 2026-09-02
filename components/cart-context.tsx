"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Cart = Record<number, number>

interface CartContextType {
  cart: Cart
  addToCart: (id: number) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, qty: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('zhyto-cart')
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch {}
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem('zhyto-cart', JSON.stringify(cart)) } catch {}
    }
  }, [cart, hydrated])

  const addToCart = useCallback((id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => {
      const next = { ...prev }
      if (next[id] > 1) next[id]--
      else delete next[id]
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: number, qty: number) => {
    setCart(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else next[id] = qty
      return next
    })
  }, [])

  const clearCart = useCallback(() => setCart({}), [])

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
