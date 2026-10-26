import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function SeguridadPage() {
  return (
    <main className="min-h-screen bg-[#F3F1EB]">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-[#3A4D39] font-medium">
            <ArrowLeft size={20} /> Volver
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <ShieldCheck size={64} className="mx-auto text-[#3A4D39] mb-6" />
        <h1 className="text-3xl font-bold text-[#1F1F1F] mb-4">Seguridad Rentify</h1>
        <p className="text-gray-600">Verificamos a todos los propietarios e inquilinos para garantizar rentas seguras.</p>
      </div>
    </main>
  )
}