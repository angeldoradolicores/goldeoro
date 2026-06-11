'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await response.json()
      if (response.ok && data.categories) {
        setCategories(data.categories)
      } else {
        console.error('Error fetching categories:', data?.error || response.statusText)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    setCategoryName('')
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryName(category.name)
    setIsDialogOpen(true)
  }

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!categoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio')
      return
    }

    setSaving(true)
    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const body: any = { name: categoryName.trim() }
      if (editingCategory) body.id = editingCategory.id

      const response = await fetch('/api/admin/categories', {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => null)
      if (response.ok && (data.category || data.categories)) {
        toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada')
        setIsDialogOpen(false)
        setCategoryName('')
        setEditingCategory(null)
        fetchCategories()
      } else {
        const message = data?.error || response.statusText || 'Error guardando categoría'
        console.error('Error saving category:', response.status, message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Error guardando categoría')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deleteCategory) return
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteCategory.id }),
      })
      const data = await response.json().catch(() => null)
      if (response.ok) {
        toast.success('Categoría eliminada')
        setDeleteCategory(null)
        fetchCategories()
      } else {
        const message = data?.error || response.statusText || 'Error eliminando categoría'
        console.error('Error deleting category:', response.status, message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error eliminando categoría')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Categorías</h1>
          <p className="text-muted-foreground">Gestiona las categorías disponibles en el catálogo.</p>
        </div>
        <Button onClick={openCreateDialog} className="btn-luxury">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Nombre</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Slug</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-4">{category.name}</td>
                  <td className="p-4 text-muted-foreground">{category.slug}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteCategory(category)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay categorías registradas.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                className="mt-1 bg-secondary border-border/50"
                placeholder="Ej: Snapback"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-luxury" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingCategory ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              Estás seguro de que deseas eliminar la categoría &quot;{deleteCategory?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
