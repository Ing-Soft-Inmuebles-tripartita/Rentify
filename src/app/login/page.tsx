import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './LoginForm'

async function LoginContent() {
  const usuario = await getCurrentUser()
  if (usuario) redirect('/dashboard')

  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
