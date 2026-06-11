"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ResendPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'No se pudo reenviar')
      } else {
        toast.success(data.message || 'Enlace reenviado. Revisa tu correo.')
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('[resend] error', err)
      toast.error('Error al reenviar el enlace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-obsidian flex items-center justify-center p-6 text-foreground">
      <div className="max-w-md w-full bg-graphite border border-steel/30 p-8 rounded">
        <h1 className="text-xl font-semibold mb-4">Reenviar enlace de confirmación</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm text-titanium">Correo electrónico</label>
            <input className="w-full p-3 bg-carbon border border-steel/20 rounded text-white-diamond" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-luxury flex-1">{loading ? 'Enviando...' : 'Reenviar enlace'}</button>
            <a href="/auth/login" className="btn-outline px-4 py-3">Cancelar</a>
          </div>
        </form>
      </div>
    </main>
  )
}
