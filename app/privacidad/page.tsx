"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Lock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function PrivacidadPage() {
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
            <Shield className="w-12 h-12 text-gold-action mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold uppercase">POLÍTICA DE PRIVACIDAD</h1>
            <p className="text-titanium mt-4 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Conoce cómo protegemos y administramos tus datos personales de forma segura.
            </p>
          </motion.div>

          <div className="space-y-8 text-titanium leading-relaxed bg-carbon p-8 rounded-none border border-steel/30 shadow-2xl mb-12 relative font-sans font-light">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-action" />
            
            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Lock className="w-4 h-4 text-gold-action" />
                1. Tratamiento de Datos (Ley 1581 de 2012)
              </h3>
              <p className="text-xs md:text-sm">
                En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia, Gol de Oro informa que los datos personales recolectados a través de nuestro sitio web serán tratados de forma confidencial y segura.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Eye className="w-4 h-4 text-gold-action" />
                2. Información Recolectada
              </h3>
              <p className="text-xs md:text-sm">
                Recolectamos información esencial para procesar tus compras y envíos: nombre completo, cédula, dirección de entrega, número de teléfono (para coordinación con Interrapidísimo) y correo electrónico. No almacenamos datos de tarjetas de crédito o débito; los pagos son procesados externamente por pasarelas de pago seguras y certificadas.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Lock className="w-4 h-4 text-gold-action" />
                3. Uso de la Información
              </h3>
              <p className="text-xs md:text-sm mb-3">
                Tus datos personales se utilizarán única y exclusivamente para:
              </p>
              <ul className="list-none space-y-2 text-xs md:text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-action" /> Procesar y despachar tus órdenes de compra.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-action" /> Brindar soporte personalizado a través de nuestro asistente o WhatsApp.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gold-action" /> Informar sobre novedades del catálogo o promociones vigentes (previa autorización).
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <Shield className="w-4 h-4 text-gold-action" />
                4. Tus Derechos (Habeas Data)
              </h3>
              <p className="text-xs md:text-sm">
                Como titular de los datos, tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación de tu información personal de nuestras bases de datos en cualquier momento. Para ejercer estos derechos, envíanos una solicitud a **info@goldeoro.co**.
              </p>
            </div>
          </div>

          <div className="text-center bg-carbon rounded-none p-8 border border-steel/30 shadow-2xl">
            <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">¿Tienes alguna duda sobre tus datos?</h3>
            <p className="text-titanium text-xs md:text-sm mb-6 max-w-md mx-auto font-sans font-light leading-relaxed">
              Contáctanos de forma directa al correo de soporte técnico y servicio al cliente de Gol de Oro.
            </p>
            <a 
              href="mailto:info@goldeoro.co" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-action hover:bg-gold-action/90 text-obsidian font-bold text-xs uppercase tracking-widest rounded-none shadow-md transition-all"
            >
              Contactar Oficial de Privacidad
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
