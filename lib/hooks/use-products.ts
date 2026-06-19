'use client'

import useSWR from 'swr'
import type { Category, Promotion } from '@/lib/supabase/types'
import type { Product } from '@/lib/store'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Products hooks
export function useProducts(options?: {
  category?: string
  featured?: boolean
  promotion?: boolean
  search?: string
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()
  if (options?.category) params.set('category', options.category)
  if (options?.featured) params.set('featured', 'true')
  if (options?.promotion) params.set('promotion', 'true')
  if (options?.search) params.set('search', options.search)
  if (options?.limit) params.set('limit', options.limit.toString())
  if (options?.offset) params.set('offset', options.offset.toString())

  const queryString = params.toString()
  const url = `/api/products${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<Product[]>(url, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  })

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useProduct(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<Product>(
    slug ? `/api/products/${slug}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useFeaturedProducts(limit: number = 6) {
  return useProducts({ featured: true, limit })
}

export function usePromotionProducts(limit: number = 6) {
  return useProducts({ promotion: true, limit })
}

// Categories hook
export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>('/api/categories', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return {
    categories: data || [],
    isLoading,
    isError: error,
  }
}

// Promotions hook
export function usePromotions() {
  const { data, error, isLoading } = useSWR<Promotion[]>('/api/promotions', fetcher)

  return {
    promotions: data || [],
    isLoading,
    isError: error,
  }
}

// Validate promotion code
export async function validatePromoCode(code: string): Promise<Promotion | null> {
  try {
    const response = await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Codigo no valido')
    }

    return response.json()
  } catch (error) {
    console.error('Error validating promo code:', error)
    throw error
  }
}

// Format price helper
export function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

// Calculate discount percentage
export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}
