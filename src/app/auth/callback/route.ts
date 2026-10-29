// Purpose: Valida el callback de Supabase Auth, vincula el perfil y controla la redireccion.
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const TIPOS_OTP_VALIDOS: EmailOtpType[] = ['signup', 'email', 'recovery', 'email_change']

function urlDestino(request: NextRequest, destino: string) {
  const destinoSeguro = destino.startsWith('/') && !destino.startsWith('//')
    ? destino
    : '/dashboard'
  return new URL(destinoSeguro, request.url)
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const supabase = await createSupabaseServerClient()
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const destino = url.searchParams.get('next') || '/dashboard'

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Error al intercambiar el código de autenticación:', error)
      return NextResponse.redirect(new URL('/login?correo=error', request.url))
    }
  } else if (tokenHash && type && TIPOS_OTP_VALIDOS.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (error) {
      console.error('Error al verificar el enlace de correo:', error)
      return NextResponse.redirect(new URL('/login?correo=error', request.url))
    }
  } else {
    return NextResponse.redirect(new URL('/login?correo=error', request.url))
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    console.error('No se pudo obtener la identidad verificada:', userError)
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?correo=error', request.url))
  }

  const usuario = await prisma.usuario.findFirst({
    where: { correo: { equals: user.email, mode: 'insensitive' } },
    select: { id: true, bloqueado: true },
  })

  if (!usuario || usuario.bloqueado) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?correo=cuenta', request.url))
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      auth_user_id: user.id,
      verificado_email: Boolean(user.email_confirmed_at),
      ultimo_acceso: new Date(),
    },
  })

  return NextResponse.redirect(urlDestino(request, destino))
}
