"use client"

import { motion } from "framer-motion"
import { ShieldCheck, RefreshCw, AlertCircle, Phone } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function DevolucionesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold uppercase tracking-wider text-gold">Garantía Asegurada</span>
            <h1 className="text-4xl md:text-6xl font-black mt-2 text-gradient-gold">DEVOLUCIONES & CAMBIOS</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Queremos que lleves tu corona con total orgullo. Conoce nuestra política de satisfacción y cambios gratis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl border border-border/60 bg-gradient-to-br from-gold/10 via-transparent to-transparent mb-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-gold" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Garantía de Satisfacción 100%</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Si tu gorra no te queda a la perfección, no estás conforme con la horma, o simplemente prefieres otra referencia, tienes 2 días hábiles desde la entrega para realizar tu cambio.
            </p>
          </motion.div>

          <div className="space-y-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground">Condiciones para Cambios</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Estado del Producto",
                  desc: "La gorra debe estar en perfecto estado, limpia, sin signos de uso y con todas sus etiquetas y empaques originales."
                },
                {
                  icon: RefreshCw,
                  title: "Proceso Rápido",
                  desc: "Te ayudamos a gestionar tu cambio inmediatamente. Puedes cambiarlo por color o cualquier otra referencia disponible."
                },
                {
                  icon: AlertCircle,
                  title: "Garantía por Defectos",
                  desc: "Si el producto presenta alguna falla de confección o costura, asumimos el 100% de los costos logísticos de reposición."
                }
              ].map((item, index) => (
                <div key={index} className="p-6 rounded-2xl bg-card border border-border/40 hover:border-gold/30 transition-all duration-300">
                  <item.icon className="w-8 h-8 text-gold mb-4" />
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl border border-border/60 bg-secondary/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gold" />
              ¿Cómo iniciar una devolución o cambio?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Es muy simple. Escríbele a nuestro asesor personal por WhatsApp al número 3108999049 con los siguientes datos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm md:text-base mb-6">
              <li>Nombre completo y número de pedido.</li>
              <li>Fotos de la gorra (para constatar que está con etiquetas y sin uso).</li>
              <li>Referencia nueva por la cual deseas hacer el cambio.</li>
            </ul>
            <a
              href="https://wa.me/573108999049"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
            >
              Iniciar Cambio por WhatsApp
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
