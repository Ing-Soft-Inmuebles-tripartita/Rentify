import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F3F1EB] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <p className="text-9xl font-serif font-bold text-[#3A4D39]">404</p>
        </div>

        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#3A4D39] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
          <Link
            href="/propiedades"
            className="flex items-center justify-center gap-2 border-2 border-[#3A4D39] text-[#3A4D39] px-6 py-3 rounded-lg hover:bg-[#3A4D39] hover:text-white transition font-medium"
          >
            <Search size={18} />
            Buscar propiedades
          </Link>
        </div>
      </div>
    </main>
  )
}