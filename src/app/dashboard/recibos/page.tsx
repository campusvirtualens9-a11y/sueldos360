import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, formatPeriodo } from '@/lib/utils'
import RecibosPDFButton from './RecibosPDFButton'

export default async function RecibosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .limit(1)

  const company = companies?.[0] || null

  const { data: payslips } = company
    ? await supabase
        .from('payslips')
        .select('*, employees(apellido, nombre, cuil, categoria), payroll_results(sueldo_bruto, sueldo_neto, total_aportes, total_contribuciones, costo_laboral, total_remunerativo, total_no_remunerativo, total_descuentos, payroll_result_items(*))')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recibos de sueldo</h1>
          <p className="text-sm text-slate-500 mt-0.5">{company?.razon_social || 'Sin empresa'}</p>
        </div>
      </div>

      <div className="edu-banner mb-6">
        <strong>Recibos educativos:</strong> El recibo muestra el neto que cobra el trabajador.
        Cada recibo generado incluye la leyenda "Recibo simulado con fines educativos".
      </div>

      {!company && (
        <div className="card text-center py-12">
          <p className="text-slate-500">Primero creá una empresa y liquidá sueldos.</p>
        </div>
      )}

      {company && (!payslips || payslips.length === 0) && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-slate-600 font-medium mb-2">Sin recibos todavía</p>
          <p className="text-sm text-slate-500">Cerrá una liquidación para generar los recibos.</p>
        </div>
      )}

      {payslips && payslips.length > 0 && (
        <div className="space-y-3">
          {(payslips as Record<string, unknown>[]).map(slip => {
            const emp = slip.employees as Record<string, unknown>
            const result = slip.payroll_results as Record<string, unknown>
            const items = (result?.payroll_result_items as Record<string, unknown>[]) || []
            const haberes = items.filter(i => i.tipo !== 'descuento' && i.tipo !== 'contribucion_patronal')
            const descuentos = items.filter(i => i.tipo === 'descuento')

            return (
              <div key={slip.id as string} className="card">
                {/* Encabezado del recibo */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-800">{emp?.apellido as string}, {emp?.nombre as string}</h3>
                    <p className="text-xs text-slate-500">CUIL: {emp?.cuil as string} · {emp?.categoria as string || '—'}</p>
                    <p className="text-xs text-slate-500">Período: {formatPeriodo(slip.periodo as string)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Empresa</div>
                    <div className="font-medium text-sm text-slate-700">{company.razon_social}</div>
                    <div className="text-xs text-slate-400 mt-1">CUIT: {company.cuit}</div>
                    {!!slip.emitido && <span className="badge badge-green text-xs mt-1">✓ Emitido</span>}
                  </div>
                </div>

                {/* Tabla de conceptos */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-semibold text-green-700 mb-2 uppercase">Haberes</h4>
                    <table className="table-base text-xs">
                      <tbody>
                        {haberes.map((item) => (
                          <tr key={item.id as string}>
                            <td>{item.concept_nombre as string}</td>
                            <td className="text-right font-mono text-green-700">{formatCurrency(item.importe as number)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-slate-200">
                          <td className="font-semibold">Total bruto</td>
                          <td className="text-right font-bold font-mono text-green-800">{formatCurrency(result?.sueldo_bruto as number)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-red-700 mb-2 uppercase">Descuentos</h4>
                    <table className="table-base text-xs">
                      <tbody>
                        {descuentos.map((item) => (
                          <tr key={item.id as string}>
                            <td>{item.concept_nombre as string}</td>
                            <td className="text-right font-mono text-red-700">{formatCurrency(item.importe as number)}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-slate-200">
                          <td className="font-semibold">Total descuentos</td>
                          <td className="text-right font-bold font-mono text-red-800">{formatCurrency(result?.total_descuentos as number)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Neto y firmas */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3 flex items-center justify-between">
                  <span className="text-blue-800 font-bold">NETO A COBRAR</span>
                  <span className="text-xl font-bold text-blue-800">{formatCurrency(result?.sueldo_neto as number)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-center">
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-xs text-slate-400">Firma del empleador</p>
                  </div>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-xs text-slate-400">Firma del trabajador</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 italic">⚠️ Recibo simulado con fines educativos — No reemplaza documentación oficial</p>
                  <RecibosPDFButton
                    slipId={slip.id as string}
                    empNombre={`${emp?.apellido}, ${emp?.nombre}`}
                    periodo={slip.periodo as string}
                    company={company}
                    result={result}
                    items={items}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
