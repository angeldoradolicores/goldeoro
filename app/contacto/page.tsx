"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Instagram } from "lucide-react"
import SparklesUI from '@/components/sparkles'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-obsidian border-b border-steel/10">
        <div className="absolute inset-0 z-0">
          {/* Imagen de Hinchada/Banderas de Fondo */}
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&q=80"
            alt="Estadio y Banderas"
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
          />
          {/* Gradientes más fuertes con los colores de la bandera de Colombia */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `
                radial-gradient(circle at 50% 0%, rgba(252,209,22,0.15) 0%, transparent 50%),
                radial-gradient(circle at 0% 50%, rgba(0,56,147,0.15) 0%, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(206,17,38,0.15) 0%, transparent 50%),
                linear-gradient(to bottom, #080b11 0%, rgba(8,11,17,0.85) 50%, #080b11 100%)
              `,
            }}
          />
          <SparklesUI extra={1} />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6 drop-shadow-lg">⚽</div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white-diamond mb-6 uppercase">
              CONTACTO
            </h1>
            <p className="text-sm md:text-base text-titanium max-w-xl mx-auto leading-relaxed font-sans font-light tracking-wide">
              Estamos aquí para brindarte asistencia personalizada. Envíanos un mensaje y nuestro equipo de soporte exclusivo te responderá a la brevedad.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-obsidian">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-carbon border border-steel/30 rounded-none p-8 shadow-2xl"
            >
              <h2 className="text-lg font-display font-semibold text-white-diamond mb-8 uppercase tracking-widest">Envíanos un mensaje</h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      className="h-12 bg-graphite border-steel/30 rounded-none focus:border-gold-action text-white-diamond placeholder:text-steel text-sm font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Apellido</label>
                    <Input
                      placeholder="Tu apellido"
                      className="h-12 bg-graphite border-steel/30 rounded-none focus:border-gold-action text-white-diamond placeholder:text-steel text-sm font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    className="h-12 bg-graphite border-steel/30 rounded-none focus:border-gold-action text-white-diamond placeholder:text-steel text-sm font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Teléfono</label>
                  <Input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    className="h-12 bg-graphite border-steel/30 rounded-none focus:border-gold-action text-white-diamond placeholder:text-steel text-sm font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Asunto</label>
                  <select className="w-full h-12 px-4 bg-graphite border border-steel/30 rounded-none focus:outline-none focus:border-gold-action text-white-diamond text-sm font-sans">
                    <option value="" className="bg-graphite text-white-diamond">Selecciona un asunto</option>
                    <option value="pedido" className="bg-graphite text-white-diamond">Consulta sobre pedido</option>
                    <option value="producto" className="bg-graphite text-white-diamond">Información de producto</option>
                    <option value="devolucion" className="bg-graphite text-white-diamond">Devolución o cambio</option>
                    <option value="mayorista" className="bg-graphite text-white-diamond">Ventas mayoristas</option>
                    <option value="otro" className="bg-graphite text-white-diamond">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-titanium">Mensaje</label>
                  <textarea
                    placeholder="Escribe tu mensaje aquí..."
                    rows={5}
                    className="w-full px-4 py-3 bg-graphite border border-steel/30 rounded-none focus:outline-none focus:border-gold-action text-white-diamond placeholder:text-steel text-sm font-sans resize-none"
                  />
                </div>

                <Button className="w-full h-14 btn-luxury text-xs font-semibold uppercase tracking-[0.25em] rounded-none">
                  Enviar Mensaje
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Info Cards */}
              <div className="flex overflow-x-auto snap-x snap-mandatory lg:block lg:space-y-4 gap-4 pb-4 hide-scrollbar">
                {[
                  { icon: Phone, title: "Teléfono de Soporte", info: "+57 300 657 7286" },
                  { icon: Mail, title: "Correo Electrónico", info: "goldeorocoll@gmail.com" },
                  { icon: Clock, title: "Horario de Atención", info: "Lun - Vie: 8:00 AM - 6:00 PM | Sáb: 9:00 AM - 7:00 PM" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="shrink-0 snap-center w-[85vw] lg:w-auto flex items-start gap-4 p-6 bg-carbon border border-steel/30 rounded-none hover:border-gold-action/30 transition-colors shadow-lg"
                  >
                    <div className="w-12 h-12 bg-graphite border border-steel/30 rounded-none flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-gold-action" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-semibold text-white-diamond uppercase tracking-wider mb-1">{item.title}</h3>
                      <p className="text-titanium text-sm font-sans font-light">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="p-6 bg-carbon border border-steel/30 rounded-none shadow-lg">
                <h3 className="font-display text-sm font-semibold text-white-diamond mb-4 uppercase tracking-wider">Síguenos en Redes</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Instagram, label: "Instagram", href: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-graphite border border-steel/30 rounded-none flex items-center justify-center hover:bg-gold-action/5 hover:border-gold-action/50 transition-all group"
                    >
                      <social.icon className="w-5 h-5 text-chrome group-hover:text-gold-action transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-carbon border-t border-steel/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-white-diamond uppercase">Preguntas Frecuentes</h2>
            <p className="text-titanium text-sm font-sans font-light mt-2">Encuentra respuestas inmediatas a las dudas más comunes.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "¿Cuánto tarda el envío?", a: "El tiempo estimado de entrega es de 3 a 5 días hábiles a nivel nacional, dependiendo de tu ubicación geográfica." },
              { q: "¿Puedo realizar cambios o devoluciones?", a: "Sí, dispones de hasta 3 días para solicitar cambios o devoluciones, siempre y cuando la pieza se encuentre en perfectas condiciones y con sus etiquetas originales." },
              { q: "¿Ofrecen envíos internacionales?", a: "Por el momento realizamos envíos de forma exclusiva en todo el territorio de la República de Colombia." },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-6 bg-graphite border border-steel/30 rounded-none hover:border-gold-action/30 transition-colors shadow-lg"
              >
                <h3 className="font-display text-sm font-semibold text-white-diamond mb-2 uppercase tracking-wide">{faq.q}</h3>
                <p className="text-titanium text-xs md:text-sm font-sans font-light leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
