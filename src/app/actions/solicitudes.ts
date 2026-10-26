'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface SolicitudState {
  error?: string
  success?: boolean
}

export async function crearSolicitudAction(
  prevState: SolicitudState,
  formData: FormData
): Promise<SolicitudState> {
  const usuario = await getCurrentUser()

  if (!usuario) {
    return { error: 'Debes iniciar sesión para solicitar una renta' }
  }

  const publicacion_id = parseInt(formData.get('publicacion_id') as string)
  const mensaje = (formData.get('mensaje') as string) || ''

  if (!publicacion_id || isNaN(publicacion_id)) {
    return { error: 'Publicación inválida' }
  }

  const publicacion = await prisma.publicacion.findUnique({
    where: { id: publicacion_id },
    include: {
      inmueble: {
        include: { propietario: true },
      },
    },
  })

  if (!publicacion) {
    return { error: 'La publicación no existe' }
  }

  if (publicacion.inmueble.propietario_id === usuario.id) {
    return { error: 'No puedes solicitar tu propia propiedad' }
  }

  const existente = await prisma.solicitudRenta.findFirst({
    where: {
      publicacion_id,
      inquilino: { usuario_id: usuario.id },
      estado: { in: ['pendiente', 'aprobada'] },
    },
  })

  if (existente) {
    return { error: 'Ya tienes una solicitud activa para esta propiedad' }
  }

  try {
    let inquilinoId: number

    if (usuario.inquilino) {
      inquilinoId = usuario.inquilino.usuario_id
    } else {
      const nuevoInquilino = await prisma.inquilino.create({
        data: {
          usuario_id: usuario.id,
          estado_verificacion: 'pendiente',
        },
      })
      inquilinoId = nuevoInquilino.usuario_id
    }

    await prisma.solicitudRenta.create({
      data: {
        inquilino_id: inquilinoId,
        publicacion_id,
        estado: 'pendiente',
        mensaje: mensaje || 'Me interesa esta propiedad',
      },
    })

    await prisma.notificacion.create({
      data: {
        usuario_id: publicacion.inmueble.propietario_id,
        tipo: 'solicitud_renta',
        mensaje: `${usuario.nombre} ${usuario.apellido} solicitó rentar "${publicacion.inmueble.tipo_inmueble}" en ${publicacion.inmueble.direccion}`,
        estado: 'no_leida',
      },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/propiedad/${publicacion_id}`)
  } catch (error) {
    console.error('Error al crear solicitud:', error)
    return { error: 'Error al crear la solicitud. Intenta de nuevo.' }
  }

  redirect('/dashboard')
}

export async function aprobarSolicitudAction(formData: FormData) {
  const solicitudId = parseInt(formData.get('solicitud_id') as string)
  if (!solicitudId) return

  const usuario = await getCurrentUser()
  if (!usuario) return

  const solicitud = await prisma.solicitudRenta.findUnique({
    where: { id: solicitudId },
    include: { publicacion: { include: { inmueble: true } } },
  })

  if (!solicitud) return
  if (solicitud.publicacion.inmueble.propietario_id !== usuario.id) return

  await prisma.solicitudRenta.update({
    where: { id: solicitudId },
    data: { estado: 'aprobada' },
  })

  await prisma.notificacion.create({
    data: {
      usuario_id: solicitud.inquilino_id,
      tipo: 'solicitud_aprobada',
      mensaje: `Tu solicitud para "${solicitud.publicacion.inmueble.tipo_inmueble}" fue aprobada`,
      estado: 'no_leida',
    },
  })

  revalidatePath('/dashboard')
}

export async function rechazarSolicitudAction(formData: FormData) {
  const solicitudId = parseInt(formData.get('solicitud_id') as string)
  if (!solicitudId) return

  const usuario = await getCurrentUser()
  if (!usuario) return

  const solicitud = await prisma.solicitudRenta.findUnique({
    where: { id: solicitudId },
    include: { publicacion: { include: { inmueble: true } } },
  })

  if (!solicitud) return
  if (solicitud.publicacion.inmueble.propietario_id !== usuario.id) return

  await prisma.solicitudRenta.update({
    where: { id: solicitudId },
    data: { estado: 'rechazada' },
  })

  await prisma.notificacion.create({
    data: {
      usuario_id: solicitud.inquilino_id,
      tipo: 'solicitud_rechazada',
      mensaje: `Tu solicitud para "${solicitud.publicacion.inmueble.tipo_inmueble}" fue rechazada`,
      estado: 'no_leida',
    },
  })

  revalidatePath('/dashboard')
}