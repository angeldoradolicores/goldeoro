import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { FeaturedProducts } from '@/components/featured-products'
import { FeaturesSection, TestimonialsSection, BrandsSection, PromoBanner } from '@/components/sections'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ChatBot } from '@/components/chatbot'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BrandsSection />
      <FeaturedProducts />
      <FeaturesSection />
      <PromoBanner />
      <TestimonialsSection />
      <Footer />
      <CartDrawer />
      <ChatBot />
    </main>
  )
}
