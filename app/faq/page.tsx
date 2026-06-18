"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"


interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "¿Cómo sé qué talla elegir?",
    answer: "¡No te preocupes por las tallas! En Gol de Oro trabajamos con camisetas en tallas S, M, L, XL y XXL. Nuestras fichas de producto incluyen medidas detalladas y guías de tallas para que encuentres la tuya fácilmente. En caso de dudas, consúltanos por WhatsApp y te asesoramos con gusto."
  },
  {
    question: "¿Cuánto demora en llegar mi pedido?",
    answer: "Nuestros despachos se realizan a través de Interrapidísimo. Los tiempos de entrega oscilan entre 3 y 5 días hábiles a cualquier rincón de Colombia una vez confirmado el pedido."
  },
  {
    question: "¿Puedo pagar al recibir mi paquete?",
    answer: "¡Sí, totalmente! Ofrecemos la opción de Pago Contraentrega en alianza con Interrapidísimo. Pagas en efectivo directamente al transportador cuando recibas tu producto en la puerta de tu casa."
  },
  {
    question: "¿Los envíos son gratis?",
    answer: "Ofrecemos envío gratis automático para cualquier compra superior a $300.000 COP. Para compras inferiores, el envío tiene una tarifa plana de $17.000 COP."
  },
  {
    question: "¿Cómo me contacto si tengo un inconveniente?",
    answer: "Puedes comunicarte directamente con nuestro asesor personal al WhatsApp +57 300 657 7286 o por correo electrónico a goldeocoll@gmailcom. Estamos listos para ayudarte al instante."
  }
]

function FAQCard({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6 }}
      className="border-b border-steel/20 py-5 last:border-b-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-2 font-display font-medium text-sm md:text-base text-white-diamond hover:text-gold-action transition-colors uppercase tracking-wide"
      >
        <span>{faq.question}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gold-action" /> : <ChevronDown className="w-4 h-4 text-titanium" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-titanium text-xs md:text-sm leading-relaxed py-3 pl-1 font-sans font-light">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-gold-action mx-auto mb-4" />
            <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold uppercase">PREGUNTAS FRECUENTES</h1>
            <p className="text-titanium mt-4 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto leading-relaxed">
              Resuelve tus dudas sobre envíos, tallas, pagos y garantías al instante.
            </p>
          </motion.div>

          <div className="bg-carbon border border-steel/30 rounded-none p-6 md:p-8 shadow-2xl mb-12 relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold-action" />
            {faqs.map((faq, index) => (
              <FAQCard key={index} faq={faq} index={index} />
            ))}
          </div>

          <div className="text-center bg-carbon rounded-none p-8 border border-steel/30 shadow-2xl">
            <h3 className="text-lg font-display font-semibold mb-3 text-white-diamond uppercase tracking-wide">¿Aún tienes dudas?</h3>
            <p className="text-titanium text-xs md:text-sm mb-6 max-w-md mx-auto font-sans font-light leading-relaxed">
              Nuestro asistente o nuestro asesor por WhatsApp están disponibles para brindarte una atención preferencial.
            </p>
            <a
              href="https://wa.me/573006577286"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold-action hover:bg-gold-action/90 text-obsidian font-bold text-xs uppercase tracking-widest rounded-none shadow-md transition-all"
            >
              Chatear con un asesor
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
