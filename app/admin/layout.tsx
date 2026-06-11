'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/store'

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/categorias', label: 'Categorías', icon: Settings },
  { href: '/admin/configuracion', label: 'Configuracion', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [bellRing, setBellRing] = useState(false)
  const [isAdminVerified, setIsAdminVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const isAdmin = useAuthStore(state => state.isAdmin)
  const user = useAuthStore(state => state.user)

  // Verify admin status on mount
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const supabase = createClient()
        
        // First check auth store
        if (isAdmin && user) {
          setIsAdminVerified(true)
          setIsLoading(false)
          return
        }

        // If not in store, verify with server
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push(`/auth/login?redirect=${pathname}`)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', authUser.id)
          .maybeSingle()

        if (!profile?.is_admin) {
          router.push('/?unauthorized=1')
          return
        }

        useAuthStore.getState().setUser(authUser as any)
        useAuthStore.getState().setIsAdmin(true)
        setIsAdminVerified(true)
      } catch (err) {
        console.error('[admin layout] Verification error:', err)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    verifyAdmin()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    // Fetch initial pending count
    const fetchPending = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      if (mounted && count !== null) {
        setPendingCount(count)
      }
    }
    fetchPending()

    // Subscribe to real-time inserts on orders table
    const channel = supabase
      .channel('admin-orders-bell')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (!mounted) return
          if (payload.new?.status === 'pending') {
            setPendingCount((prev) => prev + 1)
            // Ring animation
            setBellRing(true)
            setTimeout(() => setBellRing(false), 1000)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          if (mounted) fetchPending()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  // Show loading state while verifying admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // If not admin verified, don't render
  if (!isAdminVerified) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex flex-col">
            <span className="text-2xl font-display font-bold text-gradient-gold tracking-wider">
              LUXURY
            </span>
            <span className="text-xs tracking-[0.4em] text-muted-foreground -mt-1">
              HATS ADMIN
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">admin@luxuryhats.co</p>
            </div>
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <Link href="/" className="flex flex-col">
                  <span className="text-xl font-display font-bold text-gradient-gold">LUXURY</span>
                  <span className="text-xs tracking-[0.3em] text-muted-foreground -mt-1">HATS ADMIN</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}>
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary'
                      }`}>
                        <link.icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="pl-9 w-64 bg-secondary/50 border-border/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Bell with real-time pending count */}
            <Link href="/admin/pedidos">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title={`${pendingCount} pedido(s) pendiente(s)`}
              >
                <motion.div
                  animate={bellRing ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
                {pendingCount > 0 && (
                  <motion.span
                    key={pendingCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </motion.span>
                )}
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">AD</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
