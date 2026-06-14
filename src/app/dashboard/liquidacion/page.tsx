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
    { data: allAdditionals },
    { data: allNrItems },
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
          .select('id, codigo, nombre, numero_cct, tipo_liquidacion, jornada_estandar_horas, antiguedad_porcentaje, presentismo_porcentaje, aporte_sindical_porcentaje'),
        supabase
          .from('agreement_categories')
          .select('id, nombre, sueldo_basico, horas_referencia'),
        supabase
          .from('agreement_additionals')
          .select('agreement_id, nombre, valor, is_remunerativo'),
        // Sumas no remunerativas vigentes (convenio y/o categoría)
        supabase
          .from('agreement_non_remunerative_items')
          .select('agreement_id, category_id, concepto, monto, vigencia_desde, vigencia_hasta, requires_manual_review'),
      ])
    : Promise.all([
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
        Promise.resolve({ data: [] as Record<string, unknown>[] }),
      ]))

  // Merge manual: enriquecer cada empleado con sus datos de CCT, categoría y adicionales
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
      additionals={allAdditionals || []}
      nrItems={allNrItems || []}
    />
  )
}
