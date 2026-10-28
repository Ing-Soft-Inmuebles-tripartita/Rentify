import { createClient } from '@supabase/supabase-js'

// Este cliente usa la clave pública; el acceso real a los archivos depende de las políticas de Storage.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)