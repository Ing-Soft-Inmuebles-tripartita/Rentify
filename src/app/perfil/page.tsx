import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import PerfilTabs from './PerfilTabs'
import SubirDocumento from './SubirDocumento'

async function PerfilContent() {
  const usuario = await getCurrentUser()
  if (!usuario) return null

  const documentos = await prisma.documento.findMany({
    where: { usuario_id: usuario.id },
    orderBy: { fecha_carga: 'desc' },
  })

  const referencias = usuario.inquilino
    ? await prisma.referenciaRenta.findMany({
        where: { inquilino_id: usuario.inquilino.usuario_id },
        select: {
          id: true,
          nombre_contacto: true,
          telefono: true,
          relacion: true,
          comentario: true,
        },
        orderBy: { fecha_creacion: 'desc' },
      })
    : []

  const estadoDoc = (estado: string) => {
    if (estado === 'aprobado') return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Aprobado' }
    if (estado === 'rechazado') return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Rechazado' }
    return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pendiente' }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[#3A4D39] font-medium mb-6 hover:opacity-80"
      >
        <ArrowLeft size={18} /> Volver al dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1F1F1F]">Mi perfil</h1>
        <p className="text-gray-600 mt-1">
          {usuario.nombre} {usuario.apellido} · {usuario.correo}
        </p>
      </div>

      <PerfilTabs usuario={usuario} referencias={referencias} />

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-xl font-bold text-[#1F1F1F] mb-2 flex items-center gap-2">
          <FileText size={22} /> Documentos de verificación
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Sube tu INE, comprobante de ingresos o escrituras para verificar tu cuenta.
          Un administrador revisará cada documento.
        </p>

        <SubirDocumento />

        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 mb-3">
            Mis documentos ({documentos.length})
          </h3>

          {documentos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Aún no has subido documentos
            </p>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => {
                const estado = estadoDoc(doc.estado)
                const Icon = estado.icon
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={20} className="text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[#1F1F1F] text-sm truncate">
                          {doc.tipo_documento}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.fecha_carga).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${estado.bg} ${estado.color}`}>
                      <Icon size={14} /> {estado.label}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  return (
    <main className="min-h-screen bg-[#F3F1EB] py-10 px-6">
      <Suspense
        fallback={
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        }
      >
        <PerfilContent />
      </Suspense>
    </main>
  )
}