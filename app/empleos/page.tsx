"use client"

import { motion } from "framer-motion"
import { Briefcase, Mail, Send, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function EmpleosPage() {
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
            <span className="text-sm font-bold uppercase tracking-wider text-gold">Únete al Equipo</span>
            <h1 className="text-4xl md:text-6xl font-black mt-2 text-gradient-gold font-display">TRABAJA CON NOSOTROS</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Buscamos mentes creativas y apasionadas por la moda urbana y el streetwear de alta gama.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "Asesor de Ventas & Estilo",
                location: "Bogotá, Colombia (Presencial)",
                type: "Tiempo Completo",
                description: "Asesoramiento premium a clientes, manejo de caja y organización de inventario en tienda física."
              },
              {
                title: "Creador de Contenido & Redes",
                location: "Remoto / Híbrido (Medellín o Bogotá)",
                type: "Medio Tiempo / Freelance",
                description: "Producción de fotos, videos de producto para TikTok/Instagram Reels y diseño de campañas visuales de streetwear."
              },
              {
                title: "Gestor de Logística & Despachos",
                location: "Bogotá, Colombia (Presencial)",
                type: "Tiempo Completo",
                description: "Preparación de pedidos, facturación y coordinación de envíos con Interrapidísimo en nuestra bodega principal."
              },
              {
                title: "Especialista en Atención al Cliente",
                location: "Remoto",
                type: "Tiempo Completo",
                description: "Gestión de consultas de clientes a través de WhatsApp, correos y redes sociales con enfoque en ventas consultivas."
              }
            ].map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-3xl border border-border/60 bg-card/50 backdrop-blur hover:border-gold/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                    <p className="text-sm text-gold mt-1">{job.location}</p>
                  </div>
                  <span className="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full font-semibold shrink-0">
                    {job.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {job.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-3xl border border-border/60 bg-gradient-to-br from-gold/10 via-transparent to-transparent text-center"
          >
            <Mail className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">¿Listo para postularte?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              Envíanos tu hoja de vida o portafolio creativo al correo electrónico urbancrowncol4@gmail.com con el nombre de la vacante en el asunto. ¡Queremos conocer tu talento!
            </p>
            <a
              href="mailto:urbancrowncol4@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
              Enviar Correo
            </a>
          </motion.div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
