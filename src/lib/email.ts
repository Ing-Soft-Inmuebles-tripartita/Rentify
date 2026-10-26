interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function enviarEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const timestamp = new Date().toISOString()

  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║  📧 EMAIL SIMULADO (desarrollo)                          ║')
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log(`║  Fecha:   ${timestamp}`)
  console.log(`║  Para:    ${to}`)
  console.log(`║  Asunto:  ${subject}`)
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log('║  Contenido HTML:')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log(html)
  console.log('══════════════════════════════════════════════════════════')
  console.log('\n')

  return true
}

export async function enviarEmailRecuperacion(
  to: string,
  nombre: string,
  token: string
): Promise<boolean> {
  const enlace = `http://localhost:3000/restablecer/${token}`

  return enviarEmail({
    to,
    subject: 'Recupera tu contraseña de Rentify',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3A4D39;">Rentify</h1>
        <h2>Hola ${nombre},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 30px 0;">
          <a href="${enlace}" 
             style="background-color: #3A4D39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          O copia este enlace en tu navegador:<br>
          <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">${enlace}</code>
        </p>
        <p style="color: #666; font-size: 14px;">
          Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Rentify - Renta segura en Guadalajara</p>
      </div>
    `,
  })
}

export async function enviarEmailNuevaSolicitud(
  to: string,
  nombrePropietario: string,
  nombreInquilino: string,
  inmueble: string
): Promise<boolean> {
  return enviarEmail({
    to,
    subject: 'Nueva solicitud de renta en Rentify',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3A4D39;">Rentify</h1>
        <h2>Hola ${nombrePropietario},</h2>
        <p><strong>${nombreInquilino}</strong> ha solicitado rentar tu propiedad:</p>
        <p style="background: #f5f5f5; padding: 12px; border-left: 4px solid #3A4D39; border-radius: 4px;">
          ${inmueble}
        </p>
        <p>Entra a tu dashboard para revisar la solicitud y aprobarla o rechazarla.</p>
        <p style="margin: 30px 0;">
          <a href="http://localhost:3000/dashboard" 
             style="background-color: #3A4D39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ir al dashboard
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Rentify - Renta segura en Guadalajara</p>
      </div>
    `,
  })
}

export async function enviarEmailSolicitudAprobada(
  to: string,
  nombreInquilino: string,
  inmueble: string
): Promise<boolean> {
  return enviarEmail({
    to,
    subject: '¡Tu solicitud fue aprobada!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3A4D39;">Rentify</h1>
        <h2>¡Buenas noticias, ${nombreInquilino}!</h2>
        <p>Tu solicitud para rentar esta propiedad fue <strong>aprobada</strong>:</p>
        <p style="background: #f0fdf4; padding: 12px; border-left: 4px solid #16a34a; border-radius: 4px;">
          ${inmueble}
        </p>
        <p>El propietario se pondrá en contacto contigo pronto.</p>
        <p style="margin: 30px 0;">
          <a href="http://localhost:3000/dashboard" 
             style="background-color: #3A4D39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver mi dashboard
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Rentify - Renta segura en Guadalajara</p>
      </div>
    `,
  })
}

export async function enviarEmailSolicitudRechazada(
  to: string,
  nombreInquilino: string,
  inmueble: string
): Promise<boolean> {
  return enviarEmail({
    to,
    subject: 'Actualización sobre tu solicitud',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3A4D39;">Rentify</h1>
        <h2>Hola ${nombreInquilino},</h2>
        <p>Lamentablemente, tu solicitud para la siguiente propiedad fue rechazada:</p>
        <p style="background: #fef2f2; padding: 12px; border-left: 4px solid #dc2626; border-radius: 4px;">
          ${inmueble}
        </p>
        <p>Pero no te desanimes: hay muchas más propiedades disponibles.</p>
        <p style="margin: 30px 0;">
          <a href="http://localhost:3000/propiedades" 
             style="background-color: #3A4D39; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Explorar propiedades
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">Rentify - Renta segura en Guadalajara</p>
      </div>
    `,
  })
}