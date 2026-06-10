'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, User, Crown, LogOut, Heart } from 'lucide-react'
import { useCartStore, useFavoritesStore, useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Colección' },
  { href: '/promociones', label: 'Ofertas' },
  { href: '/pedidos', label: 'Mis Pedidos' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const { user, isAdmin, isInitialized, setUser, setIsAdmin, setInitialized, logout } = useAuthStore()
  const toggleCart = useCartStore(state => state.toggleCart)
  const count = useCartStore(state => state.items.reduce((acc, i) => acc + (i.quantity || 0), 0))
  const favoritesCount = useFavoritesStore(state => state.items.length)

  const handleFavorites = () => {
    if (!user) {
      router.push('/auth/login?redirect=/catalogo')
      return
    }
    router.push('/perfil?tab=favoritos')
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const initAuth = async () => {
      if (isInitialized) return

      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user ?? null
      if (!user) {
        const { data: { user: fallbackUser } } = await supabase.auth.getUser()
        user = fallbackUser ?? null
      }
      setUser(user)

      if (user) {
        useCartStore.getState().setUserId(user.id)
        useFavoritesStore.getState().setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
        setIsAdmin(profile?.is_admin || false)
        useCartStore.getState().syncCart(user.id)
        useFavoritesStore.getState().syncFavorites(user.id)
      } else {
        useCartStore.getState().setUserId(null)
        useFavoritesStore.getState().setUserId(null)
        useCartStore.getState().hydrateCart()
        useFavoritesStore.getState().hydrateFavorites()
      }

      setInitialized(true)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null
      setUser(user)
      if (!user) {
        setIsAdmin(false)
        useCartStore.getState().setUserId(null)
        useCartStore.getState().clearCart()
        useFavoritesStore.getState().setUserId(null)
        useFavoritesStore.getState().clearFavorites()
      } else {
        useCartStore.getState().setUserId(user.id)
        useFavoritesStore.getState().setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
        setIsAdmin(profile?.is_admin || false)
        useCartStore.getState().syncCart(user.id)
        useFavoritesStore.getState().syncFavorites(user.id)
      }
      setInitialized(true)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setIsAdmin, setInitialized])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-carbon/95 backdrop-blur-2xl border-b border-steel/50 py-3 shadow-[0_4px_32px_rgba(0,0,0,0.6)]'
            : 'bg-transparent py-5'
        }`}
        style={{ backgroundColor: isScrolled ? 'rgba(13,13,13,0.96)' : 'transparent' }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between">

            {/* ── Logo ──────────────────────────────── */}
            <Link href="/" className="relative z-10 group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col"
              >
                <span
                  className="text-xl md:text-2xl font-black tracking-[0.22em] text-white-diamond uppercase"
                  style={{ fontFamily: 'var(--font-cinzel), serif', letterSpacing: '0.22em' }}
                >
                  URBAN CROWN
                </span>
                <span
                  className="text-[9px] tracking-[0.5em] uppercase mt-0.5 text-chrome"
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.45em' }}
                >
                  Luxury Streetwear
                </span>
                {/* Silver underline on hover */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-chrome to-transparent mt-1"
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </Link>

            {/* ── Desktop Nav ─────────────────────── */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    className="relative text-xs font-semibold text-titanium hover:text-white-diamond transition-colors duration-300 uppercase tracking-[0.15em]"
                    style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.15em' }}
                    whileHover={{ y: -1, textShadow: '0 0 18px rgba(221,232,245,0.25)' }}
                  >
                    {link.label}
                    <motion.span
                      className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-chrome via-white-diamond to-chrome"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.span>
                </Link>
              ))}
            </div>

            {/* ── Actions ─────────────────────────── */}
            <div className="flex items-center gap-4">

              {user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link href="/admin">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] border border-steel text-titanium hover:border-chrome hover:text-white-diamond rounded-sm transition-all duration-300"
                        style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.15em' }}
                      >
                        <Crown className="w-3 h-3" />
                        Admin
                      </motion.button>
                    </Link>
                  )}
                  <Link href="/perfil">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      className="p-2 text-titanium hover:text-white-diamond transition-colors duration-300"
                    >
                      <User className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] border border-steel text-titanium hover:border-chrome hover:text-white-diamond rounded-sm transition-all duration-300"
                    style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.15em' }}
                  >
                    <User className="w-3.5 h-3.5" />
                    Ingresar
                  </motion.button>
                </Link>
              )}

              {/* Favorites */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleFavorites}
                className="relative p-2 text-titanium hover:text-white-diamond transition-colors duration-300"
              >
                <Heart style={{ width: '18px', height: '18px' }} />
                <AnimatePresence>
                  {favoritesCount > 0 && (
                    <motion.span
                      key="fav-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,0,0,1), rgba(220,0,0,0.9))',
                        color: '#ffffff',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {favoritesCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Cart */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleCart}
                className="relative p-2 text-titanium hover:text-white-diamond transition-colors duration-300"
              >
                <ShoppingBag style={{ width: '18px', height: '18px' }} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(221,232,245,1), rgba(185,195,212,0.9))',
                        color: '#050505',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Mobile Menu Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-titanium hover:text-white-diamond hover:bg-steel/30"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ── Mobile Menu ───────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(8px)' }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm flex flex-col"
              style={{
                background: '#0D0D0D',
                borderLeft: '1px solid #262626',
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-steel">
                <div className="flex flex-col">
                  <span
                    className="text-base font-black tracking-[0.2em] text-white-diamond"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                  >
                    URBAN CROWN
                  </span>
                  <span className="text-[9px] tracking-[0.4em] text-chrome mt-0.5 uppercase"
                    style={{ fontFamily: 'var(--font-sans)' }}>
                    Luxury Streetwear
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-titanium hover:text-white-diamond"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Links */}
              <div className="flex-1 flex flex-col justify-center px-6 gap-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-4 text-sm font-semibold uppercase tracking-[0.2em] text-titanium hover:text-white-diamond transition-colors border-b border-steel/40"
                      style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.2em' }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {user && isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.07 }}
                    className="pt-6"
                  >
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] border border-chrome text-chrome hover:bg-chrome hover:text-obsidian transition-all duration-300 rounded-sm"
                        style={{ fontFamily: 'var(--font-sans)' }}>
                        <Crown className="w-3.5 h-3.5 inline mr-2" />
                        Panel Admin
                      </button>
                    </Link>
                  </motion.div>
                )}

                {!user && (
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.07 }}
                    className="pt-6"
                  >
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full py-3.5 text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-chrome/80 to-steel/70 text-obsidian rounded-sm transition-all duration-300"
                        style={{ fontFamily: 'var(--font-sans)' }}>
                        <User className="w-3.5 h-3.5 inline mr-2" />
                        Ingresar
                      </button>
                    </Link>
                  </motion.div>
                )}

                {user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-2"
                  >
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false) }}
                      className="flex items-center gap-2 text-xs text-titanium hover:text-white-diamond transition-colors py-3 uppercase tracking-[0.15em]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer mobile */}
              <div className="p-6 border-t border-steel/40">
                <p className="text-[10px] text-steel tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                  © 2026 Urban Crown
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
