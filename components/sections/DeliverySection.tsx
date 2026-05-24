"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { img as imgPath } from '@/lib/constants'
const img = imgPath
import { useLanguage } from '@/components/language-context'
import { useDeliverySettings } from '@/lib/use-delivery'

export default function DeliverySection() {
  const { t } = useLanguage()
  const { settings: delivery } = useDeliverySettings()

  return (
    <section id="delivery" className="py-16 lg:py-20 bg-background overflow-hidden" style={{ contentVisibility: 'auto' }}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="sm:px-12 py-8 relative">
              <h3 className="font-script text-4xl md:text-3xl lg:text-4xl mb-3 lg:text-left text-center text-black relative z-10 inline-block uppercase lg:ml-8">
                {t.delivery.headingPrefix}
                <span>{t.delivery.headingSuffix}</span>
                {t.delivery.headingSuffix && (
                  <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-[55%] w-[140%] h-[280%] -z-10">
                    <Image
                      src={img("/images/about-card.webp")}
                      alt=""
                      fill
                      className="object-fill"
                    />
                  </div>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-base lg:text-lg mt-10 lg:mt-16 max-w-[500px] mx-auto lg:mx-0 lg:ml-8">
                <span className="text-foreground font-medium">{t.delivery.sameDay}</span>
                <span className="text-foreground text-right">{t.delivery.zones1to3}</span>
                <span className="text-foreground font-medium">{t.delivery.nextDay}</span>
                <span className="text-foreground text-right">{t.delivery.allLondon}</span>
                <span className="text-foreground font-medium">{t.delivery.minOrder}</span>
                <span className="text-foreground text-right">&pound;{delivery.min_order}</span>
                <span className="text-foreground font-medium">{t.delivery.freeDelivery}</span>
                <span className="text-foreground text-right">{t.delivery.ordersOver} &pound;{delivery.free_threshold}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
