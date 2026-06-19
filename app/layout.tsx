import type { Metadata, Viewport } from 'next'
import { Oswald, Montserrat, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Preloader from '@/components/preloader'
import Cursor from '@/components/cursor'
import { CartDrawer } from '@/components/cart-drawer'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-cinzel', // mapped to original variable to avoid breaking font-cinzel references
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-cormorant', // mapped to original variable to avoid breaking font-cormorant references
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'GOL DE ORO',
  description: 'La tienda oficial para apasionados del fútbol. Encuentra camisetas oficiales de la Selección Colombia, álbumes y sobres Panini, cajas coleccionables y artículos deportivos del Mundial 2026.',
  keywords: ['camisetas de fútbol', 'Selección Colombia', 'Mundial 2026', 'Álbum Panini', 'Sobres Panini', 'Cajas coleccionables', 'Gol de Oro', 'Colombia', 'fútbol'],
  authors: [{ name: 'Gol de Oro' }],
  openGraph: {
    title: 'GOL DE ORO',
    description: 'Vive la pasión del Mundial 2026 con las mejores camisetas de fútbol, álbumes Panini y coleccionables premium.',
    type: 'website',
  },
  icons: {
    icon: '/logoo.png',
    apple: '/logoo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0D0D0D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${oswald.variable} ${montserrat.variable} ${outfit.variable} bg-background`}>
      <head>
        <style>{`
          :root {
            --font-display: var(--font-cinzel);
            --font-graffiti: var(--font-cinzel);
          }
        `}</style>
      </head>
      <body className="font-sans antialiased min-h-screen">
        {/* Preloader (luxury splash) */}
        <Preloader />
        <Cursor />
        {children}
        <CartDrawer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#171717',
              border: '1px solid #262626',
              color: '#F5F5F5',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '0.02em',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
