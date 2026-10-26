'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en la aplicación:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#F3F1EB] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={40} className="text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-3">
          Algo salió mal
        </h1>
        <p className="text-gray-600 mb-8">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-[#3A4D39] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            <RotateCcw size={18} />
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border-2 border-[#3A4D39] text-[#3A4D39] px-6 py-3 rounded-lg hover:bg-[#3A4D39] hover:text-white transition font-medium"
          >
            <Home size={18} />
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}