export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          price: number
          original_price: number | null
          category_id: string | null
          brand: string | null
          colors: string[]
          sizes: string[]
          stock: number
          featured: boolean
          is_promotion: boolean
          is_new: boolean
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          price: number
          original_price?: number | null
          category_id?: string | null
          brand?: string | null
          colors?: string[]
          sizes?: string[]
          stock?: number
          featured?: boolean
          is_promotion?: boolean
          is_new?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price?: number
          original_price?: number | null
          category_id?: string | null
          brand?: string | null
          colors?: string[]
          sizes?: string[]
          stock?: number
          featured?: boolean
          is_promotion?: boolean
          is_new?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt: string | null
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      product_videos: {
        Row: {
          id: string
          product_id: string
          url: string
          title: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          title?: string | null
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          street: string
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          street: string
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          street?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          guest_email: string | null
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          discount: number
          total: number
          shipping_method: string
          shipping_address: Json
          payment_method: string
          payment_reference: string | null
          wompi_transaction_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          shipping_cost: number
          discount?: number
          total: number
          shipping_method: string
          shipping_address: Json
          payment_method: string
          payment_reference?: string | null
          wompi_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          guest_email?: string | null
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          shipping_cost?: number
          discount?: number
          total?: number
          shipping_method?: string
          shipping_address?: Json
          payment_method?: string
          payment_reference?: string | null
          wompi_transaction_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_image: string | null
          price: number
          quantity: number
          color: string | null
          size: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_image?: string | null
          price: number
          quantity: number
          color?: string | null
          size?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_image?: string | null
          price?: number
          quantity?: number
          color?: string | null
          size?: string | null
          created_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase: number | null
          max_uses: number | null
          used_count: number
          start_date: string
          end_date: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_purchase?: number | null
          max_uses?: number | null
          used_count?: number
          start_date?: string
          end_date?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_purchase?: number | null
          max_uses?: number | null
          used_count?: number
          start_date?: string
          end_date?: string | null
          active?: boolean
          created_at?: string
        }
      }
      chatbot_knowledge: {
        Row: {
          id: string
          category: string
          question: string
          answer: string
          keywords: string[]
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          question: string
          answer: string
          keywords?: string[]
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          question?: string
          answer?: string
          keywords?: string[]
          active?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenient type aliases
export type Profile = Tables<'profiles'>
export type Category = Tables<'categories'>
export type Product = Tables<'products'>
export type ProductImage = Tables<'product_images'>
export type ProductVideo = Tables<'product_videos'>
export type Address = Tables<'addresses'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type Promotion = Tables<'promotions'>
export type ChatbotKnowledge = Tables<'chatbot_knowledge'>

// Extended types with relations
export type ProductWithImages = Product & {
  images: ProductImage[]
  videos: ProductVideo[]
  category: Category | null
}

export type OrderWithItems = Order & {
  items: OrderItem[]
  profile: Profile | null
}
