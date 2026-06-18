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
    title: "Cómo completar tu álbum Panini del Mundial 2026",
    excerpt: "Guía definitiva para conseguir los últimos álbumes y sobres de Panini del Mundial 2026. Tips para el canje, mercados de stickers y cómo organizar tu colección.",
    date: "Junio 8, 2026",
    author: "Gol de Oro Team",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80"
  },
  {
    id: 2,
    title: "La camiseta de Colombia: historia y evolución tricolor",
    excerpt: "Desde la primera camiseta oficial hasta la edición del Mundial 2026. Un repaso por los diseños más icónicos de la Selección Colombia a través de la historia.",
    date: "Mayo 28, 2026",
    author: "Gol de Oro Advisor",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
  },
  {
    id: 3,
    title: "5 cosas que todo hincha colombiano debe tener para el Mundial 2026",
    excerpt: "Camiseta oficial, álbum Panini, caja coleccionable, bufanda tricolor y más. Te mostramos cómo prepararte para vivir el Mundial 2026 como un campeón.",
    date: "Mayo 15, 2026",
    author: "Style Expert",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80"
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
            <h1 className="text-4xl md:text-6xl font-black text-gradient-gold">GOL DE ORO BLOG</h1>
            <p className="text-muted-foreground mt-4 text-lg">
              Fútbol, coleccionismo, la Tricolor y el Mundial 2026. Todo lo que un hincha necesita saber.
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
