import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
const MAX_IMAGE_SIZE = 10 * 1024 * 1024  // 10 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200 MB

function sanitizeFileName(name: string): string {
  // Remove path traversal chars, keep only alphanumeric, dots, dashes, underscores
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\.+/g, '.')
    .slice(0, 100)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se recibio ningun archivo' }, { status: 400 })
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type)

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}. Solo se permiten imágenes (JPG, PNG, WebP, GIF) y videos (MP4, WebM, OGG, MOV).` },
        { status: 400 }
      )
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo ${maxMB} MB para ${isImage ? 'imágenes' : 'videos'}.` },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const ext = sanitizeFileName(file.name).split('.').pop() || (isImage ? 'jpg' : 'mp4')
    const uniqueName = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const folder = isImage ? 'images' : 'videos'
    const storagePath = `${folder}/${uniqueName}`

    // Convert to ArrayBuffer then Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error } = await supabaseAdmin.storage
      .from('products')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
        cacheControl: '3600',
      })

    if (error) {
      console.error('[upload] Storage error:', error)
      // If bucket doesn't exist, give a clear message
      if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        return NextResponse.json(
          { error: 'El bucket de almacenamiento "products" no existe. Por favor créalo en el dashboard de Supabase > Storage.' },
          { status: 500 }
        )
      }
      return NextResponse.json({ error: 'Error al subir el archivo: ' + error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(storagePath)

    return NextResponse.json({ url: publicUrl, type: isImage ? 'image' : 'video' })
  } catch (error) {
    console.error('[upload] Admin upload error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
