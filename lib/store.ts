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

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, color: string, size: string, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  total: () => number
  itemCount: () => number
  syncCart: () => Promise<void>
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
  items: Product[]
  toggleFavorite: (product: Product) => Promise<void>
  isFavorite: (productId: string) => boolean
  syncFavorites: () => Promise<void>
  clearFavorites: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (product, color, size, quantity = 1) => {
    let newItems = []
    const existingItem = get().items.find(
      (i) => i.product.id === product.id && 
             i.selectedColor === color && 
             i.selectedSize === size
    )
    if (existingItem) {
      newItems = get().items.map((i) =>
        i.product.id === product.id &&
        i.selectedColor === color &&
        i.selectedSize === size
          ? { ...i, quantity: i.quantity + quantity }
          : i
      )
    } else {
      newItems = [...get().items, { product, quantity, selectedColor: color, selectedSize: size }]
    }

    set({ items: newItems, isOpen: true })

    // Sync to Supabase in background
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const item = newItems.find(
          (i) => i.product.id === product.id && 
                 i.selectedColor === color && 
                 i.selectedSize === size
        )
        if (item) {
          supabase.from('cart_items').upsert({
            user_id: session.user.id,
            product_id: product.id,
            quantity: item.quantity,
            selected_color: color,
            selected_size: size
          }, {
            onConflict: 'user_id,product_id,selected_color,selected_size'
          }).then(({ error }) => {
            if (error) console.error('Error syncing cart item upsert:', error.message)
          })
        }
      }
    })
  },
  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.product.id !== productId)
    set({ items: newItems })

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', productId)
          .then(({ error }) => {
            if (error) console.error('Error syncing cart item removal:', error.message)
          })
      }
    })
  },
  updateQuantity: (productId, quantity) => {
    const newItems = quantity === 0
      ? get().items.filter((i) => i.product.id !== productId)
      : get().items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        )
    set({ items: newItems })

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (quantity === 0) {
          supabase
            .from('cart_items')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .then(({ error }) => {
              if (error) console.error('Error syncing cart item removal:', error.message)
            })
        } else {
          // Find the exact item to update
          const item = newItems.find((i) => i.product.id === productId)
          if (item) {
            supabase
              .from('cart_items')
              .update({ quantity })
              .eq('user_id', session.user.id)
              .eq('product_id', productId)
              .then(({ error }) => {
                if (error) console.error('Error syncing cart item quantity:', error.message)
              })
          }
        }
      }
    })
  },
  clearCart: () => {
    set({ items: [] })
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('cart_items')
          .delete()
          .eq('user_id', session.user.id)
          .then(({ error }) => {
            if (error) console.error('Error clearing cart in DB:', error.message)
          })
      }
    })
  },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
  total: () => get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  syncCart: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const userId = session.user.id
    const localItems = get().items

    if (localItems.length > 0) {
      // Merge local items to Supabase
      for (const item of localItems) {
        await supabase
          .from('cart_items')
          .upsert({
            user_id: userId,
            product_id: item.product.id,
            quantity: item.quantity,
            selected_color: item.selectedColor,
            selected_size: item.selectedSize
          }, {
            onConflict: 'user_id,product_id,selected_color,selected_size'
          })
      }
    }

    // Fetch final merged cart from Supabase
    const { data: dbItems, error } = await supabase
      .from('cart_items')
      .select(`
        quantity,
        selected_color,
        selected_size,
        product:products(*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.warn('Cart sync skipped (run supabase-missing-tables.sql):', error.message)
      return
    }

    if (dbItems) {
      const mapped = dbItems
        .filter((item: any) => item.product)
        .map((item: any) => ({
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
          selectedSize: item.selected_size
        }))
      set({ items: mapped })
    }
  }
}))

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  items: [],
  toggleFavorite: async (product) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const isFav = get().isFavorite(product.id)
    let newItems: Product[] = []

    if (isFav) {
      newItems = get().items.filter(item => item.id !== product.id)
      set({ items: newItems })
      if (session) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', product.id)
        if (error) console.warn('Favorites delete error (table may not exist yet):', error.message)
      }
    } else {
      newItems = [...get().items, product]
      set({ items: newItems })
      if (session) {
        const { error } = await supabase
          .from('favorites')
          .upsert({
            user_id: session.user.id,
            product_id: product.id
          }, { onConflict: 'user_id,product_id' })
        if (error) console.warn('Favorites upsert error (table may not exist yet):', error.message)
      }
    }
  },
  isFavorite: (productId) => {
    return get().items.some(item => item.id === productId)
  },
  syncFavorites: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: dbFavs, error } = await supabase
      .from('favorites')
      .select('product:products(*)')
      .eq('user_id', session.user.id)

    if (error) {
      // Silently skip if table doesn't exist yet - user needs to run the SQL
      console.warn('Favorites sync skipped (run supabase-missing-tables.sql):', error.message)
      return
    }

    if (dbFavs) {
      const mapped = dbFavs
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
      set({ items: mapped })
    }
  },
  clearFavorites: () => set({ items: [] })
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
    useFavoritesStore.getState().clearFavorites()
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
