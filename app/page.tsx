"use client"

import { useState, useRef, useEffect } from 'react'
import { CartDrawer } from '@/components/cart-drawer'
import { CheckoutModal } from '@/components/checkout-modal'
import Header from '@/components/sections/Header'
import HeroSection from '@/components/sections/HeroSection'
import ProductsSection from '@/components/sections/ProductsSection'
import AboutSection from '@/components/sections/AboutSection'
import DeliverySection from '@/components/sections/DeliverySection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import FAQSection from '@/components/sections/FAQSection'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/sections/Footer'
import ScrollButtons from '@/components/sections/ScrollButtons'
import SignInModal from '@/components/sections/SignInModal'

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [activeProducts, setActiveProducts] = useState<any[]>([])

  const progressRef = useRef(0)
  const [headerMode, setHeaderMode] = useState<'visible' | 'hidden'>('visible')
  const [isOnProducts, setIsOnProducts] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(true)

  const headerModeRef = useRef(headerMode)
  headerModeRef.current = headerMode
  const isOnProductsRef = useRef(false)
  const prevScrollY = useRef(0)
  const productsTopRef = useRef(0)
  const aboutTopRef = useRef(0)

  useEffect(() => {
    const el = document.getElementById('products')
    if (el) productsTopRef.current = el.offsetTop
    const aboutEl = document.getElementById('about')
    if (aboutEl) aboutTopRef.current = aboutEl.offsetTop
  }, [])

  useEffect(() => {
    let ticking = false
    let lastProgress = -1
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY
          const maxY = document.documentElement.scrollHeight - window.innerHeight
          const atTop = y < 50
          const atBottom = y > maxY - 100
          const goingDown = y > prevScrollY.current

          const reviewsEl = document.getElementById('reviews')
          if (reviewsEl) {
            const rect = reviewsEl.getBoundingClientRect()
            const wh = window.innerHeight
            const total = rect.height + wh
            const p = Math.max(0, Math.min(1, (wh - rect.top) / total))
            if (Math.round(p * 100) !== Math.round(lastProgress * 100)) {
              progressRef.current = p
              lastProgress = p
            }
          }

          if (window.innerWidth < 1024 && aboutTopRef.current > 0) {
            const v = y >= productsTopRef.current - 100 && y < aboutTopRef.current - 100
            if (v !== isOnProductsRef.current) { isOnProductsRef.current = v; setIsOnProducts(v) }
          } else if (isOnProductsRef.current) {
            isOnProductsRef.current = false; setIsOnProducts(false)
          }

          if (atTop || !goingDown || atBottom) {
            if (headerModeRef.current !== 'visible') setHeaderMode('visible')
          } else if (goingDown && y >= productsTopRef.current - 100) {
            if (headerModeRef.current !== 'hidden') setHeaderMode('hidden')
          }

          prevScrollY.current = y
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const update = () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight
      setShowScrollTop(window.scrollY > 300)
      setShowScrollBottom(window.scrollY < maxY - 100)
      timeout = setTimeout(update, 200)
    }
    timeout = setTimeout(update, 200)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Header setCartOpen={setCartOpen} setSignInModalOpen={setSignInModalOpen} headerMode={headerMode} />
      <HeroSection />
      <ProductsSection onProductsChange={setActiveProducts} setCartOpen={setCartOpen} />
      <AboutSection />
      <DeliverySection />
      <FAQSection />
      <ContactSection />
      <ReviewsSection setSignInModalOpen={setSignInModalOpen} progressRef={progressRef} />
      <Footer />

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        products={activeProducts}
        onCheckout={() => setCheckoutOpen(true)}
      />
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        products={activeProducts}
      />
      <SignInModal open={signInModalOpen} onOpenChange={setSignInModalOpen} />

      <ScrollButtons
        showScrollTop={showScrollTop}
        showScrollBottom={showScrollBottom}
        isOnProducts={isOnProducts}
        cartOpen={cartOpen}
        checkoutOpen={checkoutOpen}
      />
    </main>
  )
}
