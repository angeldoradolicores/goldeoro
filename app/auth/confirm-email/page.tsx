"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function ConfirmEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as any || 'signup'

  useEffect(() => {
    if (!token_hash) {
      setStatus('error')
      setErrorMessage('Enlace no válido o incompleto.')
    }
  }, [token_hash])

  const handleConfirm = async () => {
    if (!token_hash) return

    setStatus('loading')
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      })

      if (error) {
        setStatus('error')
        setErrorMessage(error.message)
        toast.error('Error al confirmar: ' + error.message)
      } else {
        setStatus('success')
        toast.success('¡Cuenta confirmada exitosamente!')
        // Redirect to home or wherever after successful login
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 2000)
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMessage('Error de conexión.')
    }
  }

  return (
    <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 md:p-12 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] max-w-md w-full text-center relative overflow-hidden">
      <div className="pointer-events-none absolute top-8 left-8 text-gold-action text-3xl opacity-20">⚽</div>
      <div className="pointer-events-none absolute bottom-10 right-10 text-gold-action text-3xl opacity-20">⚽</div>
      
      <h1 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase" style={{ fontFamily: 'var(--font-cinzel)' }}>
        Verificación
      </h1>

      {status === 'idle' && (
        <>
          <p className="text-muted-foreground mb-8">
            Estás a un paso de activar tu cuenta en Gol de Oro. Haz clic en el botón para confirmar tu correo y entrar.
          </p>
          <Button 
            onClick={handleConfirm} 
            className="w-full h-14 bg-gold hover:bg-gold/90 text-background font-bold rounded-xl transition-all duration-300 uppercase tracking-widest"
          >
            Confirmar mi cuenta
          </Button>
        </>
      )}

      {status === 'loading' && (
        <div className="py-8 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
          <p className="text-muted-foreground">Verificando tu cuenta...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8 flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">¡Cuenta verificada!</h2>
          <p className="text-muted-foreground">Redirigiendo al inicio...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-bold mb-2">Enlace caducado o inválido</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {errorMessage === 'Token has expired or is invalid' 
              ? 'Este enlace ya fue usado o caducó. Puedes iniciar sesión si ya estabas confirmado.'
              : errorMessage}
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/auth/login')}
            className="w-full h-12 border-border hover:border-gold/50 rounded-xl"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <div className="fixed top-0 left-0 right-0 h-[2px] flex z-50">
        <div className="flex-1 bg-[#FCD116]" />
        <div className="flex-1 bg-[#003893]" />
        <div className="flex-1 bg-[#CE1126]" />
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#FCD116]/5 via-[#003893]/5 to-[#CE1126]/5" />
      </div>
      
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        }>
          <ConfirmEmailContent />
        </Suspense>
      </div>
    </main>
  )
}
