import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    wompiPublicKeyExists: !!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    wompiPrivateKeyExists: !!process.env.WOMPI_PRIVATE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  })
}
