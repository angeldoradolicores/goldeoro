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
import { useCategories, useProducts } from '@/lib/hooks/use-products'

function CatalogoContent() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')

  // Read search parameters on initial load
  const initialCategory = searchParams.get('category') || 'Todos'
  const initialSort = searchParams.get('sort') || 'featured'

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState(initialSort)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const { categories: adminCategories = [], isLoading: loadingCategories } = useCategories()
  const categoryParam = selectedCategory !== 'Todos' ? selectedCategory : undefined
  const { products, isLoading: loading } = useProducts({ category: categoryParam, search: debouncedSearch, limit: 100 })
  const validCategorySlugs = adminCategories.map((category) => category.slug)
  const router = useRouter()

  useEffect(() => {
    if (loadingCategories) return
    if (selectedCategory !== 'Todos' && !validCategorySlugs.includes(selectedCategory)) {
      setSelectedCategory('Todos')
    }
  }, [selectedCategory, validCategorySlugs, loadingCategories])

  // Listen to searchParams changes to update local state (back/forward button compatibility)
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'Todos'
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }
    const sortParam = searchParams.get('sort') || 'featured'
    if (sortParam !== sortBy) {
      setSortBy(sortParam)
    }
  }, [searchParams])

  // Listen to filter search param changes to automatically update sorting
  useEffect(() => {
    if (filter === 'new') {
      setSortBy('newest')
    } else if (filter === 'bestsellers') {
      setSortBy('featured')
    }
  }, [filter])

  // Debounce search input so we don't flood the API with requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)

    return () => clearTimeout(timer)
  }, [search])

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
    <main className="min-h-screen relative">
      {/* Fondo Fijo Vivo de la Selección Colombia */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80"
          alt="Estadio"
          className="w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116]/90 via-[#003893]/80 to-[#CE1126]/90" />
        {/* Overlay oscuro suave para que el texto y las tarjetas sigan siendo legibles */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Hero */}
        <section className="pt-40 pb-20 relative overflow-hidden border-b border-white/10">
          {/* Tricolor accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1 flex z-10">
            <div className="flex-1 bg-[#FCD116]" />
            <div className="flex-1 bg-[#003893]" />
            <div className="flex-1 bg-[#CE1126]" />
          </div>

          <div className="absolute inset-0 z-0 pointer-events-none">
            <SparklesUI extra={1} />
          </div>

          <div className="container mx-auto px-4 max-w-7xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-graphite/40 border border-gold-action/20 mb-8"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold-action font-sans">
                ⚽ Colección Oficial · Mundial 2026
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
              Camisetas, álbumes Panini, cajas coleccionables y más. <span className="text-gold-action font-normal">Productos oficiales de COLOMBIA y el Mundial 2026</span>.
            </motion.p>
            {/* Colombia tricolor flag indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <div className="flex gap-1">
                <span className="w-5 h-5 rounded-sm bg-[#FCD116] shadow-md" />
                <span className="w-5 h-5 rounded-sm bg-[#003893] shadow-md" />
                <span className="w-5 h-5 rounded-sm bg-[#CE1126] shadow-md" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-titanium font-sans">Selección Colombia</span>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-10 relative z-10">
          <div className="container mx-auto px-4 max-w-7xl">

            {/* Level 1: Category Selector (Desktop) */}
            <div className="hidden lg:flex justify-center items-center mb-8 border-b border-steel/10 pb-4">
              <div className="flex gap-8 items-center relative">
                {([
                  { slug: 'Todos', label: 'Todos' },
                  ...adminCategories.map((c) => ({ slug: c.slug, label: c.name })),
                ]).map(({ slug, label }) => {
                  const isActive = selectedCategory === slug
                  return (
                    <button
                      key={slug}
                      onClick={() => setSelectedCategory(slug)}
                      className="relative py-2 text-xs uppercase tracking-[0.2em] font-sans font-semibold transition-colors duration-300 focus:outline-none cursor-pointer"
                      style={{ color: isActive ? '#DDE8F5' : '#8B8B8B' }}
                    >
                      <span className="hover:text-white-diamond transition-colors duration-200">
                        {label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryUnderline"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-action"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Level 2: Search, Sort, View mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-carbon/40 backdrop-blur-md border border-steel/20 rounded-none shadow-2xl relative"
            >
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-titanium" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar camisetas, álbumes, coleccionables..."
                  className="pl-10 bg-graphite/40 border-steel/20 focus:border-gold-action focus:ring-1 focus:ring-gold-action/30 rounded-none text-sm placeholder-titanium transition-all duration-300"
                />
              </div>

              <div className="flex items-center gap-3 justify-end">
                {/* Mobile Filters Toggle */}
                <Button
                  variant="outline"
                  className="lg:hidden border-steel/30 text-chrome hover:border-gold-action hover:bg-gold-action/5 rounded-none text-xs uppercase tracking-wider font-medium px-4 h-10"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Categorías
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-52 bg-graphite/40 border-steel/20 rounded-none text-xs uppercase tracking-wider font-medium text-chrome focus:border-gold-action h-10">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-graphite border-steel/30 rounded-none text-xs uppercase tracking-wider font-medium text-chrome">
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="newest">Novedades</SelectItem>
                    <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                    <SelectItem value="name">Nombre</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="hidden lg:flex items-center gap-1 p-1 bg-graphite/40 border border-steel/20 h-10">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-all duration-300 rounded-none cursor-pointer ${viewMode === 'grid'
                      ? 'bg-gold-action text-obsidian shadow-lg'
                      : 'text-titanium hover:text-white-diamond'
                      }`}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-all duration-300 rounded-none cursor-pointer ${viewMode === 'list'
                      ? 'bg-gold-action text-obsidian shadow-lg'
                      : 'text-titanium hover:text-white-diamond'
                      }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                    {([
                      { slug: 'Todos', label: 'Todos' },
                      ...adminCategories.map((c) => ({ slug: c.slug, label: c.name })),
                    ]).map(({ slug, label }) => (
                      <Button
                        key={slug}
                        variant={selectedCategory === slug ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(slug)
                          setShowFilters(false)
                        }}
                        className={`${selectedCategory === slug
                          ? 'btn-luxury text-obsidian'
                          : 'border-steel/50 text-chrome hover:border-gold-action/50'
                          } text-xs tracking-wider uppercase font-medium rounded-none`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <div className="mt-6 text-[10px] uppercase tracking-[0.2em] text-titanium font-sans">
              <span className="text-gold-action font-semibold">{filteredProducts.length}</span> {filteredProducts.length !== 1 ? 'productos encontrados' : 'producto encontrado'}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="pb-32">
          <div className="container mx-auto px-4 max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
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
                    ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8'
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
                  No se encontraron productos con ese filtro. Intenta con otra categoría o limpia los filtros.
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
      </div>
    </main>
  )
}

export default function CatalogoPage() {
    return (
      <Suspense fallback={
        <main className="min-h-screen relative">
          <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116]/90 via-[#003893]/80 to-[#CE1126]/90" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <section className="pt-32 pb-16 relative overflow-hidden flex-1 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-display text-white-diamond uppercase tracking-widest animate-pulse">⚽ Cargando Catálogo...</h1>
              </div>
            </section>
            <Footer />
          </div>
        </main>
      }>
        <CatalogoContent />
      </Suspense>
    )
  }
