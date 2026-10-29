// Purpose: Mantiene la ruta heredada y redirige al flujo de recuperacion vigente.
import { redirect } from 'next/navigation'

export default function EnlaceAnteriorPage() {
  redirect('/recuperar')
}
