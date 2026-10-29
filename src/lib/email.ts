import 'server-only'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

type PreferenciaEmail = 'solicitudes' | 'visitas' | 'evaluaciones' | 'cuenta'

interface NotificacionEmail {
  usuarioId: number
  tipo: string
  asunto: string
  mensaje: string
  preferencia: PreferenciaEmail
}

function escaparHtml(valor: string): string {
  return valor.replace(/[&<>"']/g, (caracter) => {
    const entidades: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entidades[caracter]
  })
}

function obtenerUrlAplicacion(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
}

export async function notificarPorCorreo({
  usuarioId,
  tipo,
  asunto,
  mensaje,
  preferencia,
}: NotificacionEmail): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { correo: true, preferencias_email: true },
  })

  if (!usuario) throw new Error(`No se encontró el destinatario de correo ${usuarioId}.`)

  const preferencias = usuario.preferencias_email
  if (
    preferencias &&
    typeof preferencias === 'object' &&
    !Array.isArray(preferencias) &&
    (preferencias as Record<string, unknown>)[preferencia] === false
  ) {
    return false
  }

  const notificacion = await prisma.notificacion.create({
    data: {
      usuario_id: usuarioId,
      tipo,
      mensaje,
      estado: 'pendiente_email',
    },
  })

  const apiKey = process.env.RESEND_API_KEY
  const remitente = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !remitente) {
    await prisma.notificacion.update({
      where: { id: notificacion.id },
      data: { estado: 'fallida_email' },
    })
    throw new Error('Configura RESEND_API_KEY y RESEND_FROM_EMAIL para enviar notificaciones.')
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: remitente,
      to: usuario.correo,
      subject: asunto,
      html: `
        <main style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1f2937">
          <h1 style="color:#3A4D39">Rentify</h1>
          <h2>${escaparHtml(asunto)}</h2>
          <p>${escaparHtml(mensaje)}</p>
          <p style="margin:28px 0">
            <a href="${obtenerUrlAplicacion()}/dashboard" style="background:#3A4D39;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px">
              Abrir Rentify
            </a>
          </p>
          <p style="color:#6b7280;font-size:12px">Este mensaje se envió desde Rentify.</p>
        </main>
      `,
    })

    if (error || !data?.id) {
      console.error('Resend no aceptó el mensaje:', error)
      throw new Error('El proveedor de correo no aceptó la notificación.')
    }

    await prisma.notificacion.update({
      where: { id: notificacion.id },
      data: {
        enviada_email: true,
        fecha_envio: new Date(),
        estado: 'enviada',
      },
    })
    return true
  } catch (error) {
    await prisma.notificacion.update({
      where: { id: notificacion.id },
      data: { estado: 'fallida_email' },
    })
    console.error('Falló el envío de notificación por Resend:', error)
    throw error
  }
}
