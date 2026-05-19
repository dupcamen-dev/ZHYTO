import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Playfair_Display, Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-context'
import { AuthProvider } from '@/components/auth-context'
import { LanguageProvider } from '@/components/language-context'
import { CookieConsent } from '@/components/cookie-consent'
import { Toaster } from '@/components/ui/sonner'
import { NoiseOverlay } from '@/components/noise-overlay'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
})

const zhyto = localFont({
  src: './fonts/Zhyto-Regular.otf',
  variable: '--font-zhyto',
  display: 'swap',
})

const konstrukt = localFont({
  src: './fonts/KONSTRUKT-Regular.otf',
  variable: '--font-konstrukt',
  display: 'swap',
})

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
})

const epoch = localFont({
  src: './fonts/Epoch_YP_Demo.otf',
  variable: '--font-epoch',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'zhyto.london | Authentic Ukrainian Varenyky & Syrnyky',
  description: 'Handcrafted Ukrainian varenyky and syrnyky delivered to your door in London. Marketplace for authentic homemade cuisine.',
  keywords: ['varenyky', 'syrnyky', 'ukrainian food', 'london', 'dumplings', 'marketplace'],
  icons: {
    icon: [
      { url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23f5e6c8'/%3E%3Cpath d='M24 50 Q50 20 76 50 Q50 80 24 50Z' fill='%238b6914' stroke='%236b4f0a' stroke-width='6'/%3E%3Cellipse cx='50' cy='50' rx='12' ry='7' fill='%236b4f0a' opacity='0.45'/%3E%3C/svg%3E", type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#c2a57b',
  colorScheme: 'only light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${zhyto.variable} ${geist.variable} ${konstrukt.variable} ${epoch.variable} bg-background`} style={{ colorScheme: 'only light' }}>
      <body className="font-serif antialiased">
        <AuthProvider>
          <LanguageProvider>
          <CartProvider>
{children}
            <NoiseOverlay />
            <CookieConsent />
            <Toaster />
          </CartProvider>
        </LanguageProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
