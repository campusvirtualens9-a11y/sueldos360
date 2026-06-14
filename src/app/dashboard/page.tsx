import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import Link from 'next/link'

const CIRCUIT_STEPS = [
  { id: 1, label: 'Empresa cargada', href: '/dashboard/empresas' },
  { id: 2, label: 'Convenio seleccionado', href: '/dashboard/convenios' },
  { id: 3, label: 'Parámetros configurados', href: '/dashboard/parametros' },
  { id: 4, label: 'Legajos completos', href: '/dashboard/legajos' },
  { id: 5, label: 'Novedades cargadas', href: '/dashboard/novedades' },
  { id: 6, label: 'Liquidación generada', href: '/dashboard/liquidacion' },
  { id: 7, label: 'Recibos emitidos', href: '/dashboard/recibos' },
  { id: 8, label: 'Libro de sueldos generado', href: '/dashboard/libro' },
  { id: 9, label: 'F.931 simulado generado', href: '/dashboard/f931' },
  { id: 10, label: 'Reportes revisados', href: '/dashboard/reportes' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Cargar empresa activa
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .eq('is_active', true)
    .limit(1)

  const company = companies?.[0] || null

  // Cargar empleados activos
  const { count: employeeCount } = company
    ? await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'activo')
    : { count: 0 }

  // Últimas liquidaciones
  const { data: lastPayrolls } = company
    ? await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: [] }

  const periodo = getCurrentPeriodo()

  const [
    { count: empWithAgreement },
    { count: novCount },
    { count: payslipCount },
    { count: f931Count },
    { data: circuitAchievements },
  ] = await (company
    ? Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true })
          .eq('company_id', company.id).eq('status', 'activo').not('agreement_id', 'is', null),
        supabase.from('monthly_novelties').select('*', { count: 'exact', head: true })
          .eq('company_id', company.id).eq('periodo', periodo),
        supabase.from('payslips').select('*', { count: 'exact', head: true })
          .eq('company_id', company.id).eq('emitido', true),
        supabase.from('f931_reports').select('*', { count: 'exact', head: true })
          .eq('company_id', company.id),
        supabase.from('achievements').select('codigo').eq('user_id', user!.id),
      ])
    : Promise.all([
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ count: 0 }),
        Promise.resolve({ data: [] as { codigo: string }[] }),
      ]))

  const achievementCodes = new Set((circuitAchievements ?? []).map((a: { codigo: string }) => a.codigo))

  const stepsDone = [
    !!company,
    (empWithAgreement ?? 0) > 0,
    !!company,
    (employeeCount ?? 0) > 0,
    (novCount ?? 0) > 0,
    (lastPayrolls?.length ?? 0) > 0,
    (payslipCount ?? 0) > 0,
    achievementCodes.has('LIBRO_GENERADO'),
    (f931Count ?? 0) > 0,
    achievementCodes.has('REPORTE_REVISADO'),
  ]

  const stepsCompleted = stepsDone.filter(Boolean).length
  const progressPct = Math.round((stepsCompleted / CIRCUIT_STEPS.length) * 100)

  // Alertas
  const alerts = []
  if (!company) alerts.push({ type: 'error', msg: 'No hay empresa activa. Cargá tu primera empresa.', href: '/dashboard/empresas/nueva' })
  if (company && (!employeeCount || employeeCount === 0)) alerts.push({ type: 'warning', msg: 'No hay empleados activos en la empresa.', href: '/dashboard/legajos' })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {company ? company.razon_social : 'Sin empresa seleccionada'} · Período: {formatPeriodo(periodo)}
          </p>
        </div>
        <div className="flex gap-2">
          {company && (
            <span className="badge badge-green text-xs px-3 py-1">{employeeCount || 0} empleados activos</span>
          )}
          <Link href="/dashboard/empresas" className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {company ? 'Cambiar empresa' : 'Crear empresa'}
          </Link>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="mb-6 flex flex-col gap-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm ${
              a.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              <span>{a.type === 'error' ? '❌' : '⚠️'} {a.msg}</span>
              <Link href={a.href} className="font-semibold underline ml-2 text-xs">Ir →</Link>
            </div>
          ))}
        </div>
      )}

      {/* KPIs */}
      {company && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Empleados activos', value: String(employeeCount || 0), icon: '👥', color: 'blue' },
            { label: 'Última liquidación bruta', value: lastPayrolls?.[0] ? formatCurrency(lastPayrolls[0].total_bruto) : '—', icon: '💰', color: 'green' },
            { label: 'Aportes (último período)', value: lastPayrolls?.[0] ? formatCurrency(lastPayrolls[0].total_aportes_trabajador) : '—', icon: '📤', color: 'orange' },
            { label: 'Costo laboral (último período)', value: lastPayrolls?.[0] ? formatCurrency(lastPayrolls[0].total_costo_laboral) : '—', icon: '🏭', color: 'purple' },
          ].map(kpi => (
            <div key={kpi.label} className="card">
              <div className="text-2xl mb-2">{kpi.icon}</div>
              <div className="text-xl font-bold text-slate-800">{kpi.value}</div>
              <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Circuito de liquidación */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">🔄 Circuito de liquidación</h2>
          <span className="text-sm font-bold text-blue-600">{progressPct}% completado</span>
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
                <div className="text-base mb-0.5">{done ? '✅' : `${step.id}`}</div>
                <div className="leading-tight">{step.label}</div>
              </Link>
            )
          })}
        </div>
        {progressPct === 100 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-700 font-semibold text-sm">
            🎉 ¡100% de realización del período! Circuito completo.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Últimas liquidaciones */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📋 Últimas liquidaciones</h3>
          {lastPayrolls && lastPayrolls.length > 0 ? (
            <table className="table-base">
              <thead><tr><th>Período</th><th>Tipo</th><th>Bruto</th><th>Estado</th></tr></thead>
              <tbody>
                {lastPayrolls.map(p => (
                  <tr key={p.id}>
                    <td>{formatPeriodo(p.periodo)}</td>
                    <td className="capitalize">{p.tipo}</td>
                    <td className="font-mono">{formatCurrency(p.total_bruto)}</td>
                    <td>
                      <span className={`badge text-xs ${p.status === 'cerrada' ? 'badge-green' : 'badge-yellow'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm">Sin liquidaciones todavía.</p>
              <Link href="/dashboard/liquidacion" className="text-blue-600 text-xs font-medium mt-2 block">
                Crear primera liquidación →
              </Link>
            </div>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">⚡ Accesos rápidos</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nueva liquidación', href: '/dashboard/liquidacion', icon: '💰' },
              { label: 'Cargar novedades', href: '/dashboard/novedades', icon: '📅' },
              { label: 'Ver legajos', href: '/dashboard/legajos', icon: '👥' },
              { label: 'Exportar recibos', href: '/dashboard/recibos', icon: '🧾' },
              { label: 'Libro de sueldos', href: '/dashboard/libro', icon: '📚' },
              { label: 'F.931 simulado', href: '/dashboard/f931', icon: '📊' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
              >
                <span>{a.icon}</span>
                <span className="font-medium text-xs">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Banner educativo */}
      <div className="edu-banner mt-6 text-xs">
        <strong>Textos educativos:</strong> Primero se cargan los datos de la empresa y los legajos. Luego se configuran convenios, categorías y parámetros.
        Después se cargan las novedades del período. La liquidación calcula haberes, descuentos, aportes y contribuciones.
        Los aportes son retenidos al trabajador. Las contribuciones son costo del empleador.
      </div>
    </div>
  )
}
