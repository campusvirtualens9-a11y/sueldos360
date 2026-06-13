import { createClient } from '@/lib/supabase/server'
import ReportesClient from './ReportesClient'

export default async function ReportesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: payrollRuns } = company
    ? await supabase
        .from('payroll_runs')
        .select('*, payroll_results(employee_id, sueldo_bruto, sueldo_neto, total_aportes, total_contribuciones, costo_laboral, employees(apellido, nombre))')
        .eq('company_id', company.id)
        .eq('status', 'cerrada')
        .order('periodo')
    : { data: [] }

  return <ReportesClient company={company} payrollRuns={payrollRuns || []} />
}
