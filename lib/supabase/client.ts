import { createBrowserClient } from '@supabase/ssr'

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  return { url, anonKey }
}

export function createClient() {
  const { url, anonKey } = getSupabaseConfig()

  if (!url || !anonKey) {
    throw new Error('Supabase URL and anon key are required. Check your environment variables.')
  }

  return createBrowserClient(url, anonKey)
}