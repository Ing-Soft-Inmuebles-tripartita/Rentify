import { Suspense } from 'react'
import Link from 'next/link'
import { User, LayoutDashboard, LogOut, Settings, HelpCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { logoutAction } from '@/app/actions/auth'

async function NavbarAuth() {
  const usuario = await getCurrentUser()

  if (!usuario) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-primary bg-surface-card hover:bg-surface-container transition"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/registro"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-secondary hover:bg-primary transition"
        >
          Registrarse
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/perfil"
        className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition"
        title="Mi perfil"
      >
        <Settings size={20} />
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container hover:bg-secondary hover:text-white transition text-sm font-semibold text-primary"
      >
        <LayoutDashboard size={18} />
        <span className="hidden sm:inline">{usuario.nombre}</span>
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="p-2 text-status-error hover:opacity-70 transition"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </form>
    </div>
  )
}

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
            Rentify
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/propiedades"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-on-surface transition"
            >
              Explorar viviendas
            </Link>
            <Link
              href="/seguridad"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-on-surface transition"
            >
              Seguridad
            </Link>
            <Link
              href="/guia"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-on-surface transition"
            >
              Guía GDL
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/publicar"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-primary bg-surface-card hover:bg-surface-container transition"
          >
            Publicar propiedad
          </Link>
          <Link
            href="/seguridad"
            className="p-2 text-on-surface-variant hover:text-on-surface rounded-full transition"
            aria-label="Ayuda"
          >
            <HelpCircle size={20} />
          </Link>
          <Suspense fallback={<div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />}>
            <NavbarAuth />
          </Suspense>
        </div>
      </div>
    </header>
  )
}