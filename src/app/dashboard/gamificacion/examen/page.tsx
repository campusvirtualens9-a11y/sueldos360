import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExamenClient from './ExamenClient'

export default async function ExamenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: achievements } = await supabase
    .from('achievements')
    .select('codigo')
    .eq('user_id', user.id)

  const codes = new Set((achievements ?? []).map((a: { codigo: string }) => a.codigo))

  if (!codes.has('CIRCUITO_COMPLETO')) {
    redirect('/dashboard/gamificacion')
  }

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)

  return (
    <ExamenClient
      userId={user.id}
      companyId={companies?.[0]?.id ?? null}
      yaAprobado={codes.has('EXAMEN_APROBADO')}
    />
  )
}
