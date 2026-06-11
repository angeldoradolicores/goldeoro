'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Upload,
  X,
  Save,
  Loader2,
  Video,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  original_price?: number
  category: string
  stock: number
  featured: boolean
  is_promotion: boolean
  images: string[]
  videos: string[]
  colors: string[]
  created_at: string
}

const defaultCategories = ['Todos', 'Premium', 'Urban', 'Snapback', 'Classic', 'Sport', 'Limited Edition']

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', { credentials: 'include' })
      const data = await response.json()
      if (response.ok && data.products) {
        setProducts(data.products)
      } else {
        console.error('Error fetching products:', response.status, data?.error || response.statusText)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await response.json()
      if (response.ok && data.categories) {
        setCategories(['Todos', ...data.categories.map((category: any) => category.name)])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'Todos' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== product.id))
      } else {
        const data = await response.json().catch(() => null)
        const message = data?.error || response.statusText || 'Error eliminando producto'
        console.error('Error deleting product:', response.status, message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
    setDeleteProduct(null)
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    setSaving(true)
    try {
      const method = editingProduct ? 'PUT' : 'POST'
      const body = editingProduct 
        ? { ...productData, id: editingProduct.id }
        : { ...productData, slug: generateSlug(productData.name || '') }

      const response = await fetch('/api/admin/products', {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.product) {
        if (editingProduct) {
          setProducts(products.map((p) => 
            p.id === editingProduct.id ? data.product : p
          ))
        } else {
          setProducts([data.product, ...products])
        }
        setIsModalOpen(false)
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado')
      } else {
        const message = data?.error || response.statusText || 'Error guardando producto'
        console.error('Error saving product:', response.status, message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setSaving(false)
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu catalogo de gorras ({products.length} productos)
          </p>
        </div>
        <Button onClick={handleAddProduct} className="btn-luxury">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-card border-border/50">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Producto</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Precio</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Stock</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Estado</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-secondary">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground md:hidden">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-primary">{formatPrice(product.price)}</p>
                        {product.original_price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`font-medium ${
                        product.stock < 10 ? 'text-destructive' : 'text-foreground'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <div className="flex gap-2 flex-wrap">
                        {product.featured && (
                          <Badge className="bg-primary/20 text-primary">Destacado</Badge>
                        )}
                        {product.is_promotion && (
                          <Badge className="bg-destructive/20 text-destructive">Oferta</Badge>
                        )}
                        {product.videos?.length > 0 && (
                          <Badge className="bg-blue-500/20 text-blue-500">
                            <Video className="w-3 h-3 mr-1" />
                            Video
                          </Badge>
                        )}
                        {!product.featured && !product.is_promotion && !product.videos?.length && (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`/producto/${product.slug}`} target="_blank" rel="noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver en tienda
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteProduct(product)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron productos</p>
            {products.length === 0 && (
              <Button onClick={handleAddProduct} className="mt-4 btn-luxury">
                <Plus className="w-4 h-4 mr-2" />
                Agregar tu primer producto
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
        saving={saving}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que deseas eliminar &quot;{deleteProduct?.name}&quot;? 
              Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteProduct && handleDeleteProduct(deleteProduct)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProductModal(props: {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: string[]
  onSave: (data: Partial<Product>) => void
  saving: boolean
}) {
  const {
    isOpen,
    onClose,
    product,
    categories = defaultCategories,
    onSave,
    saving,
  } = props
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    original_price: undefined,
    category: 'Premium',
    stock: 0,
    featured: false,
    is_promotion: false,
    colors: ['Negro'],
    images: [],
    videos: [],
  })
  const [imageUrl, setImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [newColor, setNewColor] = useState('')

  const availableColors = [
    'Negro',
    'Blanco',
    'Gris',
    'Azul',
    'Rojo',
    'Verde',
    'Dorado',
    'Café',
    'Beige',
    'Rosa',
    'Amarillo',
    'Plata',
    'Morado',
  ]

  const addColor = () => {
    if (!newColor) return
    const currentColors = formData.colors || []
    if (currentColors.includes(newColor)) {
      toast.error('El color ya está agregado')
      return
    }
    setFormData({ ...formData, colors: [...currentColors, newColor] })
    setNewColor('')
  }

  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      colors: (formData.colors || []).filter((item) => item !== color),
    })
  }

  // Formatting helpers
  const formatNumberInput = (val: string) => {
    // Remove all non-digits
    const clean = val.replace(/\D/g, '')
    if (!clean) return ''
    // Remove leading zeros
    const noLeadingZeros = parseInt(clean, 10).toString()
    // Add thousands separators
    return noLeadingZeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const parseFormattedNumber = (val: string) => {
    return parseInt(val.replace(/\./g, ''), 10) || 0
  }

  const [displayPrice, setDisplayPrice] = useState('')
  const [displayOriginalPrice, setDisplayOriginalPrice] = useState('')
  const [displayStock, setDisplayStock] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        category: product.category,
        stock: product.stock,
        featured: product.featured,
        is_promotion: product.is_promotion,
        colors: product.colors || ['Negro'],
        images: product.images || [],
        videos: product.videos || [],
      })
      setDisplayPrice(product.price ? formatNumberInput(product.price.toString()) : '')
      setDisplayOriginalPrice(product.original_price ? formatNumberInput(product.original_price.toString()) : '')
      setDisplayStock(product.stock !== undefined ? formatNumberInput(product.stock.toString()) : '')
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        original_price: undefined,
        category: 'Premium',
        stock: 0,
        featured: false,
        is_promotion: false,
        colors: ['Negro'],
        images: [],
        videos: [],
      })
      setDisplayPrice('')
      setDisplayOriginalPrice('')
      setDisplayStock('')
    }
    setImageUrl('')
    setVideoUrl('')
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), imageUrl.trim()]
      })
      setImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index)
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'image') setUploadingImage(true)
    else setUploadingVideo(true)

    try {
      const data = new FormData()
      data.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: data,
      })
      
      const result = await response.json().catch(() => null)
      
      if (response.ok && result?.url) {
        if (type === 'image') {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), result.url]
          }))
        } else {
          setFormData(prev => ({
            ...prev,
            videos: [...(prev.videos || []), result.url]
          }))
        }
      } else {
        const message = result?.error || 'Error subiendo archivo'
        console.error('Error uploading file:', message)
        toast.error(message)
      }
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      if (type === 'image') setUploadingImage(false)
      else setUploadingVideo(false)
    }
    
    // Reset file input
    e.target.value = ''
  }

  const addVideo = () => {
    if (videoUrl.trim()) {
      setFormData({
        ...formData,
        videos: [...(formData.videos || []), videoUrl.trim()]
      })
      setVideoUrl('')
    }
  }

  const removeVideo = (index: number) => {
    setFormData({
      ...formData,
      videos: formData.videos?.filter((_, i) => i !== index)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            {product ? 'Editar Producto' : 'Agregar Producto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div>
            <Label>Imagenes</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="URL de la imagen"
                  className="bg-secondary border-border/50 text-black placeholder:text-slate-500"
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button type="button" variant="outline" disabled={uploadingImage} className="relative overflow-hidden">
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingImage ? '' : 'Subir'}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      disabled={uploadingImage}
                    />
                  </Button>
                </div>
              </div>
              {formData.images && formData.images.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Las imágenes y los colores se emparejan por posición: la primera imagen corresponde al primer color, la segunda imagen al segundo color, etc.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Videos */}
          <div>
            <Label>Videos</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="URL del video (YouTube, Vimeo, etc.)"
                  className="bg-secondary border-border/50 text-black placeholder:text-slate-500"
                />
                <Button type="button" onClick={addVideo} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button type="button" variant="outline" disabled={uploadingVideo} className="relative overflow-hidden">
                    {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {uploadingVideo ? '' : 'Subir'}
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                      disabled={uploadingVideo}
                    />
                  </Button>
                </div>
              </div>
              {formData.videos && formData.videos.length > 0 && (
                <div className="space-y-2">
                  {formData.videos.map((video, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                      <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate flex-1">{video}</span>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nombre del Producto</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500"
                placeholder="Ej: Crown Elite Black"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label>Descripcion</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500"
                rows={3}
                placeholder="Describe el producto..."
              />
            </div>
            <div>
              <Label>Precio (COP)</Label>
              <Input
                type="text"
                value={displayPrice}
                onChange={(e) => {
                  const formatted = formatNumberInput(e.target.value)
                  setDisplayPrice(formatted)
                  setFormData({ ...formData, price: parseFormattedNumber(formatted) })
                }}
                className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <Label>Precio Original (Promocion)</Label>
              <Input
                type="text"
                value={displayOriginalPrice}
                onChange={(e) => {
                  const formatted = formatNumberInput(e.target.value)
                  setDisplayOriginalPrice(formatted)
                  setFormData({ ...formData, original_price: formatted ? parseFormattedNumber(formatted) : undefined })
                }}
                className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500"
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'Todos').map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="text"
                value={displayStock}
                onChange={(e) => {
                  const formatted = formatNumberInput(e.target.value)
                  setDisplayStock(formatted)
                  setFormData({ ...formData, stock: parseFormattedNumber(formatted) })
                }}
                className="mt-1 bg-secondary border-border/50 text-black placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Selecciona colores</Label>
              <div className="mt-1 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <Select value={newColor} onValueChange={setNewColor}>
                  <SelectTrigger className="bg-secondary border-border/50">
                    <SelectValue placeholder="Selecciona un color" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={addColor} className="sm:mt-0">
                  Agregar
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(formData.colors || []).map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary px-3 py-1 text-sm"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="text-destructive hover:text-destructive/80"
                      aria-label={`Eliminar color ${color}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Las imágenes y los colores se emparejan por posición: la primera imagen corresponde al primer color, la segunda imagen al segundo color, etc.
              </p>
              {formData.images && formData.colors && formData.images.length !== formData.colors.length && (
                <p className="text-xs text-destructive mt-2">
                  La cantidad de colores y de imágenes no coincide. Para que el color muestre la imagen correcta, deben tener el mismo número de elementos.
                </p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <span>Producto Destacado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_promotion}
                onChange={(e) => setFormData({ ...formData, is_promotion: e.target.checked })}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <span>En Promocion</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 btn-luxury" disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
