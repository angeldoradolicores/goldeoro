"use client"

import { motion } from "framer-motion"
import { Crown, Target, Heart, Award, Shield, Target as VisionIcon, CheckCircle, ChevronRight, Truck } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-3xl animate-pulse" />
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-20 h-20 text-gold mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-gradient-neon uppercase">
              Urban Crown
            </h1>
            <p className="text-xl md:text-2xl text-gold font-medium tracking-wide uppercase">
              Donde el lujo y la calle se encuentran
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 rounded-3xl border border-border/60 hover:border-gold/30 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Nuestra Historia</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6">Urban Crown</h2>
            <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed">
              <p>
                Urban Crown nace de la pasión por la moda urbana y la búsqueda constante de productos que combinen diseño, exclusividad y personalidad.
              </p>
              <p>
                Entendemos que una gorra es mucho más que un accesorio. Es una pieza que refleja identidad, confianza y estilo. Por eso, seleccionamos cuidadosamente cada producto para ofrecer opciones que destaquen por su calidad, estética y carácter.
              </p>
              <p>
                Nuestro compromiso es acercar a nuestros clientes las últimas tendencias del streetwear, creando una experiencia de compra basada en la confianza, el buen servicio y la atención a los detalles.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Nuestra Misión & Visión */}
      <section className="py-16 bg-card/20 border-y border-border/30 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 bg-card/40 border border-border/40 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-2">Nuestra Misión</h3>
                <h4 className="text-2xl font-bold text-foreground mb-4">Elevar el estilo urbano a un nuevo nivel</h4>
                <p className="text-muted-foreground leading-relaxed">
                  En Urban Crown trabajamos para ofrecer gorras y accesorios que representen la combinación perfecta entre la elegancia contemporánea y la esencia de la cultura urbana.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Nuestra misión es brindar productos cuidadosamente seleccionados que permitan a cada cliente expresar su personalidad con autenticidad, confianza y distinción.
                </p>
              </div>
              <p className="text-gold font-semibold italic mt-6 text-sm">"Creemos que el verdadero estilo no sigue tendencias; las define."</p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 bg-card/40 border border-border/40 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl flex items-center justify-center mb-6">
                  <VisionIcon className="w-6 h-6 text-neon-cyan" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neon-cyan mb-2">Nuestra Visión</h3>
                <h4 className="text-2xl font-bold text-foreground mb-4">Liderar la cultura streetwear</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Convertirnos en una marca referente de moda urbana en Colombia, reconocida por la calidad de nuestros productos, la confianza de nuestros clientes y la capacidad de fusionar el lujo contemporáneo con la esencia de la cultura streetwear.
                </p>
              </div>
              <div className="border-t border-border/40 pt-6 mt-6">
                <p className="text-sm text-muted-foreground font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-cyan" /> Marca referente en Colombia
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gold mb-2 block">Los pilares de Urban Crown</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Nuestros Valores</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Calidad", desc: "Seleccionamos productos con altos estándares de diseño y fabricación para garantizar una experiencia satisfactoria.", color: "border-gold/30 bg-gold/5 text-gold" },
              { title: "Autenticidad", desc: "Creemos en la importancia de expresar una identidad propia a través de cada detalle.", color: "border-neon-pink/30 bg-neon-pink/5 text-neon-pink" },
              { title: "Exclusividad", desc: "Buscamos modelos y diseños que destaquen por su carácter y diferenciación.", color: "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan" },
              { title: "Confianza", desc: "Construimos relaciones duraderas con nuestros clientes mediante transparencia, responsabilidad y excelente servicio.", color: "border-neon-green/30 bg-neon-green/5 text-neon-green" },
              { title: "Innovación", desc: "Nos mantenemos en constante evolución para ofrecer propuestas alineadas con las nuevas tendencias de la moda urbana.", color: "border-neon-yellow/30 bg-neon-yellow/5 text-neon-yellow" }
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`p-6 border rounded-2xl ${v.color.split(' ').slice(0, 2).join(' ')}`}
              >
                <h4 className={`text-lg font-bold mb-2 ${v.color.split(' ').pop()}`}>{v.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué elegir Urban Crown */}
      <section className="py-20 bg-card/10 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">¿Por qué elegir Urban Crown?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Diseños Seleccionados", desc: "Una colección pensada para quienes valoran la calidad, el estilo y la exclusividad." },
              { title: "Atención Personalizada", desc: "Brindamos asesoría cercana para ayudarte a encontrar el producto ideal." },
              { title: "Envíos Seguros", desc: "Realizamos envíos a nivel nacional con seguimiento y acompañamiento durante el proceso." },
              { title: "Experiencia de Compra Confiable", desc: "Nos enfocamos en ofrecer un servicio transparente y una atención orientada a la satisfacción de nuestros clientes." },
              { title: "Estilo que Destaca", desc: "Cada producto forma parte de una propuesta diseñada para quienes buscan diferenciarse sin perder autenticidad." }
            ].map((choice, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-card/50 border border-border/50 rounded-2xl hover:border-gold/30 transition-all duration-300"
              >
                <h4 className="font-bold text-foreground text-lg mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" /> {choice.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{choice.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="py-16 text-center border-t border-border/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-2xl font-bold text-gold uppercase tracking-widest mb-2">Urban Crown</h3>
            <p className="text-lg text-muted-foreground font-semibold">Donde el lujo y la calle se encuentran.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
