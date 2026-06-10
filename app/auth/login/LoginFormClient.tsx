'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuthStore, useCartStore, useFavoritesStore } from '@/lib/store'

type LoginFormClientProps = {
  action: (formData: FormData) => Promise<void>
  redirectTo: string
  error?: string
}

export default function LoginFormClient({ action, redirectTo, error }: LoginFormClientProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending] = useTransition()

  useEffect(() => {
    if (error) {
      toast.error(error)
    }

    useAuthStore.getState().setUser(null)
    useAuthStore.getState().setIsAdmin(false)
    useAuthStore.getState().setInitialized(false)
    useCartStore.getState().setU    useCartStore.getState().setU    useCartStore.getState().setU    useCartStore.getState().setU    useCartSt      useCartsSt    useCartStore.getState().setU    useCartStore.getStateturn (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-card      <div className="w-full max-w-md bg-caoun      <div className="w-full         <div className="w-full max-w-md bg-card      <div className="w-ful16 te      <di mx-auto mb-4" />
                                                 fo                   o            h1>
                                                                                                        </div>

        <form action={action} method="post" cl        <form action={action} methodf">        <form actity  ="hidden" name=        <form action={airectTo} />

          <div>
            <label htm            <label htm            <label htmed            <label htm            <label htm        <Input id="email" type="email" name="email" placeholder="tu@email.com" required className="h-14" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Contrasena</label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="********"
                required
                className="h-14 pr-12                className="h-14 pr-12                className="h-14 pr-12                             className="h-14 pr-12                className="h-14 pr-12                className="h-14 pte-y-                className="h-14 pr-12                className="h-14 pr-12                className="h-14 pr-12                             className="h-button>
            <            <            <            <            <            <            <            <            <            <            <            <            <            <            <            <            <          ?
            <  ink            </div>

          <Button type="submit" disabled={isPending} className="w-full h-14">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : '            {is      </Button>
        </form>

                                                           or                              cu                                     ss                       strate aqui</Link>
        </p>
      </div>
    </div>
  )
}
