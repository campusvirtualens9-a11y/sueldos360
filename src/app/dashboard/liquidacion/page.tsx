import { createClient } from '@/lib/supabase/server'
import LiquidacionClient from './LiquidacionClient'
import { getCurrentPeriodo } from '@/lib/utils'

export default async function LiquidacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*, legal_parameters(*)')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: employees } = company
    ? await supabase
        .from('employees')
        .select('*, agreements(nombre, numero_cct, antiguedad_porcentaje, presentismo_porcentaje), agreement_categories(nombre, sueldo_basico)')
        .eq('company_id', company.id)
        .eq('status', 'activo')
    : { data: [] }

  const periodo = getCurrentPeriodo()

  const { data: novelties } = company
    ? await supabase
        .from('monthly_novelties')
        .select('*')
        .eq('company_id', company.id)
        .eq('periodo', periodo)
    : { data: [] }

  const { data: payrollRuns } = company
    ? await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)
    : { data: [] }

  return (
    <LiquidacionClient
      company={company}
      employees={employees || []}
      novelties={novelties || []}
      payrollRuns={payrollRuns || []}
      periodo={periodo}
      userId={user!.id}
    />
  )
}
