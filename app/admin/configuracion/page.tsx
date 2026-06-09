'use client'

import { motion } from 'framer-motion'
import { Store, Truck, CreditCard, Bell, Shield, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Personaliza tu tienda y preferencias
        </p>
      </div>

      {/* Store Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Informacion de la Tienda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nombre de la Tienda</Label>
            <Input defaultValue="Urban Crown" className="mt-1 bg-secondary border-border/50" />
          </div>
          <div>
            <Label>Email de Contacto</Label>
            <Input defaultValue="info@urbancrown.co" className="mt-1 bg-secondary border-border/50" />
          </div>
          <div>
            <Label>Telefono</Label>
            <Input defaultValue="+57 300 123 4567" className="mt-1 bg-secondary border-border/50" />
          </div>
          <div>
            <Label>Direccion</Label>
            <Input defaultValue="Medellín, Colombia" className="mt-1 bg-secondary border-border/50" />
          </div>
          <div className="md:col-span-2">
            <Label>Descripcion</Label>
            <Textarea 
              defaultValue="La tienda más exclusiva de gorras urbanas premium en Colombia."
              className="mt-1 bg-secondary border-border/50"
              rows={3}
            />
          </div>
        </div>
      </motion.div>

      {/* Shipping Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Opciones de Envio</h2>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Interrapidisimo', price: '15000', days: '2-3 dias' },
            { name: 'Enviar', price: '12000', days: '3-5 dias' },
            { name: 'Express Premium', price: '25000', days: '1-2 dias' },
          ].map((shipping) => (
            <div key={shipping.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="flex items-center gap-4">
                <Switch defaultChecked />
                <div>
                  <p className="font-medium">{shipping.name}</p>
                  <p className="text-sm text-muted-foreground">{shipping.days}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input 
                  defaultValue={shipping.price} 
                  className="w-24 bg-secondary border-border/50 text-right"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Metodos de Pago</h2>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Tarjetas de Credito/Debito', enabled: true },
            { name: 'PSE', enabled: true },
            { name: 'Nequi', enabled: false },
            { name: 'Daviplata', enabled: false },
            { name: 'Efectivo (Contraentrega)', enabled: false },
          ].map((method) => (
            <div key={method.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <span className="font-medium">{method.name}</span>
              <Switch defaultChecked={method.enabled} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Notificaciones</h2>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Email de nuevos pedidos', enabled: true },
            { name: 'Email de stock bajo', enabled: true },
            { name: 'Notificaciones push', enabled: false },
            { name: 'Resumen diario de ventas', enabled: true },
          ].map((notification) => (
            <div key={notification.name} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <span className="font-medium">{notification.name}</span>
              <Switch defaultChecked={notification.enabled} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-card border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Seguridad</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Contrasena Actual</Label>
            <Input type="password" className="mt-1 bg-secondary border-border/50" />
          </div>
          <div>
            <Label>Nueva Contrasena</Label>
            <Input type="password" className="mt-1 bg-secondary border-border/50" />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="btn-luxury">
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
