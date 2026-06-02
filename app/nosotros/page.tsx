"use client"

import { motion } from "framer-motion"
import { Crown, Target, Heart, Award, Users, Truck, Shield, Star } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const values = [
  { icon: Award, title: "Calidad Premium", description: "Solo trabajamos con los mejores materiales y marcas del mercado" },
  { icon: Heart, title: "Pasion por el Estilo", description: "Cada gorra es seleccionada con cuidado para nuestros clientes" },
  { icon: Users, title: "Comunidad", description: "Somos mas que una tienda, somos una familia de amantes del streetwear" },
  { icon: Shield, title: "Autenticidad", description: "100% productos originales con garantia de autenticidad" },
]

const stats = [
  { value: "10K+", label: "Clientes satisfechos" },
  { value: "500+", label: "Gorras vendidas" },
  { value: "50+", label: "Marcas exclusivas" },
  { value: "4.9", label: "Calificacion promedio" },
]

const team = [
  { name: "Carlos Rodriguez", role: "Fundador & CEO", image: "/placeholder.svg" },
  { name: "Maria Gonzalez", role: "Directora Creativa", image: "/placeholder.svg" },
  { name: "Andres Lopez", role: "Jefe de Operaciones", image: "/placeholder.svg" },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Crown className="w-20 h-20 text-gold mx-auto mb-8" />
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              NUESTRA<br />
              <span className="text-gold">HISTORIA</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Luxury Hats nacio de la pasion por el streetwear y la cultura urbana. 
              Desde 2020, nos hemos dedicado a traer las gorras mas exclusivas y de 
              mayor calidad para los verdaderos amantes del estilo urbano en Colombia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 text-gold mb-4">
                <Target className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Nuestra Mision</span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Elevando el estilo urbano a otro nivel
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                En Luxury Hats creemos que una gorra es mas que un accesorio - es una 
                declaracion de estilo, una expresion de personalidad. Nuestra mision es 
                proporcionar a nuestros clientes las gorras mas exclusivas del mercado, 
                con un servicio excepcional y una experiencia de compra premium.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Trabajamos directamente con las mejores marcas y distribuidores para 
                garantizar la autenticidad de cada producto que vendemos. Cada gorra 
                que llega a tus manos ha pasado por un riguroso control de calidad.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-gold/20 via-gold/10 to-transparent rounded-3xl border border-gold/20 flex items-center justify-center">
                <Crown className="w-32 h-32 text-gold/30" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gold/10 rounded-2xl border border-gold/20 flex items-center justify-center">
                <Star className="w-16 h-16 text-gold/40" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestros Valores</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Los principios que guian cada decision que tomamos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-card/50 backdrop-blur border border-border rounded-3xl hover:border-gold/30 transition-all group text-center"
              >
                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-bold text-gold mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Nuestro Equipo</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Las personas detras de Luxury Hats
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                  <Users className="w-16 h-16 text-gold/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-gold">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">Por que elegirnos?</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Envio Rapido", description: "Entrega en 2-5 dias habiles a todo Colombia con seguimiento en tiempo real" },
              { icon: Shield, title: "100% Autentico", description: "Garantizamos la autenticidad de todos nuestros productos" },
              { icon: Heart, title: "Atencion Premium", description: "Soporte personalizado para resolver todas tus dudas" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-card/50 border border-border rounded-2xl hover:border-gold/30 transition-colors"
              >
                <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
