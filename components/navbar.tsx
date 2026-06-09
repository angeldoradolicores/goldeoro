'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, User, Search, Crown, Sparkles, LogOut } from 'lucide-react'
import { useCartStore, useFavoritesStore, useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catalogo' },
  { href: '/promociones', label: 'Ofertas' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const { user, isAdmin, isInitialized, setUser, setIsAdmin, setInitialized, logout } = useAuthStore()
  const { toggleCart, itemCount, clearCart } = useCartStore()
  const count = itemCount()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    
    const getUser = async () => {
      if (isInitialized) return // Skip if we already checked auth
      
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
        
        setIsAdmin(profile?.is_admin || false)
        
        // Sync cart and favorites on load
        useCartStore.getState().syncCart()
        useFavoritesStore.getState().syncFavorites()
      }
      setInitialized(true)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      if (!session?.user) {
        setIsAdmin(false)
        useCartStore.getState().clearCart()
        useFavoritesStore.getState().clearFavorites()
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .maybeSingle()
        
        setIsAdmin(profile?.is_admin || false)
        
        // Sync/load cart and favorites
        useCartStore.getState().syncCart()
        useFavoritesStore.getState().syncFavorites()
      }
      setInitialized(true)
    })

    return () => subscription.unsubscribe()
  }, [isInitialized, setUser, setIsAdmin, setInitialized])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="relative z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative"
                >
                  <Crown className="w-8 h-8 text-neon-pink" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-3 h-3 text-neon-yellow" />
                  </motion.div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black text-gradient-neon tracking-tight">
                    URBAN CROWN
                  </span>
                  <span className="text-[10px] tracking-[0.3em] text-gold -mt-1 uppercase font-semibold">
                    Luxury Streetwear
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    className="relative text-sm font-semibold text-foreground/80 hover:text-primary transition-colors uppercase tracking-wide"
                    whileHover={{ y: -2 }}
                  >
                    {link.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-neon-pink to-neon-cyan"
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-foreground/80 hover:text-neon-cyan transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link href="/admin">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-neon-pink/20 text-neon-pink rounded-full border border-neon-pink/30 hover:bg-neon-pink/30 transition-colors"
                      >
                        <Crown className="w-3 h-3" />
                        Admin
                      </motion.button>
                    </Link>
                  )}
                  <Link href="/perfil">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-neon-green hover:text-neon-cyan transition-colors"
                    >
                      <User className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider bg-neon-pink/10 text-neon-pink rounded-full border border-neon-pink/40 hover:bg-neon-pink/20 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Ingresar
                  </motion.button>
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCart}
                className="relative p-2 text-foreground/80 hover:text-neon-pink transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-neon-pink text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center glow-pink"
                  >
                    {count}
                  </motion.span>
                )}
              </motion.button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-card border-l border-border/50 p-6 graffiti-bg"
            >
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-neon-pink" />
                  <span className="text-xl font-black text-gradient-neon">
                    URBAN CROWN
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-4 text-lg font-bold uppercase tracking-wider text-foreground/80 hover:text-neon-pink transition-colors border-b border-border/30"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                {user && isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="pt-4"
                  >
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full btn-luxury py-6">
                        <Crown className="w-4 h-4 mr-2" />
                        Panel Admin
                      </Button>
                    </Link>
                  </motion.div>
                )}

                {!user && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="pt-4"
                  >
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full btn-neon-cyan py-6">
                        <User className="w-4 h-4 mr-2" />
                        Ingresar
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
