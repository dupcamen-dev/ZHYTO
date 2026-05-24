"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { useLanguage } from '@/components/language-context'

export default function FAQSection() {
  const { t } = useLanguage()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section id="faq" className="py-28 lg:py-36 relative section-orange">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[18px] tracking-[0.35em] mb-5">
            <span className="relative inline-block font-script text-black">
              {t.faq.heading}
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[55%] w-[200%] h-[300%] -z-10">
                <Image src={img("/images/about-card.webp")} alt="" fill className="object-fill" />
              </div>
            </span>
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {t.faq.items.map((item: { q: string; a: string }, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className={`w-full glass-card rounded-none px-6 py-5 text-left flex items-center justify-between gap-4 transition-all cursor-pointer ${
                  openFaq === index
                    ? 'border-l-4 border-primary bg-white shadow-md'
                    : 'border-l-4 border-transparent bg-white hover:bg-primary/[0.02] hover:shadow-md hover:border-primary/20'
                }`}
              >
                <span className="font-serif text-[19px] text-black">{item.q}</span>
                {openFaq === index ? (
                  <Minus className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: -8 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-black text-[17px] leading-relaxed bg-primary/5 border-l-4 border-primary">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-14">
            <a href="#products">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-7 tracking-[0.2em] text-[15px] rounded-none shadow-xl"
              >
                {t.contact.orderNow}
              </Button>
            </a>
            <a
              href="mailto:hello@zhyto.london"
              className="text-[16px] tracking-[0.2em] text-foreground/60 hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-1"
            >
              HELLO@ZHYTO.LONDON
            </a>
          </div>

          <div className="flex items-center justify-center gap-10">
            <a href="https://www.instagram.com/zhyto.london/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
              {t.contact.instagram}
            </a>
            <span className="text-muted-foreground/30">|</span>
            <a href="https://wa.me/440000000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors text-[14px] tracking-[0.2em]">
              {t.contact.whatsapp}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
