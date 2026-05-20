"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Package, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

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
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const today = fmt(new Date())
  const weekAgo = fmt(new Date(Date.now() - 7 * 86400000))
  const [fromDate, setFromDate] = useState(weekAgo)
  const [toDate, setToDate] = useState(today)
  const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, confirmed: 0, completed: 0 })
  const [activeDays, setActiveDays] = useState<number | null>(7)

  const fetchOrders = (from: string, to: string) => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setLoading(false); return }
      const params = new URLSearchParams({ limit: '50', from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z` })
      fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data?.orders) {
            const orders = data.orders as Order[]
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
        .catch(() => setLoading(false))
    })
  }

  useEffect(() => { fetchOrders(fromDate, toDate) }, [fromDate, toDate])

  const setPeriod = (days: number) => {
    setActiveDays(days)
    setFromDate(fmt(new Date(Date.now() - days * 86400000)))
    setToDate(fmt(new Date()))
  }

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-base mt-1">Overview of your shop</p>
        </div>
        {/* Date range filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-28 bg-transparent border border-border/50 rounded px-3 py-1.5 text-sm text-foreground focus:border-primary outline-none font-mono tracking-wider"
              placeholder="YYYY-MM-DD"
            />
            <span className="text-muted-foreground text-sm">—</span>
            <input
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-28 bg-transparent border border-border/50 rounded px-3 py-1.5 text-sm text-foreground focus:border-primary outline-none font-mono tracking-wider"
              placeholder="YYYY-MM-DD"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
              { label: 'ALL', days: 3650 },
            ].map(({ label, days }) => (
              <button
                key={label}
                onClick={() => setPeriod(days)}
                className={`px-2.5 py-1 text-xs tracking-[0.15em] border rounded transition-colors cursor-pointer ${
                  activeDays === days
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'border-border/30 text-muted-foreground hover:text-foreground hover:border-foreground/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5">
          <TrendingUp className="w-6 h-6 text-primary mb-3" />
          <p className="text-3xl font-serif text-foreground">£{stats.revenue.toFixed(0)}</p>
          <p className="text-sm tracking-[0.15em] text-muted-foreground mt-1">TOTAL REVENUE</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <Package className="w-6 h-6 text-primary mb-3" />
          <p className="text-3xl font-serif text-foreground">{stats.total}</p>
          <p className="text-sm tracking-[0.15em] text-muted-foreground mt-1">TOTAL ORDERS</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <Clock className="w-6 h-6 text-amber-400 mb-3" />
          <p className="text-3xl font-serif text-foreground">{stats.pending}</p>
          <p className="text-sm tracking-[0.15em] text-muted-foreground mt-1">PENDING</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-3xl font-serif text-foreground">{stats.completed}</p>
          <p className="text-sm tracking-[0.15em] text-muted-foreground mt-1">COMPLETED</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-base text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => {
                const Icon = statusIcon[order.status] || Package
                return (
                  <div key={order.id} className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${statusColor[order.status] || 'text-muted-foreground'}`} />
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
          <h2 className="font-serif text-xl text-foreground mb-4">Popular Items</h2>
          {productCounts.length === 0 ? (
            <p className="text-base text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {productCounts.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-base">
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
