"use client"

import { motion } from "framer-motion"
import { Scale, ShieldCheck } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function TerminosPage() {
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
            <Scale className="w-12 h-12 text-gold-action mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold uppercase">TÉRMINOS Y CONDICIONES</h1>
            <p className="text-titanium mt-4 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Regulaciones de uso, condiciones de compra y políticas legales de Urban Crown.
            </p>
          </motion.div>

          <div className="space-y-8 text-titanium leading-relaxed bg-carbon p-8 rounded-none border border-steel/30 shadow-2xl mb-12 relative font-sans font-light">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-action" />
            
            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gold-action" />
                1. Generalidades
              </h3>
              <p className="text-xs md:text-sm">
                Este sitio web es operado por Urban Crown. Al visitar nuestro sitio y comprar nuestros productos, aceptas quedar vinculado por los siguientes términos y condiciones de servicio.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gold-action" />
                2. Precios y Pagos
              </h3>
              <p className="text-xs md:text-sm">
                Todos los precios expuestos en nuestro catálogo están expresados en Pesos Colombianos (COP). Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Los métodos de pago autorizados incluyen pasarela de pago seguro en línea y pago contraentrega en efectivo coordinado con Interrapidísimo.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gold-action" />
                3. Envíos y Logística
              </h3>
              <p className="text-xs md:text-sm">
                Realizamos despachos nacionales de forma exclusiva a través de Interrapidísimo. El plazo estimado para la entrega es de 3 a 5 días hábiles a partir de la confirmación del despacho. El costo de envío es gratuito para compras superiores a $200.000 COP.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gold-action" />
                4. Cambios y Garantías
              </h3>
              <p className="text-xs md:text-sm">
                Ofrecemos una Garantía de Satisfacción de 2 días hábiles desde la recepción de la mercancía. Los productos deben estar con sus etiquetas puestas, empaque original y sin signos de uso para ser elegibles para cambios. El primer cambio por talla, referencia o color es gratis.
              </p>
            </div>

            <div>
              <h3 className="text-base font-display font-semibold text-white-diamond mb-3 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-gold-action" />
                5. Propiedad Intelectual
              </h3>
              <p className="text-xs md:text-sm">
                Todo el contenido disponible en este sitio, incluidos textos, gráficos, logotipos, imágenes y códigos de programación, es propiedad exclusiva de Urban Crown y está protegido por las leyes de propiedad intelectual internacionales y de la República de Colombia.
              </p>
            </div>
          </div>

          <div className="text-center bg-carbon rounded-none p-8 border border-steel/30 shadow-2xl">
            <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">¿Tienes alguna pregunta legal o sobre compras?</h3>
            <p className="text-titanium text-xs md:text-sm mb-6 max-w-md mx-auto font-sans font-light leading-relaxed">
              Comunícate con nosotros por correo electrónico a **urbancrowncol4@gmail.com** o escribiendo a nuestro WhatsApp.
            </p>
            <a 
              href="mailto:urbancrowncol4@gmail.com" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-action hover:bg-gold-action/90 text-obsidian font-bold text-xs uppercase tracking-widest rounded-none shadow-md transition-all"
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
