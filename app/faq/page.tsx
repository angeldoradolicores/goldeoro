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
    answer: "¡No te preocupes por la talla! En Urban Crown seleccionamos gorras con sistemas de ajuste premium (Snapback, Strapback o Hebilla ajustable), lo que garantiza que se adaptan de forma perfecta a cualquier contorno de cabeza sin necesidad de elegir tallas."
  },
  {
    question: "¿Cuánto demora en llegar mi pedido?",
    answer: "Nuestros despachos se realizan a través de Interrapidísimo. Los tiempos de entrega oscilan entre 3 y 5 días hábiles a cualquier rincón de Colombia una vez confirmado el pedido."
  },
  {
    question: "¿Puedo pagar al recibir mi paquete?",
    answer: "¡Sí, totalmente! Ofrecemos la opción de Pago Contraentrega en alianza con Interrapidísimo. Pagas en efectivo directamente al transportador cuando recibas tu gorra en la puerta de tu casa."
  },
  {
    question: "¿Los envíos son gratis?",
    answer: "Ofrecemos envío gratis automático para cualquier compra superior a $200.000 COP. Para compras inferiores, el envío tiene una tarifa plana de $17.000 COP."
  },

  {
    question: "¿Cómo me contacto si tengo un inconveniente?",
    answer: "Puedes comunicarte directamente con nuestro asesor personal al WhatsApp 3108999049 o por correo electrónico a urbancrowncol4@gmail.com. Estamos listos para ayudarte al instante."
  }
]

function FAQCard({ faq, index }: { faq: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-border/50 py-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-2 font-bold text-lg hover:text-gold transition-colors"
      >
        <span>{faq.question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gold" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed py-2 pl-1">
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <HelpCircle className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-black text-gradient-gold">PREGUNTAS FRECUENTES</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Resuelve tus dudas sobre envíos, tallas, pagos y garantías al instante.
            </p>
          </motion.div>

          <div className="bg-card/40 rounded-3xl p-6 md:p-8 border border-border/40 backdrop-blur mb-12">
            {faqs.map((faq, index) => (
              <FAQCard key={index} faq={faq} index={index} />
            ))}
          </div>

          <div className="text-center bg-secondary/30 rounded-3xl p-8 border border-border/30">
            <h3 className="text-xl font-bold mb-3">¿Aún tienes dudas?</h3>
            <p className="text-muted-foreground mb-6">
              Nuestro Crown Asistente o nuestro asesor por WhatsApp están disponibles para asesorarte en tu compra.
            </p>
            <a
              href="https://wa.me/573108999049"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold hover:bg-gold/90 text-background font-bold rounded-full transition-colors"
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
