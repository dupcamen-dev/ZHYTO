"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, CheckCircle, Package, XCircle, ChevronDown } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  items: { name: string; price: number; qty: number }[]
  total: number
  delivery_fee: number
  status: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  delivery_address: string
  notes: string | null
  created_at: string
}

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const
const statusConfig: Record<string, { label: string; color: string; icon: typeof Package }> = {
  pending:    { label: 'Pending',     color: 'text-amber-400',  icon: Clock },
  confirmed:  { label: 'Confirmed',   color: 'text-sky-400',    icon: CheckCircle },
  completed:  { label: 'Completed',   color: 'text-emerald-400', icon: Package },
  cancelled:  { label: 'Cancelled',   color: 'text-red-400',    icon: XCircle },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const fetchOrders = () => {
    if (!supabase) { setLoading(false); return }
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    query.then(({ data, error }) => {
      if (!error && data) setOrders(data as Order[])
      setLoading(false)
    })
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateStatus = async (id: string, status: string) => {
    if (!supabase) return
    await supabase.from('orders').update({ status }).eq('id', id)
    fetchOrders()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Orders</h1>
          <p className="text-muted-foreground text-base mt-1">Manage and update order status</p>
        </div>
        {/* Filter */}
        <div className="flex gap-2">
          {['all', ...statuses].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm tracking-[0.15em] transition-colors cursor-pointer ${
                filter === s
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground border border-border/30'
              }`}
            >
              {s === 'all' ? 'ALL' : s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-xl">
          <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const config = statusConfig[order.status] || statusConfig.pending
            const Icon = config.icon
            return (
              <div key={order.id} className="glass-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-mono text-sm text-muted-foreground/50">#{order.id.slice(0, 8)}</p>
                      <span className={`flex items-center gap-1.5 text-sm tracking-[0.1em] font-medium ${config.color}`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-base text-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="font-serif text-2xl text-primary">£{order.total}</span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-base">
                      <span className="text-foreground/80">{item.name} × {item.qty}</span>
                      <span className="text-foreground/60">£{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Customer & Delivery */}
                <div className="border-t border-border/20 pt-4 grid sm:grid-cols-2 gap-4 text-base">
                  <div>
                    <p className="text-sm tracking-[0.15em] text-muted-foreground mb-1">CUSTOMER</p>
                    <p className="text-foreground">{order.customer_name}</p>
                    <p className="text-muted-foreground">{order.customer_email}</p>
                    {order.customer_phone && <p className="text-muted-foreground">{order.customer_phone}</p>}
                  </div>
                  <div>
                    <p className="text-sm tracking-[0.15em] text-muted-foreground mb-1">DELIVERY</p>
                    <p className="text-foreground">{order.delivery_address}</p>
                    {order.notes && <p className="text-muted-foreground mt-1 italic">"{order.notes}"</p>}
                  </div>
                </div>

                {/* Status actions */}
                <div className="border-t border-border/20 pt-4 flex items-center gap-2 mt-4">
                  <span className="text-sm tracking-[0.1em] text-muted-foreground mr-2">UPDATE:</span>
                  {statuses.map(s => {
                    const c = statusConfig[s]
                    const active = s === order.status
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(order.id, s)}
                        disabled={active}
                        className={`px-3 py-1.5 rounded-lg text-sm tracking-[0.1em] transition-colors cursor-pointer disabled:cursor-not-allowed ${
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground border border-border/30 hover:border-border/60'
                        }`}
                      >
                        {c.label.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
