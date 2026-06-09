"use client"

import { motion } from "framer-motion"
import { Shield, Eye, Lock } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function PrivacidadPage() {
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
            <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-black text-gradient-gold">POLÍTICA DE PRIVACIDAD</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Conoce cómo protegemos y administramos tus datos personales de forma segura.
            </p>
          </motion.div>

          <div className="space-y-8 text-muted-foreground leading-relaxed bg-card/30 p-8 rounded-3xl border border-border/40 backdrop-blur mb-12">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold" />
                1. Tratamiento de Datos (Ley 1581 de 2012)
              </h3>
              <p>
                En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de la República de Colombia, Urban Crown informa que los datos personales recolectados a través de nuestro sitio web serán tratados de forma confidencial y segura.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-gold" />
                2. Información Recolectada
              </h3>
              <p>
                Recolectamos información esencial para procesar tus compras y envíos: nombre completo, cédula, dirección de entrega, número de teléfono (para coordinación con Interrapidísimo) y correo electrónico. No almacenamos datos de tarjetas de crédito o débito; los pagos son procesados externamente por pasarelas de pago seguras y certificadas.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gold" />
                3. Uso de la Información
              </h3>
              <p>
                Tus datos personales se utilizarán única y exclusivamente para:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                <li>Procesar y despachar tus órdenes de compra.</li>
                <li>Brindar soporte personalizado a través de nuestro Crown Asistente o WhatsApp.</li>
                <li>Informar sobre novedades del catálogo o promociones vigentes (previa autorización).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-gold" />
                4. Tus Derechos (Habeas Data)
              </h3>
              <p>
                Como titular de los datos, tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación de tu información personal de nuestras bases de datos en cualquier momento. Para ejercer estos derechos, envíanos una solicitud a **urbancrowncol4@gmail.com**.
              </p>
            </div>
          </div>

          <div className="text-center bg-secondary/30 rounded-3xl p-8 border border-border/30">
            <h3 className="text-xl font-bold mb-3">¿Tienes alguna duda sobre tus datos?</h3>
            <p className="text-muted-foreground mb-6">
              Contáctanos de forma directa al correo de soporte técnico y servicio al cliente de Urban Crown.
            </p>
            <a 
              href="mailto:urbancrowncol4@gmail.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
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
