'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const [initializing, setInitializing] = useState(true)
  const [sessionOk, setSessionOk] = useState(false)
  const [invalidLink, setInvalidLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const initializeSession = async () => {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        console.error('[reset-password] getSession error or no session:', error?.message)
        setInvalidLink(true)
      } else {
        setSessionOk(true)
      }
      setInitializing(false)
    }

    initializeSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setError('Ingresa y confirma tu nueva contraseña')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      console.error('[reset-password] updateUser error:', error.message)
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.')
      return
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-card/70 backdrop-blur border border-border rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Restablecer Contraseña</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Ingresa una nueva contraseña para tu cuenta.
            </p>
          </div>

          {initializing ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : invalidLink ? (
            <div className="space-y-4 text-center">
              <p className="text-red-400">El enlace no es válido o ha expirado.</p>
              <Link href="/auth/recuperar">
                <Button className="w-full bg-gold hover:bg-gold/90 text-background font-semibold">
                  Solicitar nuevo enlace
                </Button>
              </Link>
            </div>
          ) : sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">¡Contraseña actualizada!</h2>
              <p className="text-muted-foreground text-sm">
                Tu contraseña se ha cambiado con éxito. Ahora puedes iniciar sesión.
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-gold hover:bg-gold/90 text-background font-semibold">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="Nueva contraseña"
                  className="bg-background/50 border-border focus:border-gold/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                  placeholder="Repite tu contraseña"
                  className="bg-background/50 border-border focus:border-gold/50"
                  required
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold/90 text-background font-semibold h-11">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando...</>
                ) : (
                  'Actualizar contraseña'
                )}
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
