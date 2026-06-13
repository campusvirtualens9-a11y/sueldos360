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

  // agreement_id y agreement_category_id no tienen FK declarada en el schema,
  // PostgREST no puede resolver el join automáticamente. Fetching por separado.
  const [
    { data: rawEmployees },
    { data: allAgreements },
    { data: allCategories },
  ] = await (company
    ? Promise.all([
        supabase
          .from('employees')
          .select('*')
          .eq('company_id', company.id)
          .eq('status', 'activo')
          .order('apellido'),
        supabase
          .from('agreements')
          .select('id, nombre, numero_cct, antiguedad_porcentaje, presentismo_porcentaje'),
        supabase
          .from('agreement_categories')
          .select('id, nombre, sueldo_basico'),
      ])
    : Promise.all([
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
      ]))

  // Merge manual: enriquecer cada empleado con sus datos de CCT y categoría
  const employees = (rawEmployees || []).map(emp => ({
    ...emp,
    agreements: allAgreements?.find(a => a.id === emp.agreement_id) ?? null,
    agreement_categories: allCategories?.find(c => c.id === emp.agreement_category_id) ?? null,
  }))

  const periodo = getCurrentPeriodo()

  const [{ data: novelties }, { data: payrollRuns }] = await (company
    ? Promise.all([
        supabase
          .from('monthly_novelties')
          .select('*')
          .eq('company_id', company.id)
          .eq('periodo', periodo),
        supabase
          .from('payroll_runs')
          .select('*')
          .eq('company_id', company.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])
    : Promise.all([
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
      ]))

  return (
    <LiquidacionClient
      company={company}
      employees={employees}
      novelties={novelties || []}
      payrollRuns={payrollRuns || []}
      periodo={periodo}
      userId={user!.id}
    />
  )
}
