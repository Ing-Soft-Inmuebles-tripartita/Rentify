// Purpose: Implementa la interfaz y logica de layout.
import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Home, LogOut, User } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { logoutAction } from '@/app/actions/auth'

async function UserHeader() {
  const usuario = await getCurrentUser()
  if (!usuario) redirect('/login')

  const esAdmin = !!usuario.administrador
  const esPropietario = !!usuario.propietario

  return (
    <div className="flex items-center gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#3A4D39] transition"
      >
        <Home size={18} />
        Inicio
      </Link>

      <div className="flex items-center gap-3 pl-6 border-l">
        <div className="w-10 h-10 bg-[#3A4D39] rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-[#1F1F1F]">
            {usuario.nombre} {usuario.apellido}
          </p>
          <p className="text-xs text-gray-500">
            {esAdmin ? 'Admin' : esPropietario ? 'Propietario' : 'Inquilino'}
          </p>
        </div>
      </div>

      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition font-medium"
        >
          <LogOut size={18} />
          Salir
        </button>
      </form>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F3F1EB]">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif font-bold text-[#1F1F1F]">
            Rentify
          </Link>

          <Suspense fallback={<div className="w-48 h-10 bg-gray-100 rounded animate-pulse" />}>
            <UserHeader />
          </Suspense>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}