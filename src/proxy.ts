import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const RUTAS_PROTEGIDAS = ['/dashboard', '/perfil']

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error('Error al validar la sesión en Proxy:', error)
  }

  const { pathname } = request.nextUrl
  if (RUTAS_PROTEGIDAS.some((ruta) => pathname.startsWith(ruta)) && !user) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/login'
    destino.searchParams.set('redirect', pathname)
    const respuestaRedireccion = NextResponse.redirect(destino)
    response.cookies.getAll().forEach((cookie) => {
      respuestaRedireccion.cookies.set(cookie)
    })
    return respuestaRedireccion
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
