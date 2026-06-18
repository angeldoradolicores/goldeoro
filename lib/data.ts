// Mock data types and constants for the frontend
// This will be replaced with real data from Supabase later

export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  discount?: number
  images: string[]
  videos?: string[]
  category: string
  brand: string
  colors: string[]
  sizes: string[]
  stock: number
  featured: boolean
  isNew: boolean
  rating: number
  reviews: number
  createdAt: Date
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: Address
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  addresses: Address[]
  isAdmin: boolean
  createdAt: Date
}

export interface Promotion {
  id: string
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchase?: number
  maxUses?: number
  usedCount: number
  startDate: Date
  endDate?: Date
  active: boolean
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "NY Yankees Premium Gold Edition",
    description: "Gorra oficial de los New York Yankees en edicion limitada con detalles en oro. Fabricada con materiales premium y acabados de lujo.",
    price: 299000,
    salePrice: 249000,
    discount: 17,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    category: "snapback",
    brand: "New Era",
    colors: ["Negro", "Dorado"],
    sizes: ["S/M", "M/L", "L/XL"],
    stock: 25,
    featured: true,
    isNew: true,
    rating: 4.9,
    reviews: 128,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "LA Dodgers Classic Blue",
    description: "La clasica gorra de los Dodgers en azul royal. Un icono del streetwear que nunca pasa de moda.",
    price: 189000,
    images: ["/placeholder.svg", "/placeholder.svg"],
    category: "fitted",
    brand: "New Era",
    colors: ["Azul", "Blanco"],
    sizes: ["7", "7 1/8", "7 1/4", "7 3/8", "7 1/2"],
    stock: 42,
    featured: true,
    isNew: false,
    rating: 4.8,
    reviews: 256,
    createdAt: new Date("2023-11-20"),
  },
  {
    id: "3",
    name: "Chicago Bulls Heritage",
    description: "Gorra vintage de los Chicago Bulls. Tributo a la era dorada del baloncesto con acabados retro premium.",
    price: 219000,
    images: ["/placeholder.svg", "/placeholder.svg"],
    category: "snapback",
    brand: "Mitchell & Ness",
    colors: ["Rojo", "Negro"],
    sizes: ["Unica"],
    stock: 18,
    featured: true,
    isNew: false,
    rating: 4.7,
    reviews: 89,
    createdAt: new Date("2023-10-05"),
  },
  {
    id: "4",
    name: "Urban Street Dad Hat",
    description: "Dad hat minimalista con bordado sutil. Perfecta para el dia a dia con estilo casual premium.",
    price: 149000,
    images: ["/placeholder.svg"],
    category: "dad-hat",
    brand: "Gol de Oro",
    colors: ["Beige", "Negro", "Blanco", "Verde Oliva"],
    sizes: ["Ajustable"],
    stock: 65,
    featured: false,
    isNew: true,
    rating: 4.6,
    reviews: 45,
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "5",
    name: "Miami Heat Vice City",
    description: "Edicion especial Vice City de los Miami Heat. Colores neon inspirados en la estetica retro de Miami.",
    price: 259000,
    images: ["/placeholder.svg", "/placeholder.svg"],
    category: "snapback",
    brand: "New Era",
    colors: ["Rosa", "Azul Neon"],
    sizes: ["S/M", "M/L", "L/XL"],
    stock: 12,
    featured: true,
    isNew: true,
    rating: 4.9,
    reviews: 67,
    createdAt: new Date("2024-01-28"),
  },
  {
    id: "6",
    name: "Boston Red Sox Vintage",
    description: "Gorra vintage de los Red Sox con lavado especial para un look desgastado autentico.",
    price: 179000,
    salePrice: 129000,
    discount: 28,
    images: ["/placeholder.svg"],
    category: "fitted",
    brand: "47 Brand",
    colors: ["Azul Marino", "Rojo"],
    sizes: ["S", "M", "L", "XL"],
    stock: 33,
    featured: false,
    isNew: false,
    rating: 4.5,
    reviews: 112,
    createdAt: new Date("2023-09-15"),
  },
  {
    id: "7",
    name: "Golden State Warriors Championship",
    description: "Gorra conmemorativa de campeonato. Edicion limitada con detalles dorados y parche especial.",
    price: 349000,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    category: "snapback",
    brand: "New Era",
    colors: ["Azul Royal", "Amarillo"],
    sizes: ["Unica"],
    stock: 8,
    featured: true,
    isNew: false,
    rating: 5.0,
    reviews: 34,
    createdAt: new Date("2023-12-10"),
  },
  {
    id: "8",
    name: "Trucker Mesh Classic",
    description: "Trucker hat clasica con malla transpirable. Ideal para el verano con estilo casual.",
    price: 119000,
    images: ["/placeholder.svg"],
    category: "trucker",
    brand: "Gol de Oro",
    colors: ["Negro/Blanco", "Azul/Blanco", "Rojo/Blanco"],
    sizes: ["Ajustable"],
    stock: 78,
    featured: false,
    isNew: false,
    rating: 4.4,
    reviews: 89,
    createdAt: new Date("2023-08-20"),
  },
]

export const categories = [
  { id: "all", name: "Todas", count: mockProducts.length },
  { id: "snapback", name: "Snapback", count: mockProducts.filter(p => p.category === "snapback").length },
  { id: "fitted", name: "Fitted", count: mockProducts.filter(p => p.category === "fitted").length },
  { id: "dad-hat", name: "Dad Hat", count: mockProducts.filter(p => p.category === "dad-hat").length },
  { id: "trucker", name: "Trucker", count: mockProducts.filter(p => p.category === "trucker").length },
]

export const brands = [
  "New Era",
  "Mitchell & Ness",
  "47 Brand",
  "Gol de Oro",
]

export const shippingOptions = [
  { 
    id: "interrapidisimo", 
    name: "InterRapidisimo", 
    description: "Entrega en 2-3 dias habiles",
    price: 15000,
    estimatedDays: "2-3"
  },
  { 
    id: "enviastandard", 
    name: "Envia - Standard", 
    description: "Entrega en 3-5 dias habiles",
    price: 12000,
    estimatedDays: "3-5"
  },
  { 
    id: "enviaexpress", 
    name: "Envia - Express", 
    description: "Entrega en 1-2 dias habiles",
    price: 25000,
    estimatedDays: "1-2"
  },
  { 
    id: "recogida", 
    name: "Recoger en tienda", 
    description: "Gratis - Disponible en 24 horas",
    price: 0,
    estimatedDays: "1"
  },
]

// Chatbot responses
export const chatbotResponses = {
  greetings: [
    "Hola! Bienvenido a Gol de Oro. Como puedo ayudarte hoy?",
    "Hola! Soy el asistente virtual de Gol de Oro. En que puedo servirte?",
  ],
  shipping: [
    "Ofrecemos envio a todo Colombia. Los tiempos de entrega son: InterRapidisimo (2-3 dias), Envia Standard (3-5 dias), y Envia Express (1-2 dias). El envio es gratis en compras mayores a $200.000.",
  ],
  returns: [
    "Tienes 30 dias para devolver tu producto en perfectas condiciones. El proceso es simple: contactanos, te enviamos una guia de devolucion, y una vez recibamos el producto, procesamos tu reembolso en 5-7 dias habiles.",
  ],
  payment: [
    "Aceptamos tarjetas de credito y debito (Visa, Mastercard, American Express), PSE, Nequi, Daviplata, y pago contra entrega en algunas ciudades.",
  ],
  products: [
    "Tenemos una amplia variedad de gorras: Snapback, Fitted, Dad Hat, y Trucker. Trabajamos con marcas como New Era, Mitchell & Ness, y 47 Brand. Puedes ver todo nuestro catalogo en la seccion de productos.",
  ],
  promotions: [
    "Actualmente tenemos: 15% de descuento para nuevos usuarios con el codigo WELCOME15, y Flash Sales con hasta 50% de descuento en productos seleccionados. Visita nuestra seccion de promociones para mas detalles!",
  ],
  sizes: [
    "Nuestras gorras vienen en diferentes tallas dependiendo del modelo: Las Fitted vienen en tallas numericas (7, 7 1/8, etc.), las Snapback y Dad Hat son ajustables. Te recomendamos medir tu cabeza y consultar nuestra guia de tallas.",
  ],
  default: [
    "Gracias por tu mensaje. Si necesitas ayuda especifica, puedes preguntarme sobre: envios, devoluciones, metodos de pago, productos disponibles, promociones actuales, o tallas. Tambien puedes contactarnos directamente.",
  ],
}
