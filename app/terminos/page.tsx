"use client"

import { motion } from "framer-motion"
import { Scale, ShieldAlert, ShieldCheck } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

export default function TerminosPage() {
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
            <Scale className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-black text-gradient-gold">TÉRMINOS Y CONDICIONES</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Regulaciones de uso, condiciones de compra y políticas legales de Urban Crown.
            </p>
          </motion.div>

          <div className="space-y-8 text-muted-foreground leading-relaxed bg-card/30 p-8 rounded-3xl border border-border/40 backdrop-blur mb-12">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                1. Generalidades
              </h3>
              <p>
                Este sitio web es operado por Urban Crown. Al visitar nuestro sitio y comprar nuestros productos, aceptas quedar vinculado por los siguientes términos y condiciones de servicio.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                2. Precios y Pagos
              </h3>
              <p>
                Todos los precios expuestos en nuestro catálogo están expresados en Pesos Colombianos (COP). Nos reservamos el derecho de modificar los precios en cualquier momento sin previo aviso. Los métodos de pago autorizados incluyen pasarela de pago seguro en línea y pago contraentrega en efectivo coordinado con Interrapidísimo.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                3. Envíos y Logística
              </h3>
              <p>
                Realizamos despachos nacionales de forma exclusiva a través de Interrapidísimo. El plazo estimado para la entrega es de 3 a 5 días hábiles a partir de la confirmación del despacho. El costo de envío es gratuito para compras superiores a $200.000 COP.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                4. Cambios y Garantías
              </h3>
              <p>
                Ofrecemos una Garantía de Satisfacción de 5 días hábiles desde la recepción de la mercancía. Los productos deben estar con sus etiquetas puestas, empaque original y sin signos de uso para ser elegibles para cambios. El primer cambio por talla, referencia o color es gratis.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                5. Propiedad Intelectual
              </h3>
              <p>
                Todo el contenido disponible en este sitio, incluidos textos, gráficos, logotipos, imágenes y códigos de programación, es propiedad exclusiva de Urban Crown y está protegido por las leyes de propiedad intelectual internacionales y de la República de Colombia.
              </p>
            </div>
          </div>

          <div className="text-center bg-secondary/30 rounded-3xl p-8 border border-border/30">
            <h3 className="text-xl font-bold mb-3">¿Tienes alguna pregunta legal o sobre compras?</h3>
            <p className="text-muted-foreground mb-6">
              Comunícate con nosotros por correo electrónico a **urbancrowncol4@gmail.com** o escribiendo a nuestro WhatsApp.
            </p>
            <a 
              href="mailto:urbancrowncol4@gmail.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
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
