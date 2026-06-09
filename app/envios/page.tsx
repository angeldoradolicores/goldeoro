"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, MapPin, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function EnviosPage() {
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
            <span className="text-sm font-bold uppercase tracking-wider text-gold">Logística Premium</span>
            <h1 className="text-4xl md:text-6xl font-black mt-2 text-gradient-gold">ENVÍOS & ENTREGAS</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Conoce nuestras políticas de despacho, tiempos de entrega y métodos de seguimiento.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl border border-border/60 bg-card/50 backdrop-blur hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-3">Envíos por Interrapidísimo</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Todos nuestros despachos nacionales se realizan exclusivamente a través de Interrapidísimo, garantizando que tu gorra llegue en perfectas condiciones y con seguimiento garantizado.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl border border-border/60 bg-card/50 backdrop-blur hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tiempos de Entrega</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                El lapso estimado de entrega es de 3 a 5 días hábiles desde la confirmación del pago o despacho de tu pedido, dependiendo de la ciudad de destino en Colombia.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl border border-border/60 bg-gradient-to-br from-gold/10 via-transparent to-transparent mb-12"
          >
            <h3 className="text-2xl font-bold mb-4">Costos de Envío</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
                <span><strong>Envío Gratis:</strong> En compras superiores a <strong>$200.000 COP</strong> a nivel nacional.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
                <span><strong>Tarifa Plana:</strong> Para compras menores a $200.000 COP, el costo de envío va desde  $17.000 COP.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gold shrink-0" />
                <span><strong>Pago Contraentrega:</strong> Puedes pagar en efectivo directamente al transportador al recibir tu paquete en casa.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-secondary/30 rounded-3xl p-8 border border-border/30"
          >
            <h3 className="text-xl font-bold mb-3">¿Tienes alguna duda sobre tu despacho?</h3>
            <p className="text-muted-foreground mb-6">
              Comunícate directamente con nuestro asesor de estilo de Urban Crown para recibir soporte personalizado en tiempo real.
            </p>
            <a
              href="https://wa.me/573108999049"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
            >
              Escribir al WhatsApp
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
