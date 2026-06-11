import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { FeaturedProducts } from '@/components/featured-products'
import { FeaturesSection, BrandsSection, CuratedSection } from '@/components/sections'
import { Footer } from '@/components/footer'
import { ChatBot } from '@/components/chatbot'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BrandsSection />
      <FeaturedProducts />
      <FeaturesSection />
      <CuratedSection />
      <Footer />
      <ChatBot />
    </main>
  )
}
