// Purpose: Acciones de servidor para Valida reportes de anuncios y registra avisos internos.
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { registrarNotificacion } from '@/lib/notificaciones'

export interface ReporteState {
  error?: string
  success?: boolean
  mensaje?: string
}

export async function crearReporteAction(
  prevState: ReporteState,
  formData: FormData
): Promise<ReporteState> {
  const usuario = await getCurrentUser()

  if (!usuario) {
    return { error: 'Debes iniciar sesión para reportar' }
  }

  const publicacion_id = parseInt(formData.get('publicacion_id') as string)
  const motivo = formData.get('motivo') as string
  const descripcion = formData.get('descripcion') as string

  if (!publicacion_id || !motivo) {
    return { error: 'Selecciona un motivo de reporte' }
  }

  // Verificar que no esté reportando su propia publicación
  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacion_id },
    include: { inmueble: true },
  })

  if (!publicacion) {
    return { error: 'La publicación no existe' }
  }

  if (publicacion.inmueble.propietario_id === usuario.id) {
    return { error: 'No puedes reportar tu propia publicación' }
  }

  // Verificar si ya reportó esta publicación recientemente
  const reporteExistente = await prisma.reporte.findFirst({
    where: {
      usuario_id: usuario.id,
      publicacion_id,
      estado: 'pendiente',
    },
  })

  if (reporteExistente) {
    return { error: 'Ya reportaste esta publicación. Un admin la revisará pronto.' }
  }

  try {
    await prisma.reporte.create({
      data: {
        usuario_id: usuario.id,
        publicacion_id,
        motivo,
        descripcion: descripcion || null,
        estado: 'pendiente',
      },
    })

    // Notificar a todos los admins
    const admins = await prisma.administrador.findMany({
      select: { usuario_id: true },
    })

    for (const admin of admins) {
      await registrarNotificacion({
        usuarioId: admin.usuario_id,
        tipo: 'reporte_nuevo',
        mensaje: `Se recibió un reporte en "${publicacion.inmueble.tipo_inmueble}": ${motivo}.`,
      })
    }
    await registrarNotificacion({
      usuarioId: usuario.id,
      tipo: 'reporte_recibido',
      mensaje: 'El equipo de Rentify revisará la publicación que reportaste.',
    })

    revalidatePath(`/propiedad/${publicacion_id}`)
    revalidatePath('/dashboard/admin')

    return {
      success: true,
      mensaje: 'Reporte enviado. Un administrador lo revisará pronto.',
    }
  } catch (error) {
    console.error('Error al crear reporte:', error)
    return { error: 'Error al enviar el reporte. Intenta de nuevo.' }
  }
}