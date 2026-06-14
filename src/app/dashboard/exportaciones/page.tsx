import { createClient } from '@/lib/supabase/server'
import ExportacionesClient from './ExportacionesClient'

export default async function ExportacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: employees } = company
    ? await supabase.from('employees').select('*').eq('company_id', company.id)
    : { data: [] }

  const { data: payrollRuns } = company
    ? await supabase.from('payroll_runs').select('*, payroll_results(*, employees(apellido, nombre, cuil), payroll_result_items(*))')
        .eq('company_id', company.id).order('periodo', { ascending: false })
    : { data: [] }

  return <ExportacionesClient company={company} employees={employees || []} payrollRuns={payrollRuns || []} userId={user!.id} />
}
