import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
const COOKIE_NAME = 'rentify_session'

const RUTAS_PROTEGIDAS = ['/dashboard', '/perfil']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  let sesionValida = false
  if (token) {
    try {
      // El middleware hace una comprobación rápida de firma; las acciones de servidor
      // deben volver a comprobar la identidad y los permisos antes de modificar datos.
      await jwtVerify(token, secret)
      sesionValida = true
    } catch {
      sesionValida = false
    }
  }

  if (RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta))) {
    if (!sesionValida) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/perfil/:path*',
  ],
}