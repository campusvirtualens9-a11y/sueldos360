import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import F931Client from './F931Client'

export default async function F931Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: closedRuns } = company
    ? await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'cerrada')
        .order('periodo', { ascending: false })
    : { data: [] }

  const { data: f931Reports } = company
    ? await supabase
        .from('f931_reports')
        .select('*')
        .eq('company_id', company.id)
        .order('periodo', { ascending: false })
    : { data: [] }

  return (
    <F931Client
      company={company}
      closedRuns={closedRuns || []}
      existingReports={f931Reports || []}
      userId={user!.id}
    />
  )
}
