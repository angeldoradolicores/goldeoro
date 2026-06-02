"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  User, Package, Heart, MapPin, CreditCard, Bell, Shield, 
  LogOut, ChevronRight, Edit2, Camera, Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const menuItems = [
  { icon: User, label: "Mis Datos", id: "datos" },
  { icon: Package, label: "Mis Pedidos", id: "pedidos" },
  { icon: Heart, label: "Favoritos", id: "favoritos" },
  { icon: MapPin, label: "Direcciones", id: "direcciones" },
  { icon: CreditCard, label: "Metodos de Pago", id: "pagos" },
  { icon: Bell, label: "Notificaciones", id: "notificaciones" },
  { icon: Shield, label: "Seguridad", id: "seguridad" },
]

const mockOrders = [
  { id: "LH-001234", date: "15 Mar 2024", status: "Entregado", total: 299000, items: 2 },
  { id: "LH-001189", date: "02 Mar 2024", status: "En camino", total: 189000, items: 1 },
  { id: "LH-001156", date: "18 Feb 2024", status: "Entregado", total: 459000, items: 3 },
]

const mockFavorites = [
  { id: 1, name: "Gorra NY Premium", price: 189000, image: "/placeholder.svg" },
  { id: 2, name: "Snapback Urban Gold", price: 219000, image: "/placeholder.svg" },
  { id: 3, name: "Dad Hat Classic", price: 149000, image: "/placeholder.svg" },
]

export default function PerfilPage() {
  const [activeSection, setActiveSection] = useState("datos")
  const [userData, setUserData] = useState({
    nombre: "Juan",
    apellido: "Perez",
    email: "juan.perez@email.com",
    telefono: "+57 300 123 4567",
    fechaNacimiento: "1995-05-15",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "datos":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Datos</h2>
              <Button variant="outline" size="sm" className="border-gold/30 hover:bg-gold/10">
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Nombre</label>
                <Input value={userData.nombre} readOnly className="bg-card/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Apellido</label>
                <Input value={userData.apellido} readOnly className="bg-card/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input value={userData.email} readOnly className="bg-card/50 border-border" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Telefono</label>
                <Input value={userData.telefono} readOnly className="bg-card/50 border-border" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm text-muted-foreground">Fecha de Nacimiento</label>
                <Input type="date" value={userData.fechaNacimiento} readOnly className="bg-card/50 border-border" />
              </div>
            </div>
          </motion.div>
        )

      case "pedidos":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Mis Pedidos</h2>
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card/50 border border-border rounded-2xl p-6 hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Entregado" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gold/20 text-gold"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">{order.items} articulo(s)</p>
                    <p className="text-xl font-bold text-gold">{formatPrice(order.total)}</p>
                  </div>
                  <Button variant="ghost" className="w-full mt-4 hover:bg-gold/10">
                    Ver detalles
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case "favoritos":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Mis Favoritos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockFavorites.map((item) => (
                <div
                  key={item.id}
                  className="bg-card/50 border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-all group"
                >
                  <div className="aspect-square bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Crown className="w-12 h-12 text-gold/30" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-gold font-bold mt-1">{formatPrice(item.price)}</p>
                    <Button className="w-full mt-4 bg-gold hover:bg-gold/90 text-background">
                      Agregar al carrito
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )

      case "direcciones":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mis Direcciones</h2>
              <Button className="bg-gold hover:bg-gold/90 text-background">
                Agregar direccion
              </Button>
            </div>
            <div className="bg-card/50 border border-gold/30 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full font-medium">
                      Principal
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">Casa</p>
                  <p className="text-muted-foreground mt-1">
                    Calle 123 #45-67, Apto 101<br />
                    Bogota, Cundinamarca<br />
                    Colombia, 110111
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Crown className="w-16 h-16 text-gold/30 mb-4" />
            <p className="text-muted-foreground">Seccion en construccion</p>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card/50 backdrop-blur border border-border rounded-3xl p-6 sticky top-24">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-gold" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-background hover:bg-gold/90 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-4">
                    {userData.nombre} {userData.apellido}
                  </h2>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>

                {/* Menu */}
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeSection === item.id
                          ? "bg-gold/20 text-gold"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                        activeSection === item.id ? "rotate-90" : ""
                      }`} />
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t border-border">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesion</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-card/50 backdrop-blur border border-border rounded-3xl p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
