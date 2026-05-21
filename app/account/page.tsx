"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-context'
import { useCart } from '@/components/cart-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Clock, Package, ArrowLeft, LogOut } from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  items: { name: string; price: number; quantity: number }[]
  total: number
  delivery_fee: number
  status: 'pending' | 'confirmed' | 'completed'
  delivery_address: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending:    { label: 'Awaiting Confirmation', color: 'text-amber-400',     dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmed',             color: 'text-sky-400',       dot: 'bg-sky-400' },
  completed:  { label: 'Completed',             color: 'text-emerald-400',   dot: 'bg-emerald-400' },
}

export default function AccountPage() {
  const { user, loading, signOut } = useAuth()
  const { clearCart } = useCart()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Clear cart after successful PayPal/Card redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('redirect_status') === 'succeeded') {
      clearCart()
      const url = new URL(window.location.href)
      url.search = ''
      window.history.replaceState({}, '', url)
    }
  }, [clearCart])

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/'); return }
    if (!supabase) { setOrdersLoading(false); return }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) {
        setOrdersLoading(false)
        return
      }

      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setOrders(data as Order[])
          else toast.error('Failed to load orders')
          setOrdersLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load orders')
          setOrdersLoading(false)
        })
    })
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[15px] tracking-[0.15em] text-foreground/60 hover:text-primary transition-colors mb-4">
              <ArrowLeft className="w-3.5 h-3.5" />
              BACK TO SHOP
            </Link>
            <h1 className="font-serif text-4xl text-foreground">My Account</h1>
            <p className="text-muted-foreground text-[15px] mt-1">
              {user.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-[15px] tracking-[0.15em] rounded-none border-border/50 gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            SIGN OUT
          </Button>
        </div>

        {/* Orders */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl text-foreground">My Orders</h2>
          </div>

          {ordersLoading ? (
            <div className="text-center py-16">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[13px] text-muted-foreground tracking-[0.15em]">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-xl">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-[15px] text-muted-foreground tracking-[0.15em] mb-2">No orders yet</p>
              <Link href="/">
                <Button variant="outline" className="mt-4 text-[13px] tracking-[0.2em] rounded-none border-border/50">
                  START SHOPPING
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                return (
                  <div key={order.id} className="glass-card rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[14px] tracking-[0.2em] text-muted-foreground mb-1">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                        <p className="text-[14px] font-mono text-muted-foreground/50">
                          #{order.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                        <span className={`text-[15px] tracking-[0.1em] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[14px]">
                          <span className="text-foreground">{item.name} × {item.quantity ?? item.qty}</span>
                          <span className="text-primary">£{item.price * (item.quantity ?? item.qty)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/20 pt-3 flex items-center justify-between">
                      <span className="text-[15px] text-muted-foreground">
                        {order.delivery_address}
                      </span>
                      <span className="font-serif text-lg text-primary">£{order.total}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
