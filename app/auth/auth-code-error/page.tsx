"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

function parseHash(hash: string) {
  if (!hash) return {}
  // remove leading '#'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  return Object.fromEntries(new URLSearchParams(raw))
}

export default function AuthCodeErrorPage() {
  const [info, setInfo] = useState<{ [k: string]: string }>({})

  useEffect(() => {
    const parsed = parseHash(window.location.hash || window.location.search)
    setInfo(parsed)
  }, [])

  const code = info.error_code || info.error || ''

  const messageMap: Record<string, string> = {
    otp_expired: 'El enlace de confirmación ha expirado. Solicita uno nuevo desde el formulario de registro o intenta iniciar sesión para reenviar el enlace.',
    invalid_token: 'El enlace de confirmación no es válido. Solicita un nuevo enlace.',
    access_denied: 'Acceso denegado. El enlace no pudo ser verificado.',
  }

  const friendly = code ? (messageMap[code] || info.error_description || 'Ocurrió un error al verificar el enlace.') : 'Ocurrió un error al verificar el enlace.'

  return (
    <main className="min-h-screen flex items-center justify-center bg-obsidian text-foreground p-6">
      <div className="max-w-xl w-full bg-graphite border border-steel/30 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Verificación de Cuenta</h1>
        <p className="text-sm text-titanium mb-6">
          Es probable que tu cuenta ya haya sido verificada exitosamente o que el enlace haya sido procesado por tu proveedor de correo. 
          <br /><br />
          Por favor, intenta iniciar sesión directamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/login" className="btn-luxury px-6 py-3 rounded text-sm uppercase tracking-wider font-semibold">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    </main>
  )
}
