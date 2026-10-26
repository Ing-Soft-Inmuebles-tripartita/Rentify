export const instant = false

import { Suspense } from 'react'
import PropiedadContent from './PropiedadContent'

interface Props {
  params: Promise<{ id: string }>
}

async function Content({ params }: Props) {
  return <PropiedadContent params={params} />
}

export default function PropiedadPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-surface">
          <div className="pt-20 flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-on-surface-variant">Cargando propiedad...</p>
            </div>
          </div>
        </main>
      }
    >
      <Content params={params} />
    </Suspense>
  )
}