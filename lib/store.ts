import { create } from 'zustand'
import { createClient } from './supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Product interface for database format
export interface Product {
  id: string
  name: string
  slug?: string
  description: string
  price: number
  original_price?: number | null
  originalPrice?: number
  images: string[]
  videos?: string[]
  video?: string
  category: string
  colors: string[]
  sizes: string[]
  stock: number
  featured: boolean
  is_promotion?: boolean
  isPromotion?: boolean
  created_at?: string
  createdAt?: Date
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedColor: string
  selectedSize: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAdmin: boolean
}

function getCartStorageKey(userId: string | null = null) {
  return userId ? `urban-crown-cart-${userId}` : 'urban-crown-cart-guest'
}

function getFavoritesStorageKey(userId: string | null = null) {
  return userId ? `urban-crown-favorites-${userId}` : 'urban-crown-favorites-guest'
}

function createCartItemId(productId: string, color: string, size: string) {
  return `${productId}::${color || 'default'}::${size || 'default'}`
}

function loadLocalCart(userId: string | null = null): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(getCartStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalCart(items: CartItem[], userId: string | null = null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getCartStorageKey(userId), JSON.stringify(items))
  } catch {}
}

function loadLocalFavorites(userId: string | null = null): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(getFavoritesStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalFavorites(items: Product[], userId: string | null = null) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(getFavoritesStorageKey(userId), JSON.stringify(items))
  } catch {}
}

interface CartStore {
  userId: string | null
  items: CartItem[]
  isOpen: boolean
  hydrateCart: (userId?: string | null) => void
  setUserId: (userId: string | null) => void
  addItem: (product: Product, color: string, size: string, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  total: () => number
  itemCount: () => number
  syncCart: (userId?: string | null) => Promise<void>
}

interface ChatStore {
  isOpen: boolean
  messages: { role: 'user' | 'bot'; content: string; timestamp: Date }[]
  toggleChat: () => void
  setChatOpen: (open: boolean) => void
  addMessage: (role: 'user' | 'bot', content: string) => void
  clearMessages: () => void
}

interface FavoritesStore {
  userId: string | null
  items: Product[]
  hydrateFavorites: (userId?: string | null) => void
  setUserId: (userId: string | null) => void
  toggleFavorite: (product: Product) => Promise<void>
  isFavorite: (productId: string) => boolean
  syncFavorites: (userId?: string | null) => Promise<void>
  clearFavorites: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  userId: null,
  items: [],
  isOpen: false,
  hydrateCart: (userId = get().userId) => {
    const items = loadLocalCart(userId ?? null)
    set({ items })
  },
  setUserId: (userId) => {
    const previousUserId = get().userId
    if (previousUserId === userId) {
      set({ userId })
      return
    }

    // switching to an authenticated user: merge guest cart into user cart
    if (userId) {
      const guestItems = loadLocalCart(null)
      const userItems = loadLocalCart(userId)

      const map = new Map<string, CartItem>()
      userItems.forEach(i => map.set(i.id, { ...i }))
      guestItems.forEach(i => {
        const existing = map.get(i.id)
        if (existing) {
          map.set(i.id, { ...existing, quantity: existing.quantity + i.quantity })
        } else {
          map.set(i.id, { ...i })
        }
      })

      const merged = Array.from(map.values())
      set({ userId, items: merged })
      saveLocalCart(merged, userId)

      // persist merged items to DB asynchronously
      const supabase = createClient()
      merged.forEach(item => {
        supabase.from('cart_items').upsert({
          user_id: userId,
          product_id: item.product.id,
          quantity: item.quantity,
          selected_color: item.selectedColor,
          selected_size: item.selectedSize,
        }, { onConflict: 'user_id,product_id,selected_color,selected_size' }).then(({ error }) => {
          if (error) console.error('Error upserting merged cart item:', error.message)
        })
      })
      return
    }

    // switching to guest (logout)
    const guest = loadLocalCart(null)
    set({ userId: null, items: guest })
  },
  addItem: (product, color, size, quantity = 1) => {
    const itemId = createCartItemId(product.id, color, size)
    const existingItem = get().items.find((i) => i.id === itemId)
    const newItems = existingItem
      ? get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        )
      : [...get().items, { id: itemId, product, quantity, selectedColor: color, selectedSize: size }]

    let currentUserId = get().userId
    set({ items: newItems, isOpen: true })
    saveLocalCart(newItems, currentUserId)

    const supabase = createClient()
    const persistUpsert = async (uid: string | null) => {
      if (!uid) return
      const item = newItems.find((i) => i.id === itemId)
      if (!item) return
      
      const { error } = await supabase.from('cart_items').upsert({
        user_id: uid,
        product_id: product.id,
        quantity: item.quantity,
        selected_color: color,
        selected_size: size,
      }, {
        onConflict: 'user_id,product_id,selected_color,selected_size',
      })
      
      if (error) console.error('Error syncing cart item upsert:', error.message)
    }

    // Try to persist immediately if we have userId
    if (currentUserId) {
      persistUpsert(currentUserId)
    } else {
      // No userId yet, try to get session/user
      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = session?.user?.id ?? null
        if (uid) {
          set({ userId: uid })
          saveLocalCart(newItems, uid)
        }
        persistUpsert(uid)
      }).catch(() => {
        // Last resort: try getUser if getSession fails
        supabase.auth.getUser().then(({ data: { user } }) => {
          const uid = user?.id ?? null
          if (uid) {
            set({ userId: uid })
            saveLocalCart(newItems, uid)
          }
          persistUpsert(uid)
        }).catch(() => {})
      })
    }
  },
  removeItem: (itemId) => {
    const itemToRemove = get().items.find((i) => i.id === itemId)
    const newItems = get().items.filter((i) => i.id !== itemId)
    set({ items: newItems })
    saveLocalCart(newItems, get().userId)

    if (!itemToRemove) return
    let currentUserId = get().userId
    const supabase = createClient()
    const persistDelete = async (uid: string | null) => {
      if (!uid) return
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', uid)
        .eq('product_id', itemToRemove.product.id)
        .eq('selected_color', itemToRemove.selectedColor)
        .eq('selected_size', itemToRemove.selectedSize)
      if (error) console.error('Error syncing cart item removal:', error.message)
    }

    if (currentUserId) {
      persistDelete(currentUserId)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = session?.user?.id ?? null
        if (uid) set({ userId: uid })
        persistDelete(uid)
      }).catch(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          const uid = user?.id ?? null
          if (uid) set({ userId: uid })
          persistDelete(uid)
        }).catch(() => {})
      })
    }
  },
  updateQuantity: (itemId, quantity) => {
    const itemToUpdate = get().items.find((i) => i.id === itemId)
    const newItems = quantity === 0
      ? get().items.filter((i) => i.id !== itemId)
      : get().items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        )
    set({ items: newItems })
    saveLocalCart(newItems, get().userId)

    if (!itemToUpdate) return
    let currentUserId = get().userId
    const supabase = createClient()
    const persistUpdate = async (uid: string | null) => {
      if (!uid) return
      if (quantity === 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', uid)
          .eq('product_id', itemToUpdate.product.id)
          .eq('selected_color', itemToUpdate.selectedColor)
          .eq('selected_size', itemToUpdate.selectedSize)
        if (error) console.error('Error syncing cart item removal:', error.message)
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', uid)
          .eq('product_id', itemToUpdate.product.id)
          .eq('selected_color', itemToUpdate.selectedColor)
          .eq('selected_size', itemToUpdate.selectedSize)
        if (error) console.error('Error syncing cart item quantity:', error.message)
      }
    }

    if (currentUserId) {
      persistUpdate(currentUserId)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = session?.user?.id ?? null
        if (uid) set({ userId: uid })
        persistUpdate(uid)
      }).catch(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          const uid = user?.id ?? null
          if (uid) set({ userId: uid })
          persistUpdate(uid)
        }).catch(() => {})
      })
    }
  },
  clearCart: () => {
    set({ items: [] })
    let currentUserId = get().userId
    saveLocalCart([], currentUserId)
    const supabase = createClient()
    const persistClear = async (uid: string | null) => {
      if (!uid) return
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', uid)
      if (error) console.error('Error clearing cart in DB:', error.message)
    }

    if (currentUserId) {
      persistClear(currentUserId)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const uid = session?.user?.id ?? null
        if (uid) set({ userId: uid })
        persistClear(uid)
      }).catch(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          const uid = user?.id ?? null
          if (uid) set({ userId: uid })
          persistClear(uid)
        }).catch(() => {})
      })
    }
  },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
  total: () => get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  syncCart: async (userId?: string | null) => {
    const supabase = createClient()
    let currentUserId: string | null = userId ?? null

    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession()
      currentUserId = session?.user?.id ?? null
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id ?? null
      }
    }

    if (!currentUserId) return
    set({ userId: currentUserId })

    const { data: dbItems, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        selected_color,
        selected_size,
        product:products(*)
      `)
      .eq('user_id', currentUserId)

    if (error) {
      console.warn('Cart sync skipped (run supabase-missing-tables.sql):', error.message)
      return
    }

    const localItems = get().items
    const mergedMap = new Map<string, CartItem>()

    if (dbItems) {
      dbItems
        .filter((item: any) => item.product)
        .map((item: any) => ({
          id: createCartItemId(item.product.id, item.selected_color, item.selected_size),
          product: {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            description: item.product.description,
            price: item.product.price,
            original_price: item.product.original_price,
            images: item.product.images || [],
            category: item.product.category || 'Premium',
            colors: item.product.colors || [],
            sizes: item.product.sizes || [],
            stock: item.product.stock || 0,
            featured: item.product.featured || false,
          } as Product,
          quantity: item.quantity,
          selectedColor: item.selected_color,
          selectedSize: item.selected_size,
        }))
        .forEach((item: CartItem) => mergedMap.set(item.id, item))
    }

    localItems.forEach((item) => {
      mergedMap.set(item.id, item)
    })

    const merged = Array.from(mergedMap.values())
    set({ items: merged })
    saveLocalCart(merged, currentUserId)

    merged.forEach((item) => {
      supabase.from('cart_items').upsert({
        user_id: currentUserId,
        product_id: item.product.id,
        quantity: item.quantity,
        selected_color: item.selectedColor,
        selected_size: item.selectedSize,
      }, {
        onConflict: 'user_id,product_id,selected_color,selected_size',
      }).then(({ error }) => {
        if (error) console.error('Error syncing merged cart item:', error.message)
      })
    })
  }
}))

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  userId: null,
  items: [],
  hydrateFavorites: (userId = get().userId) => {
    const items = loadLocalFavorites(userId ?? null)
    set({ items })
  },
  setUserId: (userId) => {
    const currentUserId = get().userId
    if (currentUserId === userId) {
      set({ userId })
      return
    }

    const previousUserId = get().userId
    if (previousUserId === userId) {
      set({ userId })
      return
    }

    if (userId) {
      const guestFavs = loadLocalFavorites(null)
      const userFavs = loadLocalFavorites(userId)

      const map = new Map<string, Product>()
      userFavs.forEach(f => map.set(f.id, { ...f }))
      guestFavs.forEach(f => {
        if (!map.has(f.id)) map.set(f.id, { ...f })
      })

      const merged = Array.from(map.values())
      set({ userId, items: merged })
      saveLocalFavorites(merged, userId)

      // persist merged favorites to DB asynchronously
      const supabase = createClient()
      merged.forEach(product => {
        supabase.from('favorites').upsert({ user_id: userId, product_id: product.id }, { onConflict: 'user_id,product_id' }).then(({ error }) => {
          if (error) console.warn('Error upserting merged favorite:', error.message)
        })
      })
      return
    }

    const guest = loadLocalFavorites(null)
    set({ userId: null, items: guest })
  },
  toggleFavorite: async (product) => {
    const supabase = createClient()
    const isFav = get().isFavorite(product.id)
    let currentUserId = get().userId
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession()
      currentUserId = session?.user?.id || null
      if (!currentUserId) {
        // Fallback to getUser
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id ?? null
      }
      if (currentUserId) set({ userId: currentUserId })
    }
    let newItems: Product[] = []

    if (isFav) {
      newItems = get().items.filter(item => item.id !== product.id)
      set({ items: newItems })
      saveLocalFavorites(newItems, currentUserId)
      if (currentUserId) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('product_id', product.id)
        if (error) console.warn('Favorites delete error (table may not exist yet):', error.message)
      }
    } else {
      newItems = [...get().items, product]
      set({ items: newItems })
      saveLocalFavorites(newItems, currentUserId)
      if (currentUserId) {
        const { error } = await supabase
          .from('favorites')
          .upsert({
            user_id: currentUserId,
            product_id: product.id,
          }, { onConflict: 'user_id,product_id' })
        if (error) console.warn('Favorites upsert error (table may not exist yet):', error.message)
      }
    }
  },
  isFavorite: (productId) => {
    return get().items.some(item => item.id === productId)
  },
  syncFavorites: async (userId?: string | null) => {
    const supabase = createClient()
    let currentUserId: string | null = userId ?? null

    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession()
      currentUserId = session?.user?.id ?? null
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        currentUserId = user?.id ?? null
      }
    }

    if (!currentUserId) return
    set({ userId: currentUserId })

    const { data: dbFavs, error } = await supabase
      .from('favorites')
      .select('product:products(*)')
      .eq('user_id', currentUserId)

    if (error) {
      console.warn('Favorites sync skipped (run supabase-missing-tables.sql):', error.message)
      return
    }

    const localItems = get().items
    const mergedMap = new Map<string, Product>()

    if (dbFavs) {
      dbFavs
        .filter((f: any) => f.product)
        .map((f: any) => ({
          id: f.product.id,
          name: f.product.name,
          slug: f.product.slug,
          description: f.product.description,
          price: f.product.price,
          original_price: f.product.original_price,
          images: f.product.images || [],
          category: f.product.category || 'Premium',
          colors: f.product.colors || [],
          sizes: f.product.sizes || [],
          stock: f.product.stock || 0,
          featured: f.product.featured || false,
        } as Product))
        .forEach((item: Product) => mergedMap.set(item.id, item))
    }

    localItems.forEach((item) => mergedMap.set(item.id, item))

    const merged = Array.from(mergedMap.values())
    set({ items: merged })
    saveLocalFavorites(merged, currentUserId)

    merged.forEach((product) => {
      supabase.from('favorites').upsert({ user_id: currentUserId, product_id: product.id }, { onConflict: 'user_id,product_id' }).then(({ error }) => {
        if (error) console.warn('Error syncing merged favorite:', error.message)
      })
    })
  },
  clearFavorites: () => {
    saveLocalFavorites([], get().userId)
    set({ items: [] })
  }
}))

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  messages: [],
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  setChatOpen: (open) => set({ isOpen: open }),
  addMessage: (role, content) => set((state) => ({
    messages: [...state.messages, { role, content, timestamp: new Date() }],
  })),
  clearMessages: () => set({ messages: [] }),
}))

interface AuthStore {
  user: SupabaseUser | null
  isAdmin: boolean
  isInitialized: boolean
  setUser: (user: SupabaseUser | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setInitialized: (initialized: boolean) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAdmin: false,
  isInitialized: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  logout: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false })
    useCartStore.getState().clearCart()
    useCartStore.getState().setUserId(null)
    useCartStore.getState().hydrateCart(null)
    useFavoritesStore.getState().clearFavorites()
    useFavoritesStore.getState().setUserId(null)
    useFavoritesStore.getState().hydrateFavorites(null)
  }
}))

// Mock products for frontend demo
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Crown Elite Black',
    slug: 'crown-elite-black',
    description: 'Gorra premium de edicion limitada con bordado en oro de 24k. Confeccionada en algodon egipcio de la mas alta calidad con acabados de lujo.',
    price: 289000,
    original_price: 350000,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800&q=80',
    ],
    category: 'Premium',
    colors: ['Negro', 'Dorado', 'Blanco'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    featured: true,
    is_promotion: true,
  },
  {
    id: '2',
    name: 'Urban Legend',
    slug: 'urban-legend',
    description: 'Diseno urbano exclusivo con detalles reflectivos y cierre ajustable de metal. Perfecta para el streetwear de alto nivel.',
    price: 199000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&q=80',
    ],
    category: 'Urban',
    colors: ['Negro', 'Gris', 'Azul'],
    sizes: ['M', 'L', 'XL'],
    stock: 23,
    featured: true,
    is_promotion: false,
  },
  {
    id: '3',
    name: 'Medellin Heat',
    slug: 'medellin-heat',
    description: 'Inspirada en las calles de Medellin. Colores vibrantes y diseno unico que representa la cultura paisa.',
    price: 175000,
    original_price: 220000,
    images: [
      'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&q=80',
    ],
    category: 'Urban',
    colors: ['Rojo', 'Negro', 'Blanco'],
    sizes: ['S', 'M', 'L'],
    stock: 8,
    featured: true,
    is_promotion: true,
  },
  {
    id: '4',
    name: 'Street Graffiti',
    slug: 'street-graffiti',
    description: 'Arte urbano en tu cabeza. Cada gorra es una pieza unica con grafitis originales de artistas locales.',
    price: 245000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1529025530948-67e8a5f2179c?w=800&q=80',
      'https://images.unsplash.com/photo-1555487505-8603a1a69755?w=800&q=80',
    ],
    category: 'Streetwear',
    colors: ['Multicolor', 'Negro', 'Blanco'],
    sizes: ['M', 'L', 'XL'],
    stock: 12,
    featured: true,
    is_promotion: false,
  },
  {
    id: '5',
    name: 'Neon Nights',
    slug: 'neon-nights',
    description: 'Brilla en la oscuridad. Detalles neon que te hacen destacar en cualquier fiesta o evento nocturno.',
    price: 159000,
    original_price: 199000,
    images: [
      'https://images.unsplash.com/photo-1517941823-815bea90d291?w=800&q=80',
      'https://images.unsplash.com/photo-1516442423278-18a8d30c5b5c?w=800&q=80',
    ],
    category: 'Urban',
    colors: ['Rosa', 'Verde', 'Azul'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 30,
    featured: false,
    is_promotion: true,
  },
  {
    id: '6',
    name: 'Classic Heritage',
    slug: 'classic-heritage',
    description: 'La tradicion colombiana en una gorra. Materiales premium y bordados tradicionales que cuentan historias.',
    price: 320000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&q=80',
      'https://images.unsplash.com/photo-1581795669633-91ef7c9699a8?w=800&q=80',
    ],
    category: 'Premium',
    colors: ['Negro', 'Cafe', 'Beige'],
    sizes: ['M', 'L', 'XL'],
    stock: 5,
    featured: false,
    is_promotion: false,
  },
]
