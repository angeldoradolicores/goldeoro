"use client"

import { motion } from "framer-motion"
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chatbot"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  date: string
  author: string
  image: string
}

const posts: BlogPost[] = [
  {
    id: 1,
    title: "Cómo limpiar y conservar tus gorras premium",
    excerpt: "Aprende los mejores consejos y técnicas para lavar tus gorras de algodón, gamuza o materiales sintéticos sin perder la horma ni desgastar los colores.",
    date: "Junio 8, 2026",
    author: "Urban Crown Team",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80"
  },
  {
    id: 2,
    title: "La evolución del Streetwear: De la calle a las pasarelas de lujo",
    excerpt: "Descubre cómo las gorras y el estilo urbano pasaron de ser accesorios deportivos a convertirse en los máximos estandartes del lujo contemporáneo global.",
    date: "Mayo 28, 2026",
    author: "Crown Advisor",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80"
  },
  {
    id: 3,
    title: "5 Combinaciones clave para lucir tu gorra con estilo",
    excerpt: "Desde outfits monocromáticos hasta contrastes arriesgados. Te mostramos cómo hacer de tu gorra el elemento protagónico de tu look diario.",
    date: "Mayo 15, 2026",
    author: "Style Expert",
    image: "https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=800&q=80"
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <BookOpen className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="text-4xl md:text-6xl font-black text-gradient-gold">URBAN CROWN BLOG</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Tendencias, cuidados, historia y estilo del streetwear y la cultura de las gorras premium.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col rounded-3xl overflow-hidden border border-border/50 bg-card hover:border-gold/30 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-gold group-hover:gap-3 transition-all cursor-pointer">
                      Leer artículo completo
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
    </div>
  )
}
