"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import Image from 'next/image'
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
          <p className="text-[14px] tracking-[0.35em] text-primary mb-5">
            <span className="relative inline-block">
              {t.faq.heading}
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[400%] -z-10">
                <Image src={img("/images/about-card.webp")} alt="" fill className="object-contain" />
              </div>
            </span>
          </p>
          <h2 className="text-5xl lg:text-6xl font-serif font-light">
            <span className="font-script text-primary text-[1.15em]">{t.faq.got}</span>{" "}
            <span className="text-black">{t.faq.questions}</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className="w-12 h-px bg-primary/30" />
            <HelpCircle className="w-5 h-5 text-primary/60" />
            <span className="w-12 h-px bg-primary/30" />
          </div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-base">
            {t.faq.stillQuestions}{" "}
            <a
              href="#contact"
              className="text-primary hover:text-primary/80 transition-colors border-b border-primary/30 hover:border-primary/60 pb-0.5"
            >
              {t.faq.getInTouch}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
