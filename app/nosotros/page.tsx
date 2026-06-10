"use client"

import { motion } from "framer-motion"
import { Crown, Target, Award, Shield, Eye, CheckCircle } from "lucide-react"
import SparklesUI from '@/components/sparkles'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-obsidian border-b border-steel/10">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(200,164,77,0.02)_0%,transparent_70%)] animate-pulse" />
          <SparklesUI extra={1} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Crown className="w-16 h-16 text-gold-action mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 text-gradient-gold uppercase">
              URBAN CROWN
            </h1>
            <p className="text-sm md:text-base text-titanium uppercase tracking-[0.3em] font-sans font-light">
              Donde el lujo y la calle se encuentran
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-24 relative bg-obsidian">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-carbon p-8 md:p-12 border border-steel/30 rounded-none relative overflow-hidden shadow-2xl"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-action mb-3 block">Nuestra Historia</span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-white-diamond mb-6 uppercase">MANIFIESTO</h2>
            <div className="space-y-6 text-titanium text-sm md:text-base leading-relaxed font-sans font-light">
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
      <section className="py-24 bg-carbon border-y border-steel/20 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mision */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-8 bg-graphite border border-steel/30 rounded-none flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="w-10 h-10 bg-carbon border border-steel/40 rounded-none flex items-center justify-center mb-6">
                  <Target className="w-5 h-5 text-gold-action" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-action mb-2">Nuestra Misión</h3>
                <h4 className="text-xl md:text-2xl font-display font-semibold text-white-diamond mb-4">ELEVAR EL ESTILO URBANO</h4>
                <p className="text-sm text-titanium leading-relaxed font-light">
                  En Urban Crown trabajamos para ofrecer gorras y accesorios que representen la combinación perfecta entre la elegancia contemporánea y la esencia de la cultura urbana.
                </p>
                <p className="text-sm text-titanium leading-relaxed mt-4 font-light">
                  Nuestra misión es brindar productos cuidadosamente seleccionados que permitan a cada cliente expresar su personalidad con autenticidad, confianza y distinción.
                </p>
              </div>
              <p className="text-gold-action font-medium italic mt-8 text-xs tracking-wider font-display">"Creemos que el verdadero estilo no sigue tendencias; las define."</p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-8 bg-graphite border border-steel/30 rounded-none flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="w-10 h-10 bg-carbon border border-steel/40 rounded-none flex items-center justify-center mb-6">
                  <Eye className="w-5 h-5 text-chrome" />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-chrome mb-2">Nuestra Visión</h3>
                <h4 className="text-xl md:text-2xl font-display font-semibold text-white-diamond mb-4">LIDERAR LA CULTURA STREETWEAR</h4>
                <p className="text-sm text-titanium leading-relaxed font-light">
                  Convertirnos en una marca referente de moda urbana en Colombia, reconocida por la calidad de nuestros productos, la confianza de nuestros clientes y la capacidad de fusionar el lujo contemporáneo con la esencia de la cultura streetwear.
                </p>
              </div>
              <div className="border-t border-steel/20 pt-6 mt-8">
                <p className="text-xs text-chrome font-semibold flex items-center gap-2 uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4 text-gold-action" /> MARCA REFERENTE EN COLOMBIA
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nuestros Valores */}
      <section className="py-24 bg-obsidian">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-action mb-2 block">Los pilares de la marca</span>
            <h2 className="text-3xl font-display font-bold text-white-diamond uppercase">Nuestros Valores</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "CALIDAD ABSOLUTA", desc: "Seleccionamos productos con altos estándares de diseño y fabricación para garantizar una durabilidad y estética impecables.", icon: Award },
              { title: "AUTENTICIDAD", desc: "Creemos en la importancia de expresar una identidad propia y honesta a través de cada detalle.", icon: Shield },
              { title: "EXCLUSIVIDAD", desc: "Buscamos modelos y diseños únicos que destaquen por su carácter exclusivo y diferenciación.", icon: Crown },
              { title: "CONFIANZA", desc: "Construimos relaciones duraderas basadas en la transparencia, responsabilidad y un servicio al cliente impecable.", icon: Target },
              { title: "EVOLUCIÓN", desc: "Nos mantenemos a la vanguardia de la moda para ofrecer propuestas alineadas con la cultura urbana global.", icon: Eye }
            ].map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  className="p-8 bg-carbon border border-steel/30 rounded-none shadow-xl"
                >
                  <Icon className="w-6 h-6 text-gold-action mb-4" />
                  <h4 className="text-sm font-display font-semibold mb-2 text-white-diamond tracking-wider uppercase">{v.title}</h4>
                  <p className="text-titanium text-xs leading-relaxed font-sans font-light">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Por qué elegir Urban Crown */}
      <section className="py-24 bg-carbon border-t border-steel/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-white-diamond uppercase">¿Por qué elegir Urban Crown?</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Diseños Seleccionados", desc: "Una colección pensada para quienes valoran la calidad, el estilo y la exclusividad urbana." },
              { title: "Atención Premium", desc: "Brindamos asesoría cercana y personalizada para ayudarte a encontrar la pieza ideal." },
              { title: "Envíos Certificados", desc: "Realizamos envíos a nivel nacional con seguimiento y acompañamiento total en el proceso." },
              { title: "Satisfacción Garantizada", desc: "Nos enfocamos en ofrecer un servicio impecable y una atención orientada a la perfección." },
              { title: "Estilo Distintivo", desc: "Cada producto forma parte de una propuesta de diseño para quienes buscan diferenciarse con clase." }
            ].map((choice, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                className="p-6 bg-graphite border border-steel/30 rounded-none hover:border-gold-action/30 transition-all duration-300"
              >
                <h4 className="font-display font-semibold text-white-diamond text-sm mb-2 flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-gold-action" /> {choice.title}
                </h4>
                <p className="text-titanium text-xs leading-relaxed font-sans font-light">{choice.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="py-20 text-center border-t border-steel/20 relative overflow-hidden bg-obsidian">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-display font-bold text-gold-action uppercase tracking-[0.3em] mb-3">URBAN CROWN</h3>
            <p className="text-sm text-titanium font-sans font-light uppercase tracking-widest">Donde el lujo y la calle se encuentran.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
