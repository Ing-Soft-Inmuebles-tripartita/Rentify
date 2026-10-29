// Purpose: Acciones de servidor para Agenda y actualiza visitas validando permisos, disponibilidad y conflictos.
// src/app/actions/visitas.ts
'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { registrarNotificacion } from '@/lib/notificaciones'
import {
  horaDisponible,
  parsearDisponibilidadVisitas,
} from '@/lib/disponibilidad-visitas'

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
  const notas = formData.get('notas') as string

  if (!publicacion_id || isNaN(publicacion_id)) {
    return { error: 'Publicación inválida' }
  }

  if (!fecha || !hora) {
    return { error: 'Selecciona una fecha y una hora' }
  }
  if (!['presencial', 'videollamada'].includes(modalidad)) {
    return { error: 'Selecciona una modalidad de visita válida' }
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

  if (
    publicacion.estado !== 'activa' ||
    publicacion.inmueble.estado_inventario !== 'disponible'
  ) {
    return { error: 'Esta propiedad ya no está disponible para agendar visitas' }
  }

  const disponibilidad = parsearDisponibilidadVisitas(
    publicacion.inmueble.disponibilidad_visitas
  )
  if (!horaDisponible(disponibilidad, fecha, hora)) {
    return { error: 'El propietario no tiene disponibilidad para ese día y horario.' }
  }

  if (publicacion.inmueble.propietario_id === usuario.id) {
    return { error: 'No puedes agendar una visita a tu propia propiedad' }
  }

  try {
    const inicioRango = new Date(fechaHora.getTime() - 30 * 60 * 1000)
    const finRango = new Date(fechaHora.getTime() + 30 * 60 * 1000)
    const conflicto = await prisma.visita.findFirst({
      where: {
        estado: 'agendada',
        fecha_hora: { gt: inicioRango, lt: finRango },
        solicitud: {
          publicacion: {
            inmueble: { propietario_id: publicacion.inmueble.propietario_id },
          },
        },
      },
    })
    if (conflicto) return { error: 'Ese horario ya no está disponible. Selecciona otro.' }

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

    // Notificar en la aplicación a ambas partes de la visita.
    const mensajeVisita = `${usuario.nombre} ${usuario.apellido} agendó una visita ${modalidad} para "${publicacion.inmueble.tipo_inmueble}" el ${fechaHora.toLocaleDateString('es-MX')} a las ${hora}.`
    await registrarNotificacion({
      usuarioId: publicacion.inmueble.propietario_id,
      tipo: 'visita_agendada',
      mensaje: mensajeVisita,
    })
    await registrarNotificacion({
      usuarioId: usuario.id,
      tipo: 'visita_confirmada',
      mensaje: `Tu visita ${modalidad} para "${publicacion.inmueble.tipo_inmueble}" quedó agendada para el ${fechaHora.toLocaleDateString('es-MX')} a las ${hora}.`,
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

export async function cancelarVisitaAction(formData: FormData) {
  const visitaId = Number(formData.get('visita_id'))
  const motivo = String(formData.get('motivo') ?? '').trim()
  if (!Number.isInteger(visitaId) || visitaId <= 0) throw new Error('Visita inválida.')
  if (!motivo) throw new Error('Indica el motivo de cancelación.')

  const usuario = await getCurrentUser()
  if (!usuario) throw new Error('No autorizado.')

  const visita = await prisma.visita.findUnique({
    where: { id: visitaId },
    include: {
      solicitud: {
        include: {
          publicacion: { include: { inmueble: true } },
        },
      },
    },
  })
  if (!visita) throw new Error('La visita no existe.')

  const propietarioId = visita.solicitud.publicacion.inmueble.propietario_id
  const inquilinoId = visita.solicitud.inquilino_id
  if (usuario.id !== propietarioId && usuario.id !== inquilinoId) {
    throw new Error('No tienes permiso para cancelar esta visita.')
  }
  if (visita.estado !== 'agendada' || visita.fecha_hora <= new Date()) {
    throw new Error('Solo se pueden cancelar visitas futuras que sigan agendadas.')
  }

  const resultado = await prisma.visita.updateMany({
    where: { id: visitaId, estado: 'agendada' },
    data: {
      estado: 'cancelada',
      cancelada_en: new Date(),
      motivo_cancelacion: motivo,
    },
  })
  if (resultado.count !== 1) throw new Error('La visita ya fue actualizada.')

  await registrarNotificacion({
    usuarioId: usuario.id === propietarioId ? inquilinoId : propietarioId,
    tipo: 'visita_cancelada',
    mensaje: `La visita de "${visita.solicitud.publicacion.inmueble.tipo_inmueble}" fue cancelada. Motivo: ${motivo}`,
  })
  revalidatePath('/dashboard')
}

export async function completarVisitaAction(formData: FormData) {
  const visitaId = Number(formData.get('visita_id'))
  if (!Number.isInteger(visitaId) || visitaId <= 0) throw new Error('Visita inválida.')

  const usuario = await getCurrentUser()
  if (!usuario) throw new Error('No autorizado.')

  const visita = await prisma.visita.findUnique({
    where: { id: visitaId },
    include: {
      solicitud: {
        include: {
          inquilino: { include: { usuario: true } },
          publicacion: { include: { inmueble: true } },
        },
      },
    },
  })
  if (!visita || visita.solicitud.publicacion.inmueble.propietario_id !== usuario.id) {
    throw new Error('No tienes permiso para completar esta visita.')
  }
  if (visita.estado !== 'agendada' || visita.fecha_hora > new Date()) {
    throw new Error('Solo se pueden completar visitas agendadas cuya fecha ya pasó.')
  }

  const resultado = await prisma.visita.updateMany({
    where: { id: visitaId, estado: 'agendada' },
    data: { estado: 'completada', completada_en: new Date() },
  })
  if (resultado.count !== 1) throw new Error('La visita ya fue actualizada.')

  await registrarNotificacion({
    usuarioId: visita.solicitud.inquilino_id,
    tipo: 'visita_completada',
    mensaje: `La visita a "${visita.solicitud.publicacion.inmueble.tipo_inmueble}" fue marcada como completada.`,
  })
  revalidatePath('/dashboard')
}

export async function guardarDisponibilidadVisitasAction(formData: FormData) {
  const usuario = await getCurrentUser()
  if (!usuario?.propietario) throw new Error('Solo un propietario puede configurar visitas.')

  const inmuebleId = Number(formData.get('inmueble_id'))
  const horaInicio = String(formData.get('hora_inicio') ?? '')
  const horaFin = String(formData.get('hora_fin') ?? '')
  const dias = formData
    .getAll('dias')
    .map((valor) => Number(valor))

  if (!Number.isInteger(inmuebleId) || inmuebleId <= 0) {
    throw new Error('Inmueble inválido.')
  }
  if (
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaInicio) ||
    !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horaFin) ||
    horaInicio >= horaFin
  ) {
    throw new Error('Define un rango horario válido.')
  }
  if (dias.some((dia) => !Number.isInteger(dia) || dia < 0 || dia > 6)) {
    throw new Error('Selecciona días válidos.')
  }

  const disponibilidad: Prisma.InputJsonObject[] = [...new Set(dias)].map(
    (dia_semana) => ({
      dia_semana,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
    })
  )
  const resultado = await prisma.inmueble.updateMany({
    where: { id: inmuebleId, propietario_id: usuario.propietario.usuario_id },
    data: { disponibilidad_visitas: disponibilidad },
  })
  if (resultado.count !== 1) throw new Error('No tienes permiso para modificar este inmueble.')

  const publicaciones = await prisma.publicacion.findMany({
    where: { inmueble_id: inmuebleId },
    select: { id: true },
  })
  for (const publicacion of publicaciones) {
    revalidatePath(`/propiedad/${publicacion.id}`)
  }
  revalidatePath('/dashboard')
}