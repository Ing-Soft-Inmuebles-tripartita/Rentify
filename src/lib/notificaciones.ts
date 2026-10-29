// Purpose: Registra avisos operativos en Rentify sin enviar correo.
import 'server-only'
import { prisma } from '@/lib/prisma'

interface NotificacionInput {
  usuarioId: number
  tipo: string
  mensaje: string
}

export async function registrarNotificacion({
  usuarioId,
  tipo,
  mensaje,
}: NotificacionInput): Promise<void> {
  const usuarioExiste = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true },
  })

  if (!usuarioExiste) {
    throw new Error(`No se encontró el destinatario de la notificación ${usuarioId}.`)
  }

  await prisma.notificacion.create({
    data: {
      usuario_id: usuarioId,
      tipo,
      mensaje,
      estado: 'no_leida',
      enviada_email: false,
    },
  })
}
