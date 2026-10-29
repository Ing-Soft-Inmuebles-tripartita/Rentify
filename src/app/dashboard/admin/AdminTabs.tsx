// Purpose: Organiza las secciones del panel de administracion.
'use client'

import { useState } from 'react'
import type { DocumentoAdmin } from './TabVerificaciones'
import type { PublicacionAdmin } from './TabModeracion'
import type { ReporteAdmin } from './TabReportes'
import { Home, FileCheck, AlertTriangle } from 'lucide-react'
import TabModeracion from './TabModeracion'
import TabVerificaciones from './TabVerificaciones'
import TabReportes from './TabReportes'

interface Props {
  publicaciones: PublicacionAdmin[]
  documentos: DocumentoAdmin[]
  reportes: ReporteAdmin[]
}

type Tab = 'moderacion' | 'verificaciones' | 'reportes'

export default function AdminTabs({ publicaciones, documentos, reportes }: Props) {
  const [tab, setTab] = useState<Tab>('moderacion')

  return (
    <div>
      <div className="bg-white rounded-t-2xl shadow-sm border-b">
        <div className="flex">
          <TabButton
            active={tab === 'moderacion'}
            onClick={() => setTab('moderacion')}
            icon={<Home size={18} />}
            label="Moderación"
          />
          <TabButton
            active={tab === 'verificaciones'}
            onClick={() => setTab('verificaciones')}
            icon={<FileCheck size={18} />}
            label="Verificaciones"
          />
          <TabButton
            active={tab === 'reportes'}
            onClick={() => setTab('reportes')}
            icon={<AlertTriangle size={18} />}
            label="Reportes"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm p-6">
        {tab === 'moderacion' && <TabModeracion publicaciones={publicaciones} />}
        {tab === 'verificaciones' && <TabVerificaciones documentos={documentos} />}
        {tab === 'reportes' && <TabReportes reportes={reportes} />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition ${
        active
          ? 'text-primary border-b-2 border-primary bg-surface-container/50'
          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/30'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}