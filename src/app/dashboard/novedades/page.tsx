import { createClient } from '@/lib/supabase/server'
import NovedadesClient from './NovedadesClient'
import { getCurrentPeriodo } from '@/lib/utils'

export default async function NovedadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: employees } = company
    ? await supabase
        .from('employees')
        .select('id, apellido, nombre, status, modalidad')
        .eq('company_id', company.id)
        .eq('status', 'activo')
        .order('apellido')
    : { data: [] }

  const periodo = getCurrentPeriodo()

  const { data: novelties } = company
    ? await supabase
        .from('monthly_novelties')
        .select('*')
        .eq('company_id', company.id)
        .eq('periodo', periodo)
    : { data: [] }

  return (
    <NovedadesClient
      company={company}
      employees={employees || []}
      novelties={novelties || []}
      periodo={periodo}
    />
  )
}
