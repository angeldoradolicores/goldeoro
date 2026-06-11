'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugPage() {
  const [config, setConfig] = useState<{
    url?: string
    anonKey?: string
    supabaseClient?: boolean
    error?: string
  }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log('[debug] URL:', url)
      console.log('[debug] Anon Key (first 20 chars):', anonKey?.substring(0, 20))

      const supabase = createClient()
      console.log('[debug] Supabase client created:', supabase)

      setConfig({
        url,
        anonKey: anonKey ? `${anonKey.substring(0, 20)}...` : 'NOT SET',
        supabaseClient: !!supabase,
      })
    } catch (err) {
      console.error('[debug] Error:', err)
      setConfig({
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Configuration</h1>
        
        {loading && <p>Cargando...</p>}
        
        {!loading && (
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="font-mono text-sm mb-4">Environment Variables</h2>
              <pre className="bg-background p-4 rounded text-xs overflow-auto max-h-96 font-mono">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <h2 className="text-sm font-semibold mb-2">Verificación:</h2>
              <ul className="text-sm space-y-2">
                <li>
                  ✓ URL disponible: {config.url ? 'SÍ' : 'NO'}
                </li>
                <li>
                  ✓ Anon Key disponible: {config.anonKey && !config.anonKey.includes('NOT SET') ? 'SÍ' : 'NO'}
                </li>
                <li>
                  ✓ Cliente Supabase: {config.supabaseClient ? 'SÍ' : 'NO'}
                </li>
                {config.error && (
                  <li className="text-destructive">
                    ✗ Error: {config.error}
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">💡 Si algo está marcado como "NO":</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Verifica que tienes un archivo <code className="bg-background px-1 rounded">.env.local</code></li>
                <li>Asegúrate de que tiene estas variables:
                  <pre className="bg-background p-2 rounded mt-1 text-xs">
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
                  </pre>
                </li>
                <li>Reinicia el servidor de desarrollo: <code className="bg-background px-1 rounded">npm run dev</code></li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground">
              Abre la consola (F12) para ver más logs de depuración
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
