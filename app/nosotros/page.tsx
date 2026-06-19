"use client"

import { motion } from "framer-motion"
import { Crown, Target, Award, Shield, Eye, CheckCircle, Trophy, Star, Flag } from "lucide-react"
import SparklesUI from '@/components/sparkles'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 relative overflow-hidden bg-obsidian border-b border-steel/10">
        {/* Tricolor accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 flex z-10">
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#003893]" />
          <div className="flex-1 bg-[#CE1126]" />
        </div>
        <div className="absolute inset-0 z-0">
          {/* Imagen de Hinchada/Banderas de Fondo */}
          <img
            src="/gol_oro.png"
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

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 500 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-10 h-10 text-gold-action" />
              <span className="text-4xl">⚽</span>
              <Trophy className="w-10 h-10 text-gold-action" />
            </div> */}
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 text-gradient-gold uppercase">
              GOL DE ORO
            </h1>
            <p className="text-sm md:text-base text-titanium uppercase tracking-[0.3em] font-sans font-light">
              Pasión por el Fútbol · Orgullo Colombiano · Mundial 2026
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="w-5 h-5 rounded-sm bg-[#FCD116] shadow-md" />
              <span className="w-5 h-5 rounded-sm bg-[#003893] shadow-md" />
              <span className="w-5 h-5 rounded-sm bg-[#CE1126] shadow-md" />
            </div>
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
                Gol de Oro nació de la pasión genuina por el fútbol y el orgullo de ser colombiano. Somos una tienda especializada en camisetas 1.1, álbum Panini, cajas de sobres y productos exclusivos de la Selección Colombia.
              </p>
              <p>
                Entendemos que una camiseta de Colombia es mucho más que una prenda. Es una pieza que refleja identidad, orgullo nacional y amor por el deporte. Por eso seleccionamos cuidadosamente cada producto para garantizar autenticidad, calidad y emoción en cada compra.
              </p>
              <p>
                Con el Mundial 2026 en el horizonte, nuestro compromiso es acompañar a cada hincha colombiano con los mejores productos oficiales, coleccionables y artículos de la Tricolor — creando una experiencia de compra digna de campeones.
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
                <h4 className="text-xl md:text-2xl font-display font-semibold text-white-diamond mb-4">ENCENDER LA PASIÓN FUTBOLERA</h4>
                <p className="text-sm text-titanium leading-relaxed font-light">
                  En Gol de Oro trabajamos para llevar a cada hincha colombiano los mejores productos del fútbol: camisetas oficiales 1.1, álbum Panini, cajas de sobres y artículos exclusivos de la Selección.
                </p>
                <p className="text-sm text-titanium leading-relaxed mt-4 font-light">
                  Nuestra misión es ser el puente entre el hincha y su pasión, ofreciendo productos auténticos que celebren el orgullo de ser colombiano y la emoción del Mundial 2026.
                </p>
              </div>
              <p className="text-gold-action font-medium italic mt-8 text-xs tracking-wider font-display">"Donde hay fútbol, hay Gol de Oro."</p>
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
                <h4 className="text-xl md:text-2xl font-display font-semibold text-white-diamond mb-4">SER LA TIENDA #1 DE FÚTBOL EN COLOMBIA</h4>
                <p className="text-sm text-titanium leading-relaxed font-light">
                  Ser la tienda de referencia de fútbol y coleccionismo en Colombia: reconocida por la autenticidad de nuestros productos, la pasión por la Tricolor y la capacidad de conectar a cada hincha con su amor por el deporte más hermoso del mundo.
                </p>
              </div>
              <div className="border-t border-steel/20 pt-6 mt-8">
                <p className="text-xs text-chrome font-semibold flex items-center gap-2 uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4 text-gold-action" /> TIENDA OFICIAL FÚTBOL COLOMBIA 2026
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

          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 hide-scrollbar">
            {[
              { title: "PASIÓN FUTBOLERA", desc: "El fútbol es mucho más que un deporte; es emoción, identidad y orgullo. Cada producto refleja esa pasión por la pelota.", icon: Trophy },
              { title: "AUTENTICIDAD", desc: "Solo ofrecemos productos auténticos y oficiales. Camisetas 1.1, álbum Panini y coleccionables que cumplen con los más altos estándares.", icon: Shield },
              { title: "ORGULLO COLOMBIANO", desc: "La Selección Colombia es nuestra mayor inspiración. Celebramos los colores amarillo, azul y rojo en cada rincón de nuestra tienda.", icon: Crown },
              { title: "CONFIANZA", desc: "Construimos relaciones duraderas basadas en la transparencia, la calidad garantizada y un servicio al cliente impecable.", icon: Target },
              { title: "COLECCIONISMO", desc: "Entendemos la emoción de completar un álbum o conseguir una camiseta histórica. Somos la casa del hincha coleccionista.", icon: Star }
            ].map((v, i) => {
              const Icon = v.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.6 }}
                  className="shrink-0 snap-center w-[85vw] md:w-auto p-8 bg-carbon border border-steel/30 rounded-none shadow-xl"
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

      {/* Por qué elegir Gol de Oro */}
      <section className="py-24 bg-carbon border-t border-steel/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-display font-bold text-white-diamond uppercase">¿Por qué elegir Gol de Oro?</h2>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 hide-scrollbar">
            {[
              { title: "⚽ Productos Oficiales", desc: "Camisetas de la Selección Colombia, álbum Panini, cajas y de sobres del Mundial 2026 — todo auténtico y certificado." },
              { title: "🏆 Atención al Hincha", desc: "Asesoría cercana y personalizada para ayudarte a encontrar esa camiseta o álbum que buscas con tanto fervor." },
              { title: "🚚 Envíos Nacionales", desc: "Enviamos a todo Colombia con seguimiento y acompañamiento total, para que tu pasión futbolera llegue a tiempo." },
              { title: "✅ Satisfacción Total", desc: "Nos enfocamos en superar las expectativas del hincha. Tu experiencia de compra es tan importante como el partido." },
              { title: "🇨🇴 Orgullo Tricolor", desc: "Cada producto celebra el amarillo, azul y rojo de Colombia. Somos la tienda del verdadero hincha colombiano." }
            ].map((choice, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                className="shrink-0 snap-center w-[85vw] md:w-auto p-6 bg-graphite border border-steel/30 rounded-none hover:border-gold-action/30 transition-all duration-300"
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
            <h3 className="text-lg font-display font-bold text-gold-action uppercase tracking-[0.3em] mb-3">⚽ GOL DE ORO</h3>
            <p className="text-sm text-titanium font-sans font-light uppercase tracking-widest">Pasión Colombiana · Orgullo Tricolor · Mundial 2026</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-4 h-4 rounded-sm bg-[#FCD116]" />
              <span className="w-4 h-4 rounded-sm bg-[#003893]" />
              <span className="w-4 h-4 rounded-sm bg-[#CE1126]" />
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
