"use client"

import { motion } from "framer-motion"
import { ShieldCheck, RefreshCw, AlertCircle, Phone } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function DevolucionesPage() {
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
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-action block mb-2">Garantía Asegurada</span>
            <h1 className="text-3xl md:text-5xl font-display font-bold mt-2 text-gradient-gold uppercase">DEVOLUCIONES & CAMBIOS</h1>
            <p className="text-titanium mt-4 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Tu satisfacción es nuestra prioridad. Conoce nuestra política de cambios y devoluciones para productos de fútbol y coleccionables.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
          >


          </motion.div>

          <div className="space-y-8 mb-16">
            <h2 className="text-xl font-display font-semibold text-white-diamond uppercase tracking-wider">Condiciones para Cambios</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Estado del Producto",
                  desc: "El producto debe estar en perfecto estado, sin signos de uso y con todas sus etiquetas y empaques originales."
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
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <div key={index} className="p-6 rounded-none bg-carbon border border-steel/30 hover:border-gold-action/30 transition-all duration-300 shadow-xl">
                    <Icon className="w-6 h-6 text-gold-action mb-4" />
                    <h4 className="font-display font-semibold text-sm mb-2 uppercase tracking-wide text-white-diamond">{item.title}</h4>
                    <p className="text-xs text-titanium leading-relaxed font-sans font-light">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="p-8 rounded-none border border-steel/30 bg-carbon shadow-2xl"
          >
            <h3 className="text-lg font-display font-semibold mb-4 flex items-center gap-3 uppercase tracking-wide text-white-diamond">
              <Phone className="w-5 h-5 text-gold-action shrink-0" />
              ¿Cómo iniciar un cambio?
            </h3>
            <p className="text-titanium text-sm leading-relaxed mb-6 font-sans font-light">
              Es muy simple. Escríbele a nuestro asesor personal por WhatsApp al número +57 300 657 7286 con los siguientes datos:
            </p>
            <ul className="list-none space-y-3 text-titanium text-xs md:text-sm mb-8 font-sans font-light">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-action" /> Nombre completo y número de pedido.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-action" /> Fotos del producto (para constatar que está con etiquetas y sin uso).
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-gold-action" /> Referencia nueva por la cual deseas hacer el cambio.
              </li>
            </ul>
            <a
              href="https://wa.me/573108999049"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-action hover:bg-gold-action/90 text-obsidian font-bold text-xs uppercase tracking-widest rounded-none shadow-md transition-all"
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
