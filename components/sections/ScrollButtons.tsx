"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ScrollButtonsProps {
  showScrollTop: boolean
  showScrollBottom: boolean
  isOnProducts: boolean
  cartOpen: boolean
  checkoutOpen: boolean
}

export default function ScrollButtons({
  showScrollTop,
  showScrollBottom,
  isOnProducts,
  cartOpen,
  checkoutOpen,
}: ScrollButtonsProps) {
  return (
    <>
      <AnimatePresence>
        {showScrollTop && !cartOpen && !checkoutOpen && !isOnProducts && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="fixed bottom-[200px] lg:bottom-28 right-6 lg:right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollBottom && !cartOpen && !checkoutOpen && !isOnProducts && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
            aria-label="Scroll to bottom"
            className="fixed bottom-20 lg:bottom-8 right-6 lg:right-8 z-50 w-12 h-12 rounded-full bg-black text-cream flex items-center justify-center shadow-lg hover:bg-black/80 transition-colors"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
