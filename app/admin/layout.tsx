"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/auth-context'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, ShoppingBag, ClipboardList, Settings, ArrowLeft, LogOut, Menu, X } from 'lucide-react'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/products', label: 'Menu', icon: ShoppingBag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) { router.push('/'); return }
    if (!supabase) { router.push('/'); return }
    supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data, error }) => {
      if (error || !data || data.role !== 'admin') {
        router.push('/')
        return
      }
      setIsAdmin(true)
      setChecking(false)
    })
  }, [user, loading, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (loading || checking) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!isAdmin) return null

  const sidebar = (
    <>
      <div className="p-6 border-b border-border/30 flex items-center justify-between">
        <Link href="/admin" className="font-serif text-xl tracking-[0.1em] text-foreground">zhyto.admin</Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(link => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base tracking-[0.15em] transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-border/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border/30 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-border/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO SITE
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-[0.15em] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r border-border/30 flex flex-col bg-card
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:hidden
      `}>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-border/30 flex-col bg-card shrink-0">
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar with hamburger */}
        <div className="sticky top-0 z-30 lg:hidden flex items-center gap-3 p-4 border-b border-border/30 bg-background">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-base tracking-[0.1em] text-foreground">zhyto.admin</span>
        </div>

        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
