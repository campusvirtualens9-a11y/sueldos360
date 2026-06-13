'use client'

import { formatCurrency, formatPeriodo } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Props {
  company: { id: string; razon_social: string } | null
  payrollRuns: Record<string, unknown>[]
}

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportesClient({ company, payrollRuns }: Props) {
  if (!company) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Reportes y gráficos</h1>
        <div className="card text-center py-10"><p className="text-slate-500">Primero creá una empresa.</p></div>
      </div>
    )
  }

  if (payrollRuns.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Reportes y gráficos</h1>
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">📈</div>
          <p className="text-slate-600">Sin liquidaciones cerradas para mostrar reportes.</p>
        </div>
      </div>
    )
  }

  // Datos para el gráfico de evolución mensual
  const evolucion = payrollRuns.map(run => ({
    periodo: formatPeriodo(run.periodo as string).slice(0, 3) + ' ' + (run.periodo as string).split('-')[0],
    bruto: run.total_bruto as number,
    neto: run.total_neto as number,
    contribuciones: run.total_contribuciones_patronales as number,
    costo: run.total_costo_laboral as number,
  }))

  // Último período: composición del costo laboral
  const lastRun = payrollRuns[payrollRuns.length - 1]
  const composicion = [
    { name: 'Sueldo neto', value: lastRun?.total_neto as number || 0 },
    { name: 'Aportes trabajador', value: lastRun?.total_aportes_trabajador as number || 0 },
    { name: 'Contribuciones patronales', value: lastRun?.total_contribuciones_patronales as number || 0 },
  ]

  // Costo por empleado (último período)
  const lastResults = (lastRun?.payroll_results as Record<string, unknown>[]) || []
  const porEmpleado = lastResults.map(r => {
    const emp = r.employees as Record<string, unknown>
    return {
      nombre: `${(emp?.apellido as string || '').slice(0, 8)}...`,
      bruto: r.sueldo_bruto as number,
      neto: r.sueldo_neto as number,
      costo: r.costo_laboral as number,
    }
  })

  // KPIs
  const totalBruto = payrollRuns.reduce((acc, r) => acc + (r.total_bruto as number), 0)
  const totalNeto = payrollRuns.reduce((acc, r) => acc + (r.total_neto as number), 0)
  const totalAportes = payrollRuns.reduce((acc, r) => acc + (r.total_aportes_trabajador as number), 0)
  const totalCosto = payrollRuns.reduce((acc, r) => acc + (r.total_costo_laboral as number), 0)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reportes y gráficos</h1>
        <p className="text-sm text-slate-500 mt-0.5">{company.razon_social} · {payrollRuns.length} períodos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total bruto acumulado', value: totalBruto, color: 'green' },
          { label: 'Total neto acumulado', value: totalNeto, color: 'blue' },
          { label: 'Aportes totales', value: totalAportes, color: 'orange' },
          { label: 'Costo laboral total', value: totalCosto, color: 'purple' },
        ].map(kpi => (
          <div key={kpi.label} className="card">
            <div className="text-xs text-slate-400 mb-1">{kpi.label}</div>
            <div className="text-lg font-bold text-slate-800">{formatCurrency(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Evolución mensual */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">📈 Evolución mensual del costo laboral</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolucion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="bruto" stroke="#2563eb" name="Bruto" strokeWidth={2} />
              <Line type="monotone" dataKey="neto" stroke="#22c55e" name="Neto" strokeWidth={2} />
              <Line type="monotone" dataKey="costo" stroke="#8b5cf6" name="Costo laboral" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Composición del costo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">🍩 Composición del costo laboral (último período)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={composicion} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" nameKey="name">
                {composicion.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Costo por empleado */}
      {porEmpleado.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">👥 Costo laboral por empleado (último período)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porEmpleado} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v) || 0)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="bruto" fill="#2563eb" name="Bruto" />
              <Bar dataKey="neto" fill="#22c55e" name="Neto" />
              <Bar dataKey="costo" fill="#8b5cf6" name="Costo laboral" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
