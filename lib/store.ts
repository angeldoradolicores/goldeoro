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
  sizes_stock?: Record<string, number>
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
  return userId ? `gol-de-oro-cart-${userId}` : 'gol-de-oro-cart-guest'
}

function getFavoritesStorageKey(userId: string | null = null) {
  return userId ? `gol-de-oro-favorites-${userId}` : 'gol-de-oro-favorites-guest'
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
  syncCartFromServer: () => Promise<void>
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
  syncFavoritesFromServer: () => Promise<void>
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
    console.log('[setUserId] Switching from', previousUserId, 'to', userId)
    
    if (previousUserId === userId) {
      set({ userId })
      return
    }

    // switching to an authenticated user: merge guest cart into user cart
    if (userId) {
      const guestItems = loadLocalCart(null)
      const userItems = loadLocalCart(userId)
      
      console.log('[setUserId] Guest items:', guestItems.length, 'User items:', userItems.length)

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
      console.log('[setUserId] Merged to', merged.length, 'items')
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
    console.log('[setUserId] Logout - keeping', guest.length, 'guest items')
    set({ userId: null, items: guest })
  },
  addItem: (product, color, size, quantity = 1) => {
    const itemId = createCartItemId(product.id, color, size)
    const existingItem = get().items.find((i) => i.id === itemId)
    
    const sizeStock = size && product.sizes_stock
      ? (product.sizes_stock[size] ?? 0)
      : (product.stock ?? 0)

    const currentQty = existingItem ? existingItem.quantity : 0
    const finalQty = Math.max(0, Math.min(currentQty + quantity, sizeStock))

    const newItems = existingItem
      ? get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: finalQty } : i
        )
      : [...get().items, { id: itemId, product, quantity: finalQty, selectedColor: color, selectedSize: size }]

    let currentUserId = get().userId
    set({ items: newItems, isOpen: true })
    saveLocalCart(newItems, currentUserId)

    const item = newItems.find((i) => i.id === itemId)
    if (!item) return

    const persistViaAPI = async (uid: string | null) => {
      if (!uid) return
      try {
        console.log('[addItem] Persisting to API for user:', uid)
        const res = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            quantity: item.quantity,
            selected_color: color || null,
            selected_size: size || null,
          }),
        })
        if (!res.ok) {
          const text = await res.text()
          console.error('[addItem] Error syncing cart item:', res.statusText, text)
        } else {
          console.log('[addItem] Successfully synced cart item')
        }
      } catch (err) {
        console.error('[addItem] Error syncing cart item:', err)
      }
    }

    if (currentUserId) {
      persistViaAPI(currentUserId)
    } else {
      console.log('[addItem] No userId, attempting syncCartFromServer')
      // If no userId, try to sync from server first
      get().syncCartFromServer().then(() => {
        const uid = get().userId
        if (uid) {
          console.log('[addItem] Got userId after sync:', uid)
          persistViaAPI(uid)
        } else {
          console.log('[addItem] Still no userId after sync')
        }
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

    const persistViaAPI = async (uid: string | null) => {
      if (!uid) return
      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: itemToRemove.product.id,
            selected_color: itemToRemove.selectedColor || null,
            selected_size: itemToRemove.selectedSize || null,
          }),
        })
        if (!res.ok) console.error('Error syncing cart item removal:', res.statusText)
      } catch (err) {
        console.error('Error syncing cart item removal:', err)
      }
    }

    if (currentUserId) {
      persistViaAPI(currentUserId)
    } else {
      // If no userId, try to sync from server first
      get().syncCartFromServer().then(() => {
        const uid = get().userId
        if (uid) {
          persistViaAPI(uid)
        }
      })
    }
  },
  updateQuantity: (itemId, quantity) => {
    const itemToUpdate = get().items.find((i) => i.id === itemId)
    if (!itemToUpdate) return

    const sizeStock = itemToUpdate.selectedSize && itemToUpdate.product.sizes_stock
      ? (itemToUpdate.product.sizes_stock[itemToUpdate.selectedSize] ?? 0)
      : (itemToUpdate.product.stock ?? 0)

    const clampedQuantity = Math.max(0, Math.min(quantity, sizeStock))
    const newItems = clampedQuantity === 0
      ? get().items.filter((i) => i.id !== itemId)
      : get().items.map((i) =>
          i.id === itemId ? { ...i, quantity: clampedQuantity } : i
        )
    set({ items: newItems })
    saveLocalCart(newItems, get().userId)
    let currentUserId = get().userId

    const persistViaAPI = async (uid: string | null) => {
      if (!uid) return
      try {
        if (quantity === 0) {
          const res = await fetch('/api/cart', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: itemToUpdate.product.id,
              selected_color: itemToUpdate.selectedColor || null,
              selected_size: itemToUpdate.selectedSize || null,
            }),
          })
          if (!res.ok) console.error('Error syncing cart item removal:', res.statusText)
        } else {
          const res = await fetch('/api/cart', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: itemToUpdate.product.id,
              quantity,
              selected_color: itemToUpdate.selectedColor || null,
              selected_size: itemToUpdate.selectedSize || null,
            }),
          })
          if (!res.ok) console.error('Error syncing cart item quantity:', res.statusText)
        }
      } catch (err) {
        console.error('Error syncing cart item:', err)
      }
    }

    if (currentUserId) {
      persistViaAPI(currentUserId)
    } else {
      // If no userId, try to sync from server first
      get().syncCartFromServer().then(() => {
        const uid = get().userId
        if (uid) {
          persistViaAPI(uid)
        }
      })
    }
  },
  clearCart: () => {
    set({ items: [] })
    let currentUserId = get().userId
    saveLocalCart([], currentUserId)

    const persistViaAPI = async (uid: string | null) => {
      if (!uid) return
      try {
        const res = await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clear_all: true }),
        })
        // 401 during logout is expected - session may have already ended
        if (!res.ok && res.status !== 401) {
          const text = await res.text()
          console.error('Error clearing cart in DB:', text)
        }
      } catch (err) {
        console.error('Error clearing cart:', err)
      }
    }

    if (currentUserId) {
      persistViaAPI(currentUserId)
    } else {
      // If no userId, try to sync from server first
      get().syncCartFromServer().then(() => {
        const uid = get().userId
        if (uid) {
          persistViaAPI(uid)
        }
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
        product:products(*, product_images(url, is_primary, sort_order))
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
        .map((item: any) => {
          const sortedImages = (item.product.product_images || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => img.url)

          return {
            id: createCartItemId(item.product.id, item.selected_color, item.selected_size),
            product: {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              description: item.product.description,
              price: item.product.price,
              original_price: item.product.original_price,
              images: sortedImages.length > 0 ? sortedImages : ['/images/placeholder-hat.jpg'],
              category: item.product.category || 'Premium',
              colors: item.product.colors || [],
              sizes: item.product.sizes || [],
              sizes_stock: item.product.sizes_stock || {},
              stock: item.product.stock || 0,
              featured: item.product.featured || false,
            } as Product,
            quantity: item.quantity,
            selectedColor: item.selected_color,
            selectedSize: item.selected_size,
          }
        })
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
  },
  // Loads cart via server API route — bypasses client JWT timing issues on Vercel
  syncCartFromServer: async () => {
    try {
      console.log('[syncCartFromServer] Starting sync')
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (!res.ok) {
        console.error('[syncCartFromServer] Response not ok:', res.status)
        return
      }
      const data = await res.json()
      const serverItems: CartItem[] = data.items ?? []
      const userId: string | null = data.userId ?? null

      console.log('[syncCartFromServer] Got', serverItems.length, 'items from server for user:', userId)

      if (userId) {
        set({ userId })
        const guestItems = get().items
        const mergedMap = new Map<string, CartItem>()
        // Server items (real persisted cart) take precedence
        serverItems.forEach(item => mergedMap.set(item.id, item))
        // Guest items only fill gaps that aren't in server
        guestItems.forEach(item => {
          if (!mergedMap.has(item.id)) {
            mergedMap.set(item.id, item)
          }
        })
        const merged = Array.from(mergedMap.values())
        console.log('[syncCartFromServer] Merged to', merged.length, 'items')
        set({ items: merged })
        saveLocalCart(merged, userId)
      }
    } catch (err) {
      console.warn('[syncCartFromServer] Error:', err)
    }
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

    // If no userId, try to sync from server first
    if (!currentUserId) {
      await get().syncFavoritesFromServer()
      currentUserId = get().userId
    }

    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession()
      currentUserId = session?.user?.id || null
      if (!currentUserId) {
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
        try {
          const res = await fetch('/api/favorites', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: product.id }),
          })
          if (!res.ok) console.warn('Favorites delete error:', res.statusText)
        } catch (err) {
          console.warn('Favorites delete error:', err)
        }
      }
    } else {
      newItems = [...get().items, product]
      set({ items: newItems })
      saveLocalFavorites(newItems, currentUserId)
      if (currentUserId) {
        try {
          const res = await fetch('/api/favorites', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: product.id }),
          })
          if (!res.ok) console.warn('Favorites upsert error:', res.statusText)
        } catch (err) {
          console.warn('Favorites upsert error:', err)
        }
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
      .select('product:products(*, product_images(url, is_primary, sort_order))')
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
        .map((f: any) => {
          const sortedImages = (f.product.product_images || [])
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img: any) => img.url)

          return {
            id: f.product.id,
            name: f.product.name,
            slug: f.product.slug,
            description: f.product.description,
            price: f.product.price,
            original_price: f.product.original_price,
            images: sortedImages.length > 0 ? sortedImages : ['/images/placeholder-hat.jpg'],
            category: f.product.category || 'Premium',
            colors: f.product.colors || [],
            sizes: f.product.sizes || [],
            sizes_stock: f.product.sizes_stock || {},
            stock: f.product.stock || 0,
            featured: f.product.featured || false,
          } as Product
        })
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
    set({ items: [] })
    let currentUserId = get().userId
    saveLocalFavorites([], currentUserId)

    const persistViaAPI = async (uid: string | null) => {
      if (!uid) return
      try {
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clear_all: true }),
        })
        if (!res.ok && res.status !== 401) {
          const text = await res.text()
          console.error('Error clearing favorites in DB:', text)
        }
      } catch (err) {
        console.error('Error clearing favorites:', err)
      }
    }

    if (currentUserId) {
      persistViaAPI(currentUserId)
    } else {
      get().syncFavoritesFromServer().then(() => {
        const uid = get().userId
        if (uid) {
          persistViaAPI(uid)
        }
      })
    }
  },
  // Loads favorites via server API route — bypasses client JWT timing issues on Vercel
  syncFavoritesFromServer: async () => {
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' })
      if (!res.ok) {
        console.error('[syncFavoritesFromServer] Response not ok:', res.status)
        return
      }
      const data = await res.json()
      const serverItems: Product[] = data.items ?? []
      const userId: string | null = data.userId ?? null

      if (userId) {
        set({ userId })
        const localItems = get().items
        const mergedMap = new Map<string, Product>()
        serverItems.forEach(item => mergedMap.set(item.id, item))
        // local items take precedence
        localItems.forEach(item => mergedMap.set(item.id, item))
        const merged = Array.from(mergedMap.values())
        set({ items: merged })
        saveLocalFavorites(merged, userId)
      }
    } catch (err) {
      console.warn('[syncFavoritesFromServer] Error:', err)
    }
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
    try {
      // Use server endpoint to signOut - more reliable on Vercel
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Error during logout:', err)
    }
    // Clear local auth state and keep cart stored for next login
    set({ user: null, isAdmin: false })
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
    name: 'Camiseta Selección Colombia Local 2026',
    slug: 'camiseta-colombia-local-2026',
    description: 'Camiseta oficial versión local para el Mundial 2026. Tecnología de tejido de secado rápido, transpirable y escudo de la FCF bordado en alta definición.',
    price: 199000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
      'https://images.unsplash.com/photo-1579952362224-4bb3e5716477?w=800&q=80',
    ],
    category: 'Camisetas',
    colors: ['Amarillo', 'Azul', 'Rojo'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizes_stock: { 'S': 20, 'M': 40, 'L': 40, 'XL': 10, 'XXL': 10 },
    stock: 120,
    featured: true,
    is_promotion: false,
  },
  {
    id: '2',
    name: 'Camiseta Selección Colombia Visitante 2026',
    slug: 'camiseta-colombia-visitante-2026',
    description: 'Camiseta oficial versión visitante para las eliminatorias y el Mundial 2026. Ajuste atlético de alto rendimiento con detalles tricolor en cuello y mangas.',
    price: 199000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
    ],
    category: 'Camisetas',
    colors: ['Negro', 'Amarillo', 'Rojo'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    sizes_stock: { 'S': 10, 'M': 30, 'L': 25, 'XL': 10, 'XXL': 10 },
    stock: 85,
    featured: true,
    is_promotion: false,
  },
  {
    id: '3',
    name: 'Álbum Mundial 2026 - Tapa Dura',
    slug: 'album-mundial-2026-tapa-dura',
    description: 'Álbum oficial Panini FIFA World Cup 2026 edición especial de tapa dura. Conserva tus estampas en la mejor calidad del mercado.',
    price: 129000,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
    ],
    category: 'Álbumes',
    colors: ['Multicolor'],
    sizes: ['Única'],
    stock: 60,
    featured: true,
    is_promotion: false,
  },
  {
    id: '4',
    name: 'Caja Completa de 50 Sobres Panini',
    slug: 'caja-50-sobres-panini',
    description: 'Caja oficial que contiene 50 sobres del Álbum Panini Mundial 2026. Cada sobre contiene 5 estampas aleatorias para llenar tu álbum.',
    price: 185000,
    original_price: 220000,
    images: [
      'https://images.unsplash.com/photo-1540747737956-37872d7f9cdb?w=800&q=80',
    ],
    category: 'Cajas',
    colors: ['Multicolor'],
    sizes: ['Única'],
    stock: 40,
    featured: true,
    is_promotion: true,
  },
  {
    id: '5',
    name: 'Box Coleccionista Gol de Oro 2026',
    slug: 'box-coleccionista-gol-de-oro',
    description: 'Edición exclusiva de la casa. Caja de metal coleccionista que contiene 1 Álbum tapa dura, 20 sobres oficiales y stickers edición especial limitada.',
    price: 349000,
    original_price: 399000,
    images: [
      'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&q=80',
    ],
    category: 'Cajas',
    colors: ['Negro', 'Dorado'],
    sizes: ['Única'],
    stock: 30,
    featured: true,
    is_promotion: true,
  },
  {
    id: '6',
    name: 'Sticker James Rodríguez - Leyenda',
    slug: 'sticker-james-rodriguez-leyenda',
    description: 'Estampa coleccionable holográfica de James Rodríguez. Serie limitada de la Selección Colombia, imprescindible para los verdaderos hinchas.',
    price: 1200,
    original_price: null,
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    ],
    category: 'Coleccionables',
    colors: ['Dorado'],
    sizes: ['Única'],
    stock: 500,
    featured: false,
    is_promotion: false,
  },
]
