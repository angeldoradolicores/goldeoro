import type { Metadata, Viewport } from 'next'
import { Inter, Permanent_Marker } from 'next/font/google'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const permanentMarker = Permanent_Marker({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-graffiti',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Urban Crown | Street Culture Premium Caps & Luxury Streetwear',
  description: 'Gorras exclusivas que fusionan el lujo contemporáneo con la esencia de la cultura streetwear. Diseños seleccionados para quienes valoran la autenticidad.',
  keywords: ['gorras', 'streetwear', 'urban', 'luxury', 'premium', 'caps', 'Urban Crown', 'Colombia', 'street culture'],
  authors: [{ name: 'Urban Crown' }],
  openGraph: {
    title: 'Urban Crown | Street Culture & Luxury Hats',
    description: 'Donde el lujo y la calle se encuentran. Colecciones exclusivas.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${permanentMarker.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
