"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check, Loader2 } from "lucide-react"
const SparklesUI = dynamic(() => import('@/components/sparkles'), { ssr: false })
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  })

  const [formErrors, setFormErrors] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  })

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[0-9+\s()-]{7,20}$/

  const validateField = (name: keyof typeof formErrors, value: string) => {
    let error = ""

    switch (name) {
      case "nombre":
      case "apellido":
        if (!value.trim()) {
          error = "Este campo es obligatorio"
        } else if (value.trim().length < 2) {
          error = "Debe tener al menos 2 caracteres"
        }
        break
      case "email":
        if (!value.trim()) {
          error = "El correo es obligatorio"
        } else if (!emailRegex.test(value.trim())) {
          error = "Ingresa un correo válido"
        }
        break
      case "telefono":
        if (!value.trim()) {
          error = "El teléfono es obligatorio"
        } else if (!phoneRegex.test(value.trim())) {
          error = "El teléfono no es válido"
        }
        break
      case "password":
        if (!value) {
          error = "La contraseña es obligatoria"
        } else if (value.length < 8) {
          error = "Debe tener al menos 8 caracteres"
        } else if (!/[A-Z]/.test(value)) {
          error = "Incluye una letra mayúscula"
        } else if (!/[0-9]/.test(value)) {
          error = "Incluye un número"
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          error = "Incluye un carácter especial"
        }
        break
      case "confirmPassword":
        if (!value) {
          error = "Confirma tu contraseña"
        } else if (value !== formData.password) {
          error = "Las contraseñas no coinciden"
        }
        break
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }))
    return error === ""
  }

  const validateStep1 = () => {
    const nombreValid = validateField("nombre", formData.nombre)
    const apellidoValid = validateField("apellido", formData.apellido)
    const emailValid = validateField("email", formData.email)
    const telefonoValid = validateField("telefono", formData.telefono)
    return nombreValid && apellidoValid && emailValid && telefonoValid
  }

  const validateStep2 = () => {
    const passwordValid = validateField("password", formData.password)
    const confirmPasswordValid = validateField("confirmPassword", formData.confirmPassword)
    return passwordValid && confirmPasswordValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      if (!validateStep1()) {
        return
      }
      setStep(2)
      return
    }

    if (!validateStep2()) {
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordStrength() < 3) {
      toast.error('La contraseña debe ser más segura')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: `${formData.nombre} ${formData.apellido}`,
          phone: formData.telefono,
        }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        toast.error(result.error || 'Error al crear la cuenta')
        return
      }

      toast.success(result.message || 'Cuenta creada. Revisa tu email URBAN CROWN para confirmar tu acceso.')
      router.push('/auth/login')
    } catch (error) {
      console.error('[registro] Submit error:', error)
      toast.error('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignUp = async () => {
    setIsOAuthLoading('google')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error(error.message)
        setIsOAuthLoading(null)
      }
    } catch (error) {
      toast.error('Error al registrarte con Google')
      setIsOAuthLoading(null)
    }
  }

  const passwordStrength = () => {
    const { password } = formData
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]
  const strengthLabels = ["Debil", "Regular", "Buena", "Excelente"]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <div className="mx-auto mb-4 text-gold text-5xl font-black">✝</div>
              <h1 className="text-3xl font-bold tracking-tight">
                ✝ URBAN <span className="text-gold">CROWN</span> ✝
              </h1>
            </Link>
          </div>

          <div className="bg-card/60 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <div className="pointer-events-none absolute top-8 left-8 text-gold text-3xl opacity-20">✝</div>
            <div className="pointer-events-none absolute bottom-10 right-10 text-gold text-3xl opacity-20">✝</div>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= 1 ? "bg-gold text-background" : "bg-muted text-muted-foreground"}`}>
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div className={`w-16 h-1 rounded-full transition-all ${step >= 2 ? "bg-gold" : "bg-muted"}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step >= 2 ? "bg-gold text-background" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
            </div>

            <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
              {step === 1 ? "Crea tu cuenta" : "Eleva tu seguridad"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              {step === 1 ? "Completa tu registro para acceder a productos exclusivos" : "Define una contraseña segura para proteger tu cuenta URBAN CROWN"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nombre</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Urban"
                          value={formData.nombre}
                          onChange={(e) => {
                            setFormData({ ...formData, nombre: e.target.value })
                            if (formErrors.nombre) validateField('nombre', e.target.value)
                          }}
                          onBlur={(e) => validateField('nombre', e.target.value)}
                          className="pl-12 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                          required
                        />
                        {formErrors.nombre ? (
                          <p className="text-xs text-red-500 mt-1">{formErrors.nombre}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Ingresa tu nombre</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Apellido</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Crown"
                          value={formData.apellido}
                          onChange={(e) => {
                            setFormData({ ...formData, apellido: e.target.value })
                            if (formErrors.apellido) validateField('apellido', e.target.value)
                          }}
                          onBlur={(e) => validateField('apellido', e.target.value)}
                          className="pl-4 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                          required
                        />
                        {formErrors.apellido ? (
                          <p className="text-xs text-red-500 mt-1">{formErrors.apellido}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Ingresa tu apellido</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value })
                          if (formErrors.email) validateField("email", e.target.value)
                        }}
                        onBlur={(e) => validateField("email", e.target.value)}
                        className="pl-12 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                        required
                      />
                      {formErrors.email ? (
                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Ej: ejemplo@correo.com</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Telefono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Ej: +57 300 123 4567"
                        value={formData.telefono}
                        onChange={(e) => {
                          setFormData({ ...formData, telefono: e.target.value })
                          if (formErrors.telefono) validateField("telefono", e.target.value)
                        }}
                        onBlur={(e) => validateField("telefono", e.target.value)}
                        className="pl-12 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                      />
                      {formErrors.telefono ? (
                        <p className="text-xs text-red-500 mt-1">{formErrors.telefono}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Solo números, espacios, guiones y prefijo +57.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contrasena</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value })
                          if (formErrors.password) validateField("password", e.target.value)
                        }}
                        onBlur={(e) => validateField("password", e.target.value)}
                        className="pl-12 pr-12 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                        required
                      />
                      {formErrors.password && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength() ? strengthColors[passwordStrength() - 1] : "bg-muted"}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Fuerza: {strengthLabels[passwordStrength() - 1] || "Muy debil"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirmar Contrasena</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value })
                          if (formErrors.confirmPassword) validateField("confirmPassword", e.target.value)
                        }}
                        onBlur={(e) => validateField("confirmPassword", e.target.value)}
                        className="pl-12 h-14 bg-background/50 border-border rounded-xl focus:border-gold focus:ring-gold/20"
                        required
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">Las contrasenas no coinciden</p>
                    )}
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Tu contrasena debe tener:</p>
                    <div className="space-y-2">
                      {[
                        { check: formData.password.length >= 8, text: "Al menos 8 caracteres" },
                        { check: /[A-Z]/.test(formData.password), text: "Una letra mayuscula" },
                        { check: /[0-9]/.test(formData.password), text: "Un numero" },
                        { check: /[^A-Za-z0-9]/.test(formData.password), text: "Un caracter especial" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.check ? "bg-green-500" : "bg-muted"}`}>
                            {item.check && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={item.check ? "text-green-500" : ""}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 border-border hover:border-gold/50 rounded-xl"
                    disabled={isLoading}
                  >
                    Atras
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading || (step === 2 && formData.password !== formData.confirmPassword)}
                  className="flex-1 h-14 bg-gold hover:bg-gold/90 text-background font-semibold rounded-xl transition-all duration-300 group glint-strong"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {step === 1 ? "Continuar" : "Crear Cuenta"}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">O registrate con</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isOAuthLoading !== null}
                  onClick={handleOAuthSignUp}
                  className="h-14 border-border hover:border-gold/50 rounded-xl transition-all duration-300"
                >
                  {isOAuthLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </>
                  )}
                </Button>
              </div>
            </div>

            <p className="mt-8 text-center text-muted-foreground">
              Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-gold hover:text-gold/80 font-medium transition-colors">
                Inicia sesion
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
              Volver al inicio
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-gold/20 via-background to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <SparklesUI extra={2} />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 text-gold text-6xl font-black">✝</div>
            <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
              ✝ URBAN <span className="text-gold">CROWN</span> ✝
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Únete a nuestra comunidad exclusiva y accede a las mejores gorras urbanas del mercado
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-12 space-y-4"
          >
            {[
              "Lujo exclusivo en cada gorra",
              "Acceso anticipado a nuevos lanzamientos",
              "Ofertas y promociones",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-gold" />
                </div>
                {benefit}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
