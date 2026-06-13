import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatPeriodo } from '@/lib/utils'
import LibroExportButton from './LibroExportButton'

export default async function LibroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: payrollRuns } = company
    ? await supabase
        .from('payroll_runs')
        .select('*, payroll_results(*, employees(apellido, nombre, cuil, categoria, fecha_ingreso))')
        .eq('company_id', company.id)
        .eq('status', 'cerrada')
        .order('periodo', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Libro de Sueldos y Jornales</h1>
          <p className="text-sm text-slate-500 mt-0.5">{company?.razon_social || 'Sin empresa'}</p>
        </div>
      </div>

      <div className="edu-banner mb-6">
        <strong>Simulación educativa:</strong> El Libro de Sueldos y Jornales de esta app es una simulación educativa.
        En la vida real, su registración depende de la normativa laboral aplicable y de los sistemas oficiales o provinciales correspondientes.
      </div>

      {(!payrollRuns || payrollRuns.length === 0) && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-slate-600 font-medium">Sin liquidaciones cerradas</p>
          <p className="text-sm text-slate-500 mt-1">Cerrá una liquidación para generar el libro.</p>
        </div>
      )}

      {payrollRuns && payrollRuns.length > 0 && (
        <div className="space-y-6">
          {(payrollRuns as Record<string, unknown>[]).map(run => {
            const results = (run.payroll_results as Record<string, unknown>[]) || []
            return (
              <div key={run.id as string} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {formatPeriodo(run.periodo as string)} — {run.tipo as string}
                    </h2>
                    <p className="text-xs text-slate-500">{results.length} empleados</p>
                  </div>
                  <LibroExportButton run={run} company={company} results={results} />
                </div>

                <div className="overflow-x-auto">
                  <table className="table-base text-xs">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>CUIL</th>
                        <th>Días</th>
                        <th>Remunerativo</th>
                        <th>No remunerativo</th>
                        <th>Descuentos</th>
                        <th>Neto</th>
                        <th>Aportes</th>
                        <th>Contrib.</th>
                        <th>Costo laboral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(result => {
                        const emp = result.employees as Record<string, unknown>
                        return (
                          <tr key={result.id as string}>
                            <td className="font-medium">{emp?.apellido as string}, {emp?.nombre as string}</td>
                            <td className="font-mono">{emp?.cuil as string}</td>
                            <td className="text-center">{result.dias_trabajados as number}</td>
                            <td className="font-mono">{formatCurrency(result.total_remunerativo as number)}</td>
                            <td className="font-mono">{formatCurrency(result.total_no_remunerativo as number)}</td>
                            <td className="font-mono text-red-600">-{formatCurrency(result.total_descuentos as number)}</td>
                            <td className="font-mono font-bold text-blue-700">{formatCurrency(result.sueldo_neto as number)}</td>
                            <td className="font-mono text-orange-600">{formatCurrency(result.total_aportes as number)}</td>
                            <td className="font-mono text-orange-600">{formatCurrency(result.total_contribuciones as number)}</td>
                            <td className="font-mono font-bold text-purple-700">{formatCurrency(result.costo_laboral as number)}</td>
                          </tr>
                        )
                      })}
                      <tr className="bg-slate-800 text-white font-bold">
                        <td colSpan={3}>TOTALES DEL PERÍODO</td>
                        <td className="font-mono">{formatCurrency(run.total_bruto as number)}</td>
                        <td></td>
                        <td className="font-mono">-{formatCurrency(run.total_descuentos as number)}</td>
                        <td className="font-mono">{formatCurrency(run.total_neto as number)}</td>
                        <td className="font-mono">{formatCurrency(run.total_aportes_trabajador as number)}</td>
                        <td className="font-mono">{formatCurrency(run.total_contribuciones_patronales as number)}</td>
                        <td className="font-mono">{formatCurrency(run.total_costo_laboral as number)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
