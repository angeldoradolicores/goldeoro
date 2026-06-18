"use client"

import { motion } from "framer-motion"
import { Truck, ShieldCheck, Clock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-action block mb-2">Logística Premium</span>
            <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 text-gradient-gold uppercase">ENVÍOS & ENTREGAS</h1>
            <p className="text-titanium mt-4 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Conoce nuestras políticas de despacho, tiempos de entrega y métodos de seguimiento nacional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="p-8 rounded-none border border-steel/30 bg-carbon shadow-2xl"
            >
              <div className="w-12 h-12 rounded-none bg-graphite border border-steel/30 flex items-center justify-center mb-6">
                <Truck className="w-5 h-5 text-gold-action" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">Envíos por Interrapidísimo</h3>
              <p className="text-titanium text-xs md:text-sm leading-relaxed font-sans font-light">
                Todos nuestros despachos nacionales se realizan de forma exclusiva a través de Interrapidísimo, garantizando que tu producto llegue en perfectas condiciones y con seguimiento certificado en tiempo real.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="p-8 rounded-none border border-steel/30 bg-carbon shadow-2xl"
            >
              <div className="w-12 h-12 rounded-none bg-graphite border border-steel/30 flex items-center justify-center mb-6">
                <Clock className="w-5 h-5 text-gold-action" />
              </div>
              <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">Tiempos de Entrega</h3>
              <p className="text-titanium text-xs md:text-sm leading-relaxed font-sans font-light">
                El lapso estimado de entrega es de 3 a 5 días hábiles a partir de la confirmación del despacho de tu pedido, dependiendo de la ciudad de destino en Colombia.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="p-8 rounded-none border border-steel/30 bg-carbon shadow-2xl mb-12 relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-action" />
            <h3 className="text-xl font-display font-semibold mb-6 text-white-diamond uppercase tracking-wide">Costos de Envío</h3>
            <ul className="space-y-4 text-titanium text-xs md:text-sm font-sans font-light">
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gold-action shrink-0" />
                <span><strong>Envío Gratis:</strong> En compras superiores a <strong>$300.000 COP</strong> a nivel nacional.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gold-action shrink-0" />
                <span><strong>Tarifa Plana:</strong> Para compras menores a $300.000 COP, el costo de envío estándar es de $17.000 COP.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gold-action shrink-0" />
                <span><strong>Tarifa Especial para Pasto:</strong> Si tu pedido tiene destino dentro de la ciudad de Pasto, Nariño, el costo de envío es de solo $5.000 COP, sin importar el valor de la compra.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-gold-action shrink-0" />
                <span><strong>Pago Contraentrega:</strong> Puedes pagar en efectivo directamente al transportador al recibir tu paquete en casa.</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center bg-carbon rounded-none p-8 border border-steel/30 shadow-2xl"
          >
            <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">¿Tienes alguna duda sobre tu despacho?</h3>
            <p className="text-titanium text-xs md:text-sm mb-6 max-w-md mx-auto font-sans font-light leading-relaxed">
              Comunícate directamente con nuestro asesor de estilo de Gol de Oro para recibir soporte personalizado en tiempo real.
            </p>
            <a
              href="https://wa.me/573108999049"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-action hover:bg-gold-action/90 text-obsidian font-bold text-xs uppercase tracking-widest rounded-none shadow-md transition-all"
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
