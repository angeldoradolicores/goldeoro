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
        <h1 className="text-2xl font-bold mb-4">Problema al confirmar tu cuenta</h1>
        <p className="text-sm text-titanium mb-6">{friendly}</p>

        {info.error && (
          <pre className="text-xs text-steel bg-carbon p-3 rounded mb-4 break-words">{JSON.stringify(info, null, 2)}</pre>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/auth/resend" className="btn-luxury px-4 py-2 rounded">Solicitar nuevo enlace</Link>
          <Link href="/auth/login" className="btn-outline px-4 py-2 rounded">Ir a Iniciar Sesión</Link>
        </div>
      </div>
    </main>
  )
}
