"use client"

import { motion } from "framer-motion"
import { Crown, MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Crown className="w-16 h-16 text-gold mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              CONTACTA<span className="text-gold">NOS</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Estamos aqui para ayudarte. Envianos un mensaje y te responderemos lo antes posible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card/50 backdrop-blur border border-border rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Envianos un mensaje</h2>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nombre</label>
                    <Input
                      placeholder="Tu nombre"
                      className="h-14 bg-background/50 border-border rounded-xl focus:border-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Apellido</label>
                    <Input
                      placeholder="Tu apellido"
                      className="h-14 bg-background/50 border-border rounded-xl focus:border-gold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    className="h-14 bg-background/50 border-border rounded-xl focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Telefono</label>
                  <Input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    className="h-14 bg-background/50 border-border rounded-xl focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Asunto</label>
                  <select className="w-full h-14 px-4 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-gold text-foreground">
                    <option value="">Selecciona un asunto</option>
                    <option value="pedido">Consulta sobre pedido</option>
                    <option value="producto">Informacion de producto</option>
                    <option value="devolucion">Devolucion o cambio</option>
                    <option value="mayorista">Ventas mayoristas</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mensaje</label>
                  <textarea
                    placeholder="Escribe tu mensaje aqui..."
                    rows={5}
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:border-gold text-foreground resize-none"
                  />
                </div>

                <Button className="w-full h-14 bg-gold hover:bg-gold/90 text-background font-semibold rounded-xl">
                  Enviar mensaje
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Info Cards */}
              <div className="space-y-4">
                {[
                  { icon: Phone, title: "Telefono", info: "3108999049" },
                  { icon: Mail, title: "Email", info: "urbancrowncol4@gmail.com" },
                  { icon: Clock, title: "Horario", info: "Lun - Vie: 8am - 6pm | Sab: 9am - 7pm" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-6 bg-card/50 backdrop-blur border border-border rounded-2xl hover:border-gold/30 transition-colors"
                  >
                    <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="p-6 bg-card/50 backdrop-blur border border-border rounded-2xl">
                <h3 className="font-semibold text-foreground mb-4">Siguenos en redes</h3>
                <div className="flex gap-4">
                  {[
                    { icon: Instagram, label: "Instagram", href: "#" },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="w-12 h-12 bg-background/50 border border-border rounded-xl flex items-center justify-center hover:bg-gold/20 hover:border-gold/30 transition-all group"
                    >
                      <social.icon className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                    </a>
                  ))}
                </div>
              </div>


            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">Encuentra respuestas rapidas a las dudas mas comunes</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "Cuanto tarda el envio?", a: "El tiempo de envio es de 2-5 dias habiles dependiendo de tu ubicacion." },
              { q: "Puedo hacer devoluciones?", a: "Si, tienes 30 dias para devolver tu producto en perfectas condiciones." },
              { q: "Tienen tienda fisica?", a: "Si, nuestra tienda esta ubicada en Bogota. Visitanos!" },
              { q: "Ofrecen envio internacional?", a: "Actualmente solo realizamos envios dentro de Colombia." },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card/50 border border-border rounded-2xl hover:border-gold/30 transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
