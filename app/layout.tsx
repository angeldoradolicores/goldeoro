import type { Metadata, Viewport } from 'next'
import { Cinzel, Montserrat, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Urban Crown | Luxury Streetwear Premium Caps',
  description: 'Gorras exclusivas que fusionan el lujo contemporáneo con la esencia de la cultura streetwear. Diseños seleccionados para quienes valoran la autenticidad.',
  keywords: ['gorras', 'streetwear', 'urban', 'luxury', 'premium', 'caps', 'Urban Crown', 'Colombia', 'street culture'],
  authors: [{ name: 'Urban Crown' }],
  openGraph: {
    title: 'Urban Crown | Luxury Streetwear',
    description: 'Donde el lujo y la calle se encuentran. Colecciones exclusivas.',
    type: 'website',
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
    <html lang="es" className={`${cinzel.variable} ${montserrat.variable} ${cormorant.variable} bg-background`}>
      <head>
        <style>{`
          :root {
            --font-display: var(--font-cinzel);
            --font-graffiti: var(--font-cinzel);
          }
        `}</style>
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
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
