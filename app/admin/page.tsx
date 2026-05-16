"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Package, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Order {
  id: string
  total: number
  status: string
  created_at: string
  items: { name: string; qty: number }[]
}

interface ProductStat {
  name: string
  count: number
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, confirmed: 0, completed: 0 })

  useEffect(() => {
    if (!supabase) { setLoading(false); return }

    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) {
          const orders = data as Order[]
          setOrders(orders)
          setStats({
            total: orders.length,
            revenue: orders.reduce((s, o) => s + o.total, 0),
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            completed: orders.filter(o => o.status === 'completed').length,
          })
        }
        setLoading(false)
      })
  }, [])

  // Top products
  const productCounts: ProductStat[] = orders
    .flatMap(o => o.items || [])
    .reduce((acc: ProductStat[], item) => {
      const existing = acc.find(p => p.name === item.name)
      if (existing) existing.count += item.qty
      else acc.push({ name: item.name, count: item.qty })
      return acc
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const recentOrders = orders.slice(0, 5)

  const statusIcon: Record<string, typeof Package> = {
    pending: Clock,
    confirmed: CheckCircle,
    completed: Package,
    cancelled: XCircle,
  }

  const statusColor: Record<string, string> = {
    pending: 'text-amber-400',
    confirmed: 'text-sky-400',
    completed: 'text-emerald-400',
    cancelled: 'text-red-400',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Overview of your shop</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <TrendingUp className="w-5 h-5 text-primary mb-3" />
          <p className="text-2xl font-serif text-foreground">£{stats.revenue.toFixed(0)}</p>
          <p className="text-[11px] tracking-[0.15em] text-muted-foreground mt-1">TOTAL REVENUE</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <Package className="w-5 h-5 text-primary mb-3" />
          <p className="text-2xl font-serif text-foreground">{stats.total}</p>
          <p className="text-[11px] tracking-[0.15em] text-muted-foreground mt-1">TOTAL ORDERS</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <Clock className="w-5 h-5 text-amber-400 mb-3" />
          <p className="text-2xl font-serif text-foreground">{stats.pending}</p>
          <p className="text-[11px] tracking-[0.15em] text-muted-foreground mt-1">PENDING</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 mb-3" />
          <p className="text-2xl font-serif text-foreground">{stats.completed}</p>
          <p className="text-[11px] tracking-[0.15em] text-muted-foreground mt-1">COMPLETED</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-serif text-lg text-foreground mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const Icon = statusIcon[order.status] || Package
                return (
                  <div key={order.id} className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-3.5 h-3.5 ${statusColor[order.status] || 'text-muted-foreground'}`} />
                      <span className="text-foreground">#{order.id.slice(0, 6)}</span>
                    </div>
                    <span className="text-primary">£{order.total}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Popular items */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-serif text-lg text-foreground mb-4">Popular Items</h2>
          {productCounts.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {productCounts.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-[13px]">
                  <span className="text-foreground">{i + 1}. {item.name}</span>
                  <span className="text-muted-foreground">{item.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
