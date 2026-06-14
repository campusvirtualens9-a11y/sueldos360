import { createClient } from '@/lib/supabase/server'
import { getCurrentPeriodo } from '@/lib/utils'
import Link from 'next/link'
import { ACHIEVEMENT_DEFS } from '@/lib/achievements'

const CIRCUIT_STEPS = [
  { id: 1, label: 'Empresa cargada',          href: '/dashboard/empresas' },
  { id: 2, label: 'Convenio seleccionado',    href: '/dashboard/convenios' },
  { id: 3, label: 'Parámetros configurados',  href: '/dashboard/parametros' },
  { id: 4, label: 'Legajos completos',        href: '/dashboard/legajos' },
  { id: 5, label: 'Novedades cargadas',       href: '/dashboard/novedades' },
  { id: 6, label: 'Liquidación generada',     href: '/dashboard/liquidacion' },
  { id: 7, label: 'Recibos emitidos',         href: '/dashboard/recibos' },
  { id: 8, label: 'Libro de sueldos',         href: '/dashboard/libro' },
  { id: 9, label: 'F.931 preparado',          href: '/dashboard/f931' },
  { id: 10, label: 'Reportes revisados',      href: '/dashboard/reportes' },
]

const LEVELS = [
  { max: 2,  label: 'Principiante' },
  { max: 5,  label: 'Intermedio' },
  { max: 8,  label: 'Avanzado' },
  { max: 100, label: 'Experto 🏆' },
]

function getLevel(count: number) {
  return LEVELS.find(l => count <= l.max)?.label ?? 'Experto 🏆'
}

export default async function GamificacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const periodo = getCurrentPeriodo()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .limit(1)

  const company = companies?.[0] ?? null
  const companyId = company?.id ?? 'none'

  const [
    { data: employees },
    { data: novelties },
    { data: payrollRuns },
    { data: payslips },
    { data: f931Reports },
    { data: userAchievements },
  ] = await Promise.all([
    supabase.from('employees').select('id, agreement_id').eq('company_id', companyId).eq('status', 'activo'),
    supabase.from('monthly_novelties').select('id').eq('company_id', companyId).eq('periodo', periodo).limit(1),
    supabase.from('payroll_runs').select('id').eq('company_id', companyId).limit(1),
    supabase.from('payslips').select('id').eq('company_id', companyId).eq('emitido', true).limit(1),
    supabase.from('f931_reports').select('id').eq('company_id', companyId).limit(1),
    supabase.from('achievements').select('codigo, unlocked_at').eq('user_id', user!.id),
  ])

  const unlockedMap = new Map<string, string>(
    (userAchievements ?? []).map((a: { codigo: string; unlocked_at: string }) => [a.codigo, a.unlocked_at])
  )

  const stepsDone = [
    !!company,
    (employees ?? []).some((e: { agreement_id: string | null }) => e.agreement_id),
    !!company,
    (employees ?? []).length > 0,
    (novelties ?? []).length > 0,
    (payrollRuns ?? []).length > 0,
    (payslips ?? []).length > 0,
    unlockedMap.has('LIBRO_GENERADO'),
    (f931Reports ?? []).length > 0,
    unlockedMap.has('REPORTE_REVISADO'),
  ]

  const stepsCompleted = stepsDone.filter(Boolean).length
  const progressPct = Math.round((stepsCompleted / 10) * 100)
  const allDone = stepsDone.every(Boolean)

  if (allDone && !unlockedMap.has('CIRCUITO_COMPLETO')) {
    const def = ACHIEVEMENT_DEFS.CIRCUITO_COMPLETO
    await supabase.from('achievements').upsert(
      {
        user_id: user!.id,
        company_id: company?.id ?? null,
        codigo: 'CIRCUITO_COMPLETO',
        nombre: def.nombre,
        descripcion: def.descripcion,
        icono: def.icono,
      },
      { onConflict: 'user_id,codigo', ignoreDuplicates: true }
    )
    unlockedMap.set('CIRCUITO_COMPLETO', new Date().toISOString())
  }

  const totalUnlocked = unlockedMap.size
  const nextStep = CIRCUIT_STEPS.find((_, i) => !stepsDone[i])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis logros</h1>
          <p className="text-sm text-slate-500 mt-0.5">{company?.razon_social ?? 'Sin empresa'}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 text-slate-700 text-sm px-4 py-2 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {getLevel(totalUnlocked)}
        </div>
      </div>

      {/* Circuit progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">🔄 Circuito de liquidación</h2>
          <span className="text-sm font-bold text-blue-600">{stepsCompleted}/10 pasos · {progressPct}%</span>
        </div>
        <div className="progress-bar mb-4">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CIRCUIT_STEPS.map((step, i) => {
            const done = stepsDone[i]
            return (
              <Link key={step.id} href={step.href}
                className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                  done
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="text-base mb-0.5">{done ? '✅' : step.id}</div>
                <div className="leading-tight">{step.label}</div>
              </Link>
            )
          })}
        </div>
        {nextStep && !allDone && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
            <span className="text-sm text-blue-700">
              Siguiente: <strong>{nextStep.label}</strong>
            </span>
            <Link href={nextStep.href}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700">
              Ir →
            </Link>
          </div>
        )}
        {allDone && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-700 font-semibold text-sm">
            🎉 ¡100% completado! Circuito de liquidación finalizado.
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Logros
        </h2>
        <span className="text-sm text-slate-500">{totalUnlocked} / {Object.keys(ACHIEVEMENT_DEFS).length} desbloqueados</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {(Object.entries(ACHIEVEMENT_DEFS) as [string, { nombre: string; descripcion: string; icono: string }][]).map(([codigo, def]) => {
          const unlockedAt = unlockedMap.get(codigo)
          return (
            <div key={codigo}
              className={`card flex items-start gap-3 transition-opacity ${unlockedAt ? '' : 'opacity-40'}`}>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 ${
                unlockedAt ? 'bg-green-50' : 'bg-slate-100'
              }`}>
                {def.icono}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-800">{def.nombre}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-tight">{def.descripcion}</p>
                {unlockedAt && (
                  <p className="text-[10px] text-green-600 mt-1 font-medium">
                    ✓ {new Date(unlockedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="edu-banner text-xs">
        <strong>Gamificación educativa:</strong> Los logros se desbloquean automáticamente al completar
        cada paso del circuito de liquidación de sueldos. El progreso refleja el avance en el aprendizaje
        del proceso completo según la legislación laboral argentina.
      </div>
    </div>
  )
}
