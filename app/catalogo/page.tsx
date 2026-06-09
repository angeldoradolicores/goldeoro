'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Grid3X3, LayoutList, X, Sparkles, Filter } from 'lucide-react'
import { mockProducts, type Product } from '@/lib/store'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ChatBot } from '@/components/chatbot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/product-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const categories = ['Todos', 'Urban', 'Streetwear', 'Premium', 'Sport', 'Classic']

function CatalogoContent() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Listen to filter search param changes to automatically update sorting
  useEffect(() => {
    if (filter === 'new') {
      setSortBy('newest')
    } else if (filter === 'bestsellers') {
      setSortBy('featured')
    }
  }, [filter])

  // Fetch products from API or use mock data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams()
        if (selectedCategory !== 'Todos') {
          params.set('category', selectedCategory)
        }
        if (search) {
          params.set('search', search)
        }
        
        const res = await fetch(`/api/products?${params}`)
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data)
          } else {
            setProducts(mockProducts)
          }
        } else {
          setProducts(mockProducts)
        }
      } catch {
        setProducts(mockProducts)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [selectedCategory, search])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          if (dateA !== dateB) return dateB - dateA
          return Number(b.id) - Number(a.id)
        })
        break
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return filtered
  }, [products, sortBy])

  // Skeleton loader
  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-secondary/50" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-secondary/50 rounded w-1/4" />
        <div className="h-5 bg-secondary/50 rounded w-3/4" />
        <div className="h-4 bg-secondary/50 rounded w-1/2" />
      </div>
    </div>
  )

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden graffiti-bg">
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-neon-pink/10 blur-[100px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-neon-cyan/10 blur-[100px]"
          />
        </div>
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-cyan/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-bold uppercase tracking-wider text-neon-cyan">
              Coleccion Completa
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black leading-tight"
          >
            <span className="text-foreground">Nuestro</span>
            <br />
            <span className="text-gradient-neon text-glow-pink">CATALOGO</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Explora nuestra seleccion exclusiva de gorras urbanas 
            <span className="text-neon-pink font-semibold"> premium de Medellin</span>
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-4 rounded-2xl glass border border-border/30"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar gorras..."
                className="pl-10 bg-secondary/50 border-neon-cyan/20 focus:border-neon-cyan"
              />
            </div>

            {/* Categories - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? 'btn-luxury' 
                    : 'border-border/50 hover:border-neon-pink/50 hover:text-neon-pink'}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              className="lg:hidden border-neon-cyan/30 hover:bg-neon-cyan/10"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="newest">Novedades</SelectItem>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-neon-pink text-primary-foreground glow-pink' 
                    : 'hover:bg-secondary'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-neon-pink text-primary-foreground glow-pink' 
                    : 'hover:bg-secondary'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Mobile Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 p-4 rounded-2xl glass border border-border/30 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neon-cyan">Categorias</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowFilters(false)
                      }}
                      className={selectedCategory === category ? 'btn-luxury' : 'border-border/50'}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="text-neon-pink font-bold">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedCategory}-${sortBy}-${viewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'flex flex-col gap-4'
                }
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    index={index} 
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {!loading && filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground mb-6">
                Intenta con otros criterios de busqueda
              </p>
              <Button
                variant="outline"
                className="border-neon-pink/50 hover:bg-neon-pink/10"
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('Todos')
                }}
              >
                Limpiar Filtros
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      <CartDrawer />
      <ChatBot />
    </main>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex flex-col justify-between">
        <Navbar />
        <section className="pt-32 pb-16 relative overflow-hidden flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-black text-foreground">Cargando Catálogo...</h1>
          </div>
        </section>
        <Footer />
      </main>
    }>
      <CatalogoContent />
    </Suspense>
  )
}
