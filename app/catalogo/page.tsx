'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, Grid3X3, LayoutList, X, Sparkles, Filter } from 'lucide-react'
import { type Product } from '@/lib/store'
import SparklesUI from '@/components/sparkles'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
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
import { useCategories } from '@/lib/hooks/use-products'

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
  const { categories: adminCategories = [], isLoading: loadingCategories } = useCategories()
  const validCategorySlugs = adminCategories.map((category) => category.slug)
  const router = useRouter()

  useEffect(() => {
    if (loadingCategories) return
    if (selectedCategory !== 'Todos' && !validCategorySlugs.includes(selectedCategory)) {
      setSelectedCategory('Todos')
    }
  }, [selectedCategory, validCategorySlugs, loadingCategories])

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
          if (Array.isArray(data)) {
            setProducts(data)
          } else {
            setProducts([])
          }
        } else {
          setProducts([])
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchProducts, 300)
    return () => clearTimeout(debounce)
  }, [selectedCategory, search])

  // Keep URL in sync with selected filters (category + sort) without causing replace loops
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory && selectedCategory !== 'Todos') params.set('category', selectedCategory)
    if (sortBy) params.set('sort', sortBy)

    // Build current minimal representation from actual search params
    const currentCategory = searchParams.get('category') || ''
    const currentSort = searchParams.get('sort') || ''
    const current = new URLSearchParams()
    if (currentCategory) current.set('category', currentCategory)
    if (currentSort) current.set('sort', currentSort)

    const desired = params.toString()
    if (current.toString() !== desired) {
      const href = desired ? `/catalogo?${desired}` : '/catalogo'
      router.replace(href)
    }
  }, [selectedCategory, sortBy, router, searchParams])

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
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-graphite border border-steel/20 rounded-lg" />
      <div className="space-y-2">
        <div className="h-3 bg-steel rounded w-1/4" />
        <div className="h-5 bg-steel rounded w-3/4" />
        <div className="h-4 bg-steel rounded w-1/2" />
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-obsidian">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-obsidian border-b border-steel/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(200,164,77,0.02)_0%,transparent_70%)]" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,139,139,0.02)_0%,transparent_70%)]" />
          <SparklesUI extra={1} />
        </div>
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-graphite/40 border border-gold-action/20 mb-8"
          >
            {/* small icon for label */}
            <span className="w-4 h-4 inline-block" aria-hidden>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold-action"><path fill="currentColor" d="M12 2l1.5 4.5L18 8l-3.5 2.5L14 15l-2-1-2 1 .5-4.5L6 8l4.5-1.5L12 2z"/></svg>
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-action font-sans">
              Colección Completa
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight tracking-tight uppercase"
          >
            <span className="text-white-diamond">NUESTRO</span>
            <br />
            <span className="text-gradient-gold mt-2 inline-block">CATÁLOGO</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-6 text-sm md:text-base text-titanium max-w-xl mx-auto leading-relaxed font-sans font-light tracking-wide"
          >
            Explora nuestra selección exclusiva de gorras urbanas <span className="text-gold-action font-normal">premium de COLOMBIA</span>.
          </motion.p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-10 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-5 bg-carbon border border-steel/30 rounded-none shadow-xl"
          >
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-titanium" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar gorras..."
                className="pl-10 bg-graphite border-steel/30 focus:border-gold-action rounded-none text-sm placeholder-titanium"
              />
            </div>

            {/* Categories - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              {([
                { slug: 'Todos', label: 'Todos' },
                ...adminCategories.map((c) => ({ slug: c.slug, label: c.name })),
              ]).map(({ slug, label }) => (
                <Button
                  key={slug}
                  variant={selectedCategory === slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(slug)}
                  className={`${
                    selectedCategory === slug
                      ? 'btn-luxury rounded-none text-obsidian'
                      : 'border-steel/50 text-chrome hover:border-gold-action/50 hover:text-gold-action rounded-none'
                  } text-xs tracking-wider uppercase font-medium`}
                >
                  {label}
                </Button>
              ))}
              
            </div>

            {/* Mobile Filters Toggle */}
            <Button
              variant="outline"
              className="lg:hidden border-steel/50 text-chrome hover:border-gold-action hover:bg-gold-action/5 rounded-none text-xs uppercase tracking-wider font-medium"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-52 bg-graphite border-steel/30 rounded-none text-xs uppercase tracking-wider font-medium text-chrome focus:border-gold-action">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs uppercase tracking-wider font-medium">
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="newest">Novedades</SelectItem>
                <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-graphite border border-steel/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-gold-action text-obsidian' 
                    : 'text-titanium hover:text-white-diamond'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-all ${
                  viewMode === 'list' 
                    ? 'bg-gold-action text-obsidian' 
                    : 'text-titanium hover:text-white-diamond'
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
                className="lg:hidden mt-4 p-5 bg-graphite border border-steel/30 rounded-none overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm uppercase tracking-widest text-gold-action">Categorías</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="text-chrome hover:text-white-diamond">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Todos', ...adminCategories.map((c) => c.name)].map((categoryName, idx) => {
                    const slug = idx === 0 ? 'Todos' : adminCategories[idx - 1].slug
                    const label = idx === 0 ? 'Todos' : categoryName
                    return (
                      <Button
                        key={slug}
                        variant={selectedCategory === slug ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(slug)
                          setShowFilters(false)
                        }}
                        className={`${
                          selectedCategory === slug 
                            ? 'btn-luxury text-obsidian' 
                            : 'border-steel/50 text-chrome hover:border-gold-action/50'
                        } text-xs tracking-wider uppercase font-medium rounded-none`}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="mt-6 text-[10px] uppercase tracking-[0.2em] text-titanium font-sans">
            <span className="text-gold-action font-semibold">{filteredProducts.length}</span> {filteredProducts.length !== 1 ? 'piezas encontradas' : 'pieza encontrada'}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="pb-32">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                transition={{ duration: 0.5 }}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                  : 'flex flex-col gap-6'
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
              className="text-center py-24"
            >
              <div className="w-16 h-16 rounded-full bg-graphite border border-steel/20 flex items-center justify-center mx-auto mb-6">
                <Search className="w-6 h-6 text-titanium" />
              </div>
              <h3 className="text-lg font-display uppercase tracking-widest mb-2 text-white-diamond">No se encontraron productos</h3>
              <p className="text-sm text-titanium mb-8 max-w-sm mx-auto">
                Intenta con otros criterios de búsqueda o limpia los filtros.
              </p>
              <Button
                variant="outline"
                className="border-gold-action/40 hover:bg-gold-action/10 text-gold-action rounded-none uppercase text-xs tracking-widest px-8 py-5"
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
      <ChatBot />
    </main>
  )
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-obsidian flex flex-col justify-between">
        <Navbar />
        <section className="pt-32 pb-16 relative overflow-hidden flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display text-white-diamond uppercase tracking-widest animate-pulse">Cargando Catálogo...</h1>
          </div>
        </section>
        <Footer />
      </main>
    }>
      <CatalogoContent />
    </Suspense>
  )
}
