// src/app/actions/visitas.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export interface VisitaState {
  error?: string
  success?: boolean
  mensaje?: string
}

export async function agendarVisitaAction(
  prevState: VisitaState,
  formData: FormData
): Promise<VisitaState> {
  const usuario = await getCurrentUser()

  if (!usuario) {
    return { error: 'Debes iniciar sesión para agendar una visita' }
  }

  const publicacion_id = parseInt(formData.get('publicacion_id') as string)
  const fecha = formData.get('fecha') as string  // YYYY-MM-DD
  const hora = formData.get('hora') as string    // HH:MM
  const modalidad = formData.get('modalidad') as string
  const nombre = formData.get('nombre') as string
  const notas = formData.get('notas') as string

  if (!publicacion_id || isNaN(publicacion_id)) {
    return { error: 'Publicación inválida' }
  }

  if (!fecha || !hora) {
    return { error: 'Selecciona una fecha y una hora' }
  }

  // Se combinan los campos separados del formulario antes de validar fecha y hora en el servidor.
  const fechaHora = new Date(`${fecha}T${hora}:00`)

  if (isNaN(fechaHora.getTime())) {
    return { error: 'Fecha u hora inválida' }
  }

  // No permitir fechas en el pasado
  if (fechaHora.getTime() < Date.now()) {
    return { error: 'La fecha debe ser en el futuro' }
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
    return { error: 'No puedes agendar una visita a tu propia propiedad' }
  }

  try {
    // 1. Asegurar que el usuario tiene perfil de inquilino
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

    // La visita siempre queda vinculada a una solicitud; se reutiliza una activa si ya existe.
    let solicitud = await prisma.solicitudRenta.findFirst({
      where: {
        inquilino_id: inquilinoId,
        publicacion_id,
        estado: { in: ['pendiente', 'aprobada'] },
      },
    })

    // 3. Si no existe, crear la solicitud (con el mensaje de las notas)
    if (!solicitud) {
      solicitud = await prisma.solicitudRenta.create({
        data: {
          inquilino_id: inquilinoId,
          publicacion_id,
          estado: 'pendiente',
          mensaje: notas || 'Solicitud de visita',
        },
      })
    }

    // 4. Crear la visita vinculada a la solicitud
    await prisma.visita.create({
      data: {
        solicitud_id: solicitud.id,
        fecha_hora: fechaHora,
        tipo: 'visita',
        modalidad: modalidad || 'presencial',
        estado: 'agendada',
        notas: notas || null,
      },
    })

    // 5. Notificar al propietario
    await prisma.notificacion.create({
      data: {
        usuario_id: publicacion.inmueble.propietario_id,
        tipo: 'visita_agendada',
        mensaje: `${nombre} agendó una visita ${modalidad} para "${publicacion.inmueble.tipo_inmueble}" el ${fechaHora.toLocaleDateString('es-MX')} a las ${hora}`,
        estado: 'no_leida',
      },
    })

    revalidatePath('/dashboard')
    revalidatePath(`/propiedad/${publicacion_id}`)

    return {
      success: true,
      mensaje: `¡Visita confirmada para el ${fechaHora.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${hora}!`,
    }
  } catch (error) {
    console.error('Error al agendar visita:', error)
    return { error: 'Error al agendar la visita. Intenta de nuevo.' }
  }
}