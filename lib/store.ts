import { create } from 'zustand'

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
}

interface ChatStore {
  isOpen: boolean
  messages: { role: 'user' | 'bot'; content: string; timestamp: Date }[]
  toggleChat: () => void
  setChatOpen: (open: boolean) => void
  addMessage: (role: 'user' | 'bot', content: string) => void
  clearMessages: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: (product, color, size, quantity = 1) => set((state) => {
    const existingItem = state.items.find(
      (i) => i.product.id === product.id && 
             i.selectedColor === color && 
             i.selectedSize === size
    )
    if (existingItem) {
      return {
        items: state.items.map((i) =>
          i.product.id === product.id &&
          i.selectedColor === color &&
          i.selectedSize === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
        isOpen: true, // Open cart drawer when adding
      }
    }
    return { 
      items: [...state.items, { product, quantity, selectedColor: color, selectedSize: size }],
      isOpen: true, // Open cart drawer when adding
    }
  }),
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((i) => i.product.id !== productId),
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    items: quantity === 0
      ? state.items.filter((i) => i.product.id !== productId)
      : state.items.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        ),
  })),
  clearCart: () => set({ items: [] }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),
  total: () => get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
  itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
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
