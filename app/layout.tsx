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
  title: 'Luxury Hats Medellin | Street Culture Premium Caps',
  description: 'Gorras exclusivas nacidas en las calles de Medellin. Cada pieza es una obra de arte urbano que define tu estilo. Envios a toda Colombia.',
  keywords: ['gorras', 'streetwear', 'urban', 'luxury', 'premium', 'caps', 'Medellin', 'Colombia', 'street culture'],
  authors: [{ name: 'Luxury Hats Medellin' }],
  openGraph: {
    title: 'Luxury Hats Medellin | Street Culture',
    description: 'Gorras exclusivas nacidas en las calles de Medellin',
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
