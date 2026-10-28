'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Todas las mutaciones del panel vuelven a verificar el rol en el servidor.
async function verificarAdmin() {
  const usuario = await getCurrentUser()
  if (!usuario || !usuario.administrador) {
    throw new Error('No autorizado. Solo administradores pueden realizar esta acción.')
  }
  return usuario
}

function obtenerId(formData: FormData, campo: string): number {
  const valor = formData.get(campo)
  if (typeof valor !== 'string' || !/^\d+$/.test(valor)) {
    throw new Error(`El campo ${campo} no es válido`)
  }

  const id = Number(valor)
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error(`El campo ${campo} no es válido`)
  }

  return id
}

function obtenerTexto(formData: FormData, campo: string): string {
  const valor = formData.get(campo)
  return typeof valor === 'string' ? valor.trim() : ''
}

function revalidarModeracion() {
  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard')
  revalidatePath('/propiedades')
  revalidatePath('/')
}

export async function suspenderPublicacionAction(formData: FormData) {
  const admin = await verificarAdmin()
  const publicacionId = obtenerId(formData, 'publicacion_id')
  const motivo = obtenerTexto(formData, 'motivo')

  if (!motivo) {
    throw new Error('Indica el motivo de la suspensión')
  }

  await prisma.$transaction(async (tx) => {
    // Condicionar el cambio al estado actual evita suspensiones repetidas o carreras.
    const resultado = await tx.publicacion.updateMany({
      where: { id: publicacionId, estado: 'activa' },
      data: {
        estado: 'suspendida',
        motivo_suspension: motivo,
        suspendida_por: admin.id,
        fecha_suspension: new Date(),
      },
    })
    if (resultado.count !== 1) {
      throw new Error('La publicación no existe o ya no está activa')
    }

    const publicacion = await tx.publicacion.findUniqueOrThrow({
      where: { id: publicacionId },
      include: { inmueble: true },
    })

    await tx.notificacion.create({
      data: {
        usuario_id: publicacion.inmueble.propietario_id,
        tipo: 'publicacion_suspendida',
        mensaje: `Tu publicación "${publicacion.inmueble.tipo_inmueble}" fue suspendida. Motivo: ${motivo}`,
        estado: 'no_leida',
      },
    })
  })

  revalidarModeracion()
}

export async function reactivarPublicacionAction(formData: FormData) {
  await verificarAdmin()
  const publicacionId = obtenerId(formData, 'publicacion_id')
  const resultado = await prisma.publicacion.updateMany({
    where: { id: publicacionId, estado: 'suspendida' },
    data: {
      estado: 'activa',
      motivo_suspension: null,
      suspendida_por: null,
      fecha_suspension: null,
    },
  })
  if (resultado.count !== 1) {
    throw new Error('La publicación no existe o no está suspendida')
  }

  revalidarModeracion()
}

export async function eliminarPublicacionAction(formData: FormData) {
  await verificarAdmin()
  const publicacionId = obtenerId(formData, 'publicacion_id')
  const resultado = await prisma.publicacion.updateMany({
    where: { id: publicacionId, estado: { in: ['activa', 'suspendida'] } },
    data: { estado: 'eliminada' },
  })
  if (resultado.count !== 1) {
    throw new Error('La publicación no existe o ya fue eliminada')
  }

  revalidarModeracion()
}

export async function aprobarDocumentoAction(formData: FormData) {
  const admin = await verificarAdmin()
  const documentoId = obtenerId(formData, 'documento_id')

  await prisma.$transaction(async (tx) => {
    const resultado = await tx.documento.updateMany({
      where: { id: documentoId, estado: 'pendiente' },
      data: {
        estado: 'aprobado',
        verificado_por_admin: true,
        revisado_por: admin.id,
        fecha_revision: new Date(),
        motivo_rechazo: null,
      },
    })
    if (resultado.count !== 1) {
      throw new Error('El documento no existe o ya fue revisado')
    }

    const documento = await tx.documento.findUniqueOrThrow({
      where: { id: documentoId },
      include: {
        usuario: { include: { propietario: true, inquilino: true } },
      },
    })
    const tipoDocumento = documento.tipo_documento.toLocaleLowerCase('es-MX')
    const esIdentificacion =
      tipoDocumento.includes('ine') ||
      tipoDocumento.includes('identificación') ||
      tipoDocumento.includes('identificacion')
    const esEscritura =
      tipoDocumento.includes('escritura') || tipoDocumento.includes('propiedad')

    await tx.verificacion.create({
      data: {
        documento_id: documentoId,
        administrador_id: admin.administrador!.usuario_id,
        estado: 'aprobado',
        observaciones: 'Documento aprobado por administrador',
      },
    })

    // Solo una identificación aprobada confirma los perfiles personales.
    if (esIdentificacion && documento.usuario_id && documento.usuario) {
      if (documento.usuario.propietario) {
        await tx.propietario.update({
          where: { usuario_id: documento.usuario_id },
          data: { estado_verificacion: 'verificado' },
        })
      }
      if (documento.usuario.inquilino) {
        await tx.inquilino.update({
          where: { usuario_id: documento.usuario_id },
          data: { estado_verificacion: 'verificado' },
        })
      }
    }

    // La escritura solo verifica un inmueble cuando el documento está asociado a él.
    if (esEscritura && documento.inmueble_id) {
      await tx.inmueble.update({
        where: { id: documento.inmueble_id },
        data: { documento_verificado: true },
      })
    }

    if (documento.usuario_id) {
      await tx.notificacion.create({
        data: {
          usuario_id: documento.usuario_id,
          tipo: 'documento_aprobado',
          mensaje: esIdentificacion
            ? `Tu documento "${documento.tipo_documento}" fue aprobado y tu identidad quedó verificada.`
            : `Tu documento "${documento.tipo_documento}" fue aprobado.`,
          estado: 'no_leida',
        },
      })
    }
  })

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard')
  revalidatePath('/perfil')
}

export async function rechazarDocumentoAction(formData: FormData) {
  const admin = await verificarAdmin()
  const documentoId = obtenerId(formData, 'documento_id')
  const motivo = obtenerTexto(formData, 'motivo')
  if (!motivo) throw new Error('Indica el motivo del rechazo')

  await prisma.$transaction(async (tx) => {
    const resultado = await tx.documento.updateMany({
      where: { id: documentoId, estado: 'pendiente' },
      data: {
        estado: 'rechazado',
        motivo_rechazo: motivo,
        revisado_por: admin.id,
        fecha_revision: new Date(),
      },
    })
    if (resultado.count !== 1) {
      throw new Error('El documento no existe o ya fue revisado')
    }

    const documento = await tx.documento.findUniqueOrThrow({
      where: { id: documentoId },
    })

    await tx.verificacion.create({
      data: {
        documento_id: documentoId,
        administrador_id: admin.administrador!.usuario_id,
        estado: 'rechazado',
        observaciones: motivo,
      },
    })

    if (documento.usuario_id) {
      await tx.notificacion.create({
        data: {
          usuario_id: documento.usuario_id,
          tipo: 'documento_rechazado',
          mensaje: `Tu documento "${documento.tipo_documento}" fue rechazado. Motivo: ${motivo}`,
          estado: 'no_leida',
        },
      })
    }
  })

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard')
  revalidatePath('/perfil')
}

export async function resolverReporteAction(formData: FormData) {
  const admin = await verificarAdmin()
  const reporteId = obtenerId(formData, 'reporte_id')
  const accion = obtenerTexto(formData, 'accion')
  const observaciones = obtenerTexto(formData, 'observaciones')
  if (
    accion !== 'suspender_publicacion' &&
    accion !== 'bloquear_usuario' &&
    accion !== 'solo_resolver'
  ) {
    throw new Error('La acción de resolución no es válida')
  }

  await prisma.$transaction(async (tx) => {
    const resultado = await tx.reporte.updateMany({
      where: { id: reporteId, estado: 'pendiente' },
      data: { estado: 'resuelto' },
    })
    if (resultado.count !== 1) {
      throw new Error('El reporte no existe o ya fue atendido')
    }

    const reporte = await tx.reporte.findUniqueOrThrow({
      where: { id: reporteId },
      include: {
        publicacion: {
          include: {
            inmueble: {
              include: {
                propietario: { include: { usuario: { include: { administrador: true } } } },
              },
            },
          },
        },
      },
    })
    const propietario = reporte.publicacion.inmueble.propietario.usuario

    if (accion === 'suspender_publicacion') {
      await tx.publicacion.update({
        where: { id: reporte.publicacion_id },
        data: {
          estado: 'suspendida',
          motivo_suspension: `Suspendida por reporte: ${reporte.motivo}`,
          suspendida_por: admin.id,
          fecha_suspension: new Date(),
        },
      })
      await tx.notificacion.create({
        data: {
          usuario_id: propietario.id,
          tipo: 'publicacion_suspendida',
          mensaje: `Tu publicación fue suspendida por un reporte. Motivo: ${reporte.motivo}`,
          estado: 'no_leida',
        },
      })
    } else if (accion === 'bloquear_usuario') {
      if (propietario.administrador || propietario.id === admin.id) {
        throw new Error('No se puede bloquear una cuenta de administrador')
      }
      await tx.usuario.update({
        where: { id: propietario.id },
        data: {
          bloqueado: true,
          motivo_bloqueo: `Bloqueado por reporte: ${reporte.motivo}`,
          fecha_bloqueo: new Date(),
        },
      })
      await tx.notificacion.create({
        data: {
          usuario_id: propietario.id,
          tipo: 'usuario_bloqueado',
          mensaje: `Tu cuenta fue bloqueada por un reporte. Motivo: ${reporte.motivo}`,
          estado: 'no_leida',
        },
      })
    }

    await tx.moderacion.create({
      data: {
        reporte_id: reporteId,
        administrador_id: admin.administrador!.usuario_id,
        accion,
        observaciones: observaciones || null,
      },
    })
  })

  revalidarModeracion()
}

export async function descartarReporteAction(formData: FormData) {
  const admin = await verificarAdmin()
  const reporteId = obtenerId(formData, 'reporte_id')
  const observaciones = obtenerTexto(formData, 'observaciones')

  await prisma.$transaction(async (tx) => {
    const resultado = await tx.reporte.updateMany({
      where: { id: reporteId, estado: 'pendiente' },
      data: { estado: 'descartado' },
    })
    if (resultado.count !== 1) {
      throw new Error('El reporte no existe o ya fue atendido')
    }

    await tx.moderacion.create({
      data: {
        reporte_id: reporteId,
        administrador_id: admin.administrador!.usuario_id,
        accion: 'descartar_reporte',
        observaciones: observaciones || null,
      },
    })
  })

  revalidatePath('/dashboard/admin')
}

export async function bloquearUsuarioAction(formData: FormData) {
  const admin = await verificarAdmin()
  const usuarioId = obtenerId(formData, 'usuario_id')
  const motivo = obtenerTexto(formData, 'motivo')
  if (!motivo) throw new Error('Indica el motivo del bloqueo')
  if (usuarioId === admin.id) {
    throw new Error('No puedes bloquear tu propia cuenta')
  }

  const resultado = await prisma.usuario.updateMany({
    where: { id: usuarioId, administrador: null },
    data: {
      bloqueado: true,
      motivo_bloqueo: motivo,
      fecha_bloqueo: new Date(),
    },
  })
  if (resultado.count !== 1) {
    throw new Error('El usuario no existe o no se puede bloquear')
  }

  revalidatePath('/dashboard/admin')
}

export async function desbloquearUsuarioAction(formData: FormData) {
  await verificarAdmin()
  const usuarioId = obtenerId(formData, 'usuario_id')
  const resultado = await prisma.usuario.updateMany({
    where: { id: usuarioId, bloqueado: true, administrador: null },
    data: {
      bloqueado: false,
      motivo_bloqueo: null,
      fecha_bloqueo: null,
    },
  })
  if (resultado.count !== 1) {
    throw new Error('El usuario no existe o no está bloqueado')
  }

  revalidatePath('/dashboard/admin')
}