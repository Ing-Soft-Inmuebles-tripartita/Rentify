export const instant = false

import { Suspense } from 'react'
import RestablecerForm from './RestablecerForm'

interface Props {
  params: Promise<{ token: string }>
}

async function RestablecerContent({ params }: Props) {
  const { token } = await params
  return <RestablecerForm token={token} />
}

export default function RestablecerPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F3F1EB] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#3A4D39] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </main>
      }
    >
      <RestablecerContent params={params} />
    </Suspense>
  )
}