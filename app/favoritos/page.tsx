'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import SparklesUI from '@/components/sparkles'
import { useFavoritesStore, useAuthStore, useCartStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function FavoritosPage() {
  const router = useRouter()
  const { items: favoriteProducts, toggleFavorite, clearFavorites } = useFavoritesStore()
  const { user, isInitialized } = useAuthStore()
  const { addItem } = useCartStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.push('/auth/login?redirect=/favoritos')
      } else {
        setIsLoading(false)
      }
    }
  }, [isInitialized, user, router])

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) {
      toast.error('No tienes favoritos para agregar')
      return
    }

    let addedCount = 0
    favoriteProducts.forEach(product => {
      if (product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0) {
        addItem(product, product.colors[0], product.sizes[0], 1)
        addedCount++
      }
    })

    if (addedCount > 0) {
      toast.success(`${addedCount} producto(s) agregado(s) al carrito`)
    }
  }

  const handleClearFavorites = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todos tus favoritos?')) {
      clearFavorites()
      toast.success('Favoritos limpiados')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian">
        <Navbar />
        <div className="pt-36 pb-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-chrome animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />
      <SparklesUI extra={2} />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-titanium hover:text-white-diamond hover:bg-graphite"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-wider text-white-diamond flex items-center gap-3">
                <Heart className="w-8 h-8 text-chrome fill-chrome" />
                Mis Favoritos
              </h1>
            </div>
            <p className="text-titanium font-light">
              {favoriteProducts.length === 0
                ? 'Aún no tienes productos favoritos'
                : `Tienes ${favoriteProducts.length} producto${favoriteProducts.length !== 1 ? 's' : ''} en favoritos`}
            </p>
          </motion.div>

          {favoriteProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <Heart className="w-16 h-16 text-steel mb-6 opacity-50" />
              <h2 className="text-xl font-display text-white-diamond mb-3">Sin favoritos aún</h2>
              <p className="text-titanium text-center max-w-md mb-8 font-light">
                Explora nuestros productos y agrega los que te gusten a tu lista de favoritos
              </p>
              <Button
                onClick={() => router.push('/catalogo')}
                className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold"
              >
                Explorar Colección
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 mb-8 flex-wrap"
              >
                <Button
                  onClick={handleAddAllToCart}
                  className="btn-luxury rounded-none text-xs uppercase tracking-wider font-semibold flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Agregar Todos al Carrito
                </Button>
                <Button
                  onClick={handleClearFavorites}
                  variant="outline"
                  className="border-steel/30 text-titanium hover:text-white-diamond hover:bg-graphite rounded-none text-xs uppercase tracking-wider font-semibold"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Limpiar Favoritos
                </Button>
              </motion.div>

              {/* Products Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {favoriteProducts.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
