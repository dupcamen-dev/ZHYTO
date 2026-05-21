"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CartItem {
  qty: number
  image: string
}

type Cart = Record<number, CartItem>

interface CartContextType {
  cart: Cart
  addToCart: (id: number, image?: string, maxQty?: number) => boolean
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, qty: number, maxQty?: number) => void
  clearCart: () => void
  keepOnly: (validIds: number[]) => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('zhyto-cart')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migrate old format: { id: number } → { id: { qty, image } }
        const migrated: Cart = {}
        for (const [id, val] of Object.entries(parsed)) {
          if (typeof val === 'number') {
            migrated[Number(id)] = { qty: val, image: '' }
          } else {
            migrated[Number(id)] = val as CartItem
          }
        }
        setCart(migrated)
      } catch {}
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem('zhyto-cart', JSON.stringify(cart)) } catch {}
    }
  }, [cart, hydrated])

  const addToCart = useCallback((id: number, image?: string, maxQty?: number): boolean => {
    let added = true
    setCart(prev => {
      const existing = prev[id]
      const newQty = (existing?.qty || 0) + 1
      if (maxQty !== undefined && newQty > maxQty) {
        added = false
        return prev
      }
      return {
        ...prev,
        [id]: {
          qty: newQty,
          image: image || existing?.image || '',
        },
      }
    })
    return added
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => {
      const next = { ...prev }
      if (next[id].qty > 1) next[id] = { ...next[id], qty: next[id].qty - 1 }
      else delete next[id]
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: number, qty: number, maxQty?: number) => {
    setCart(prev => {
      const next = { ...prev }
      if (qty <= 0) delete next[id]
      else if (next[id]) {
        const clamped = maxQty !== undefined ? Math.min(qty, maxQty) : qty
        next[id] = { ...next[id], qty: clamped }
      }
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart({})
    localStorage.removeItem('zhyto-cart')
  }, [])

  const keepOnly = useCallback((validIds: number[]) => {
    setCart(prev => {
      const next: Cart = {}
      for (const [id, item] of Object.entries(prev)) {
        if (validIds.includes(Number(id))) {
          next[Number(id)] = item
        }
      }
      return next
    })
  }, [])

  const totalItems = Object.values(cart).reduce((a, b) => a + b.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, keepOnly, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
