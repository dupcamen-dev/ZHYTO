import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Cormorant_Garamond, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-context'
import { AuthProvider } from '@/components/auth-context'
import { CookieConsent } from '@/components/cookie-consent'
import { Toaster } from '@/components/ui/sonner'
import { NoiseOverlay } from '@/components/noise-overlay'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const zhyto = localFont({
  src: './fonts/Zhyto-Regular.otf',
  variable: '--font-zhyto',
  display: 'swap',
})

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: 'zhyto.london | Authentic Ukrainian Varenyky & Syrnyky',
  description: 'Handcrafted Ukrainian varenyky and syrnyky delivered to your door in London. Marketplace for authentic homemade cuisine.',
  keywords: ['varenyky', 'syrnyky', 'ukrainian food', 'london', 'dumplings', 'marketplace'],
  icons: {
    icon: [
      { url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌾</text></svg>', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#c2a57b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${zhyto.variable} ${geist.variable} bg-background`}>
      <body className="font-serif antialiased">
        <AuthProvider>
          <CartProvider>
{children}
            <NoiseOverlay />
            <CookieConsent />
            <Toaster />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
