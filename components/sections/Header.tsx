"use client"

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { img } from '@/lib/constants'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/components/cart-context'
import { useAuth } from '@/components/auth-context'
import { useLanguage } from '@/components/language-context'

interface HeaderProps {
  setCartOpen: (open: boolean) => void
  setSignInModalOpen: (open: boolean) => void
  headerMode: 'tall' | 'normal' | 'hidden'
}

export default function Header({ setCartOpen, setSignInModalOpen, headerMode }: HeaderProps) {
  const router = useRouter()
  const { t, lang, toggleLang } = useLanguage()
  const { totalItems } = useCart()
  const { user, loading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const navLinks = [
    { name: t.nav.ourMenu, href: "#products" },
    { name: t.nav.aboutUs, href: "#about" },
    { name: t.nav.delivery, href: "#delivery" },
    { name: t.nav.reviews, href: "#reviews" },
    { name: t.nav.faq, href: "#faq" },
    { name: t.nav.contact, href: "#contact" },
  ]

  useEffect(() => {
    if (!supabase || !user) { setIsAdmin(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setIsAdmin(false); return }
      fetch('/api/auth/user', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data?.user?.profile?.role === 'admin')
        })
        .catch(() => setIsAdmin(false))
    })
  }, [user])

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 overflow-visible"
        style={{ backgroundColor: '#c2a57b' }}
        initial={{ y: -80 }}
        animate={{ y: headerMode === 'hidden' ? -300 : 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? 'px-8 lg:px-14' : 'px-5 lg:px-10'}`} style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <motion.div
            className="flex items-center justify-between"
            animate={{ height: headerMode === 'tall' ? '12rem' : '9rem' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {/* Cart - Mobile Left */}
            <div className="lg:hidden flex items-center">
              <motion.button
                onClick={() => setCartOpen(true)}
                aria-label={t.header.openCart}
                className="relative w-11 h-11 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Logo */}
            <motion.a
              href="#"
              className={`flex items-center transition-all duration-[400ms] ease-in-out ${headerMode === 'tall' ? 'lg:-ml-14' : 'lg:-ml-10'} absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0`}
              whileHover={{ scale: 1.06, rotate: -0.5 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              <Image
                src={img("/images/logo-header.webp")}
                alt="zhyto.london"
                width={520}
                height={130}
                className="h-16 sm:h-[90px] lg:h-[130px] w-auto max-w-[220px] sm:max-w-none"
                priority
              />
            </motion.a>

            {/* Nav Links - Desktop */}
            <div className="hidden lg:flex items-center gap-7 xl:gap-8">
              {navLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="relative text-[13px] tracking-[0.15em] text-foreground/80 hover:text-primary transition-colors duration-300 font-medium"
                  whileHover={{ y: -1 }}
                >
                  {link.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary rounded-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileHover={{ scaleX: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              ))}
            </div>

            {/* Cart (desktop), Auth & Mobile Toggle */}
            <div className="flex items-center gap-4 lg:ml-8">
              {/* Cart - Desktop */}
              <motion.button
                onClick={() => setCartOpen(true)}
                aria-label={t.header.openCart}
                className="hidden lg:flex relative w-11 h-11 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-lg"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.button>

              {/* User button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                    <motion.button
                      onClick={() => router.push('/account')}
                      className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer shrink-0"
                      title={t.header.myAccount}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="w-4 h-4" />
                    </motion.button>
                    <span className="hidden lg:inline text-[13px] tracking-[0.05em] text-foreground/60 max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    {isAdmin && (
                    <motion.button
                      onClick={() => router.push('/admin')}
                      className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[13px] tracking-[0.1em] font-medium cursor-pointer shrink-0"
                      title={t.header.admin}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      A
                    </motion.button>
                    )}
                    <motion.button
                      onClick={signOut}
                      className="hidden sm:flex w-9 h-9 rounded-full border-2 border-foreground/20 items-center justify-center hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer shrink-0"
                      title={t.header.signOut}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setSignInModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-2 text-[13px] tracking-[0.12em] text-foreground hover:text-primary transition-colors border-2 border-primary/20 rounded-full px-5 py-2 hover:border-primary/50 cursor-pointer bg-primary/5"
                    whileHover={{ scale: 1.05, borderColor: '#0058d280' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4" />
                    {t.header.signIn}
                  </motion.button>
                )
              )}
              {/* Language Toggle - desktop only */}
              <button
                onClick={toggleLang}
                className="hidden lg:flex w-10 h-10 rounded-full border-2 border-foreground/20 items-center justify-center text-[13px] tracking-[0.12em] font-medium text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                aria-label={lang === 'en' ? 'Switch to Ukrainian' : 'Переключити на англійську'}
              >
                {t.header.lang}
              </button>
              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t.header.closeMenu : t.header.openMenu}
                className="lg:hidden w-11 h-11 rounded-full border-2 border-foreground/20 flex items-center justify-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ rotate: 90, scale: 0.95 }}
              >
                {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ clipPath: 'circle(0% at 50% 50%)' }}
              animate={{ clipPath: 'circle(140% at 50% 50%)' }}
              exit={{ clipPath: 'circle(0% at 50% 50%)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 flex flex-col items-center justify-start pt-40 gap-10 h-full overflow-y-auto pb-10"
            >
               {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => { setMobileMenuOpen(false); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }) }}
                  className="text-lg tracking-[0.25em] text-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              {!loading && (
                user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + navLinks.length * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <span className="text-sm tracking-[0.15em] text-foreground/40 -mb-4">
                        {user.email?.split('@')[0]}
                      </span>
                      <Link
                        href="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        {t.mobileMenu.myAccount}
                      </Link>
                    </motion.div>
                      {isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + (navLinks.length + 1) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                      >
                        {t.mobileMenu.admin}
                      </Link>
                    </motion.div>
                      )}
                    <motion.button
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: 0.15 + (navLinks.length + 2) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      onClick={() => { signOut(); setMobileMenuOpen(false) }}
                      className="text-lg tracking-[0.25em] text-destructive/60 hover:text-destructive transition-colors"
                    >
                      {t.mobileMenu.signOut}
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.15 + navLinks.length * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => { setMobileMenuOpen(false); setSignInModalOpen(true) }}
                    className="text-lg tracking-[0.25em] text-primary hover:text-primary/80 transition-colors"
                  >
                    {t.mobileMenu.signIn}
                  </motion.button>
                )
              )}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.15 + (navLinks.length + 3) * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={toggleLang}
                className="text-lg tracking-[0.25em] text-foreground/60 hover:text-primary transition-colors"
              >
                {lang === 'en' ? 'UA' : 'EN'}
              </motion.button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
