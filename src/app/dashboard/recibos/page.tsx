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
        .select(`
          *,
          employees(apellido, nombre, cuil, dni, categoria, fecha_ingreso, obra_social, sindicato),
          payroll_results(
            sueldo_bruto, sueldo_neto, total_aportes, total_contribuciones,
            costo_laboral, total_remunerativo, total_no_remunerativo,
            total_descuentos, dias_trabajados,
            payroll_result_items(*)
          )
        `)
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
        <strong>Recibos educativos:</strong> Cada recibo incluye el detalle completo de haberes y
        deducciones, y se puede exportar a PDF con formato oficial simulado.
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
        <div className="space-y-6">
          {(payslips as Record<string, unknown>[]).map(slip => {
            const emp    = slip.employees as Record<string, unknown>
            const result = slip.payroll_results as Record<string, unknown>
            const items  = (result?.payroll_result_items as Record<string, unknown>[]) || []

            const haberes   = items.filter(i => String(i.concept_tipo) !== 'descuento' && String(i.concept_tipo) !== 'contribucion_patronal')
            const descuentos = items.filter(i => String(i.concept_tipo) === 'descuento')

            const empNombre = `${emp?.apellido as string || ''}, ${emp?.nombre as string || ''}`

            return (
              <div key={slip.id as string} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white relative">

                {/* Sello de agua */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
                  <span className="text-[96px] font-black text-blue-50 rotate-[-28deg] uppercase tracking-[0.2em] whitespace-nowrap leading-none">
                    SIMULADO
                  </span>
                </div>

                {/* Encabezado azul */}
                <div className="relative z-10 bg-blue-600 px-5 py-2.5 flex items-center justify-between">
                  <span className="text-white font-bold text-sm tracking-wide">RECIBO DE HABERES</span>
                  <div className="flex items-center gap-3">
                    {!!slip.emitido && (
                      <span className="text-xs bg-green-400 text-green-900 font-bold px-2 py-0.5 rounded-full">✓ Emitido</span>
                    )}
                    <span className="text-blue-200 text-xs font-medium">ORIGINAL</span>
                  </div>
                </div>

                {/* Empresa + Empleado */}
                <div className="relative z-10 grid md:grid-cols-2 gap-0 divide-x divide-slate-100 border-b border-slate-200">
                  {/* Empresa */}
                  <div className="px-5 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-black leading-none">S<br/>360</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{company.razon_social}</p>
                        <p className="text-xs text-slate-400">CUIT: {company.cuit}</p>
                      </div>
                    </div>
                    {company.domicilio_fiscal && (
                      <p className="text-xs text-slate-400 mt-1">{company.domicilio_fiscal}{company.localidad ? ` · ${company.localidad}` : ''}</p>
                    )}
                    <p className="text-xs text-slate-400">{company.actividad_principal || '—'}</p>
                  </div>

                  {/* Empleado */}
                  <div className="px-5 py-3 bg-blue-50/40">
                    <p className="font-bold text-slate-800 text-sm">{emp?.apellido as string}, {emp?.nombre as string}</p>
                    <div className="grid grid-cols-2 gap-x-4 mt-1">
                      <p className="text-xs text-slate-500"><span className="text-slate-400">CUIL:</span> {emp?.cuil as string || '—'}</p>
                      <p className="text-xs text-slate-500"><span className="text-slate-400">Cat.:</span> {emp?.categoria as string || '—'}</p>
                      <p className="text-xs text-slate-500"><span className="text-slate-400">Ingreso:</span> {emp?.fecha_ingreso ? formatDate(emp.fecha_ingreso as string) : '—'}</p>
                      <p className="text-xs text-slate-500"><span className="text-slate-400">OS:</span> {emp?.obra_social as string || company.obra_social_principal as string || 'OSECAC'}</p>
                    </div>
                    <p className="text-xs font-semibold text-blue-700 mt-1.5">Período: {formatPeriodo(slip.periodo as string)}</p>
                  </div>
                </div>

                {/* Cuerpo: Haberes | Descuentos */}
                <div className="relative z-10 grid md:grid-cols-2 divide-x divide-slate-100">

                  {/* Haberes */}
                  <div className="px-4 py-3">
                    <h4 className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-2 pb-1 border-b border-green-100">
                      Haberes y adicionales
                    </h4>
                    <table className="w-full">
                      <tbody>
                        {haberes.map(item => (
                          <tr key={item.id as string} className="border-b border-slate-50">
                            <td className="py-1 text-xs text-slate-600">{item.concept_nombre as string}</td>
                            <td className="py-1 text-xs text-right font-mono text-green-700 font-medium">
                              {formatCurrency(item.importe as number)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-green-200">
                          <td className="pt-2 text-xs font-bold text-slate-700">Total devengado</td>
                          <td className="pt-2 text-xs text-right font-bold font-mono text-green-800">
                            {formatCurrency(result?.sueldo_bruto as number)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Deducciones */}
                  <div className="px-4 py-3">
                    <h4 className="text-[10px] font-bold text-red-700 uppercase tracking-wide mb-2 pb-1 border-b border-red-100">
                      Deducciones
                    </h4>
                    <table className="w-full">
                      <tbody>
                        {descuentos.map(item => (
                          <tr key={item.id as string} className="border-b border-slate-50">
                            <td className="py-1 text-xs text-slate-600">{item.concept_nombre as string}</td>
                            <td className="py-1 text-xs text-right font-mono text-red-700 font-medium">
                              - {formatCurrency(item.importe as number)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-red-200">
                          <td className="pt-2 text-xs font-bold text-slate-700">Total deducciones</td>
                          <td className="pt-2 text-xs text-right font-bold font-mono text-red-800">
                            - {formatCurrency(result?.total_descuentos as number)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Neto */}
                <div className="relative z-10 mx-4 my-3 bg-blue-600 rounded-xl px-5 py-3 flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-blue-100 text-[10px] uppercase tracking-widest font-medium">Neto a cobrar</p>
                    <p className="text-white font-black text-2xl leading-tight">
                      {formatCurrency(result?.sueldo_neto as number)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-xs">Días trabajados</p>
                    <p className="text-white font-bold text-lg">{result?.dias_trabajados as number ?? 30}</p>
                  </div>
                </div>

                {/* Firmas + Sello */}
                <div className="relative z-10 grid grid-cols-3 gap-2 px-4 pb-3 text-center">
                  <div className="border-t-2 border-slate-200 pt-2">
                    <div className="h-8" />
                    <p className="text-[10px] text-slate-400 font-medium">Firma del empleador</p>
                    <p className="text-[9px] text-slate-300 truncate">{company.razon_social}</p>
                  </div>

                  <div className="flex flex-col items-center justify-start pt-1">
                    <div className="border-2 border-blue-300 rounded-xl px-3 py-1.5 text-center bg-white">
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Sueldos 360</p>
                      <p className="text-[11px] font-black text-blue-700">SIMULADO</p>
                      <p className="text-[8px] text-slate-400">Uso educativo</p>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-200 pt-2">
                    <div className="h-8" />
                    <p className="text-[10px] text-slate-400 font-medium">Firma del trabajador</p>
                    <p className="text-[9px] text-slate-300 truncate">{emp?.apellido as string}, {emp?.nombre as string}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 bg-amber-50 border-t border-amber-100 px-4 py-2 flex items-center justify-between">
                  <p className="text-[10px] text-amber-700 italic">
                    ⚠️ Recibo simulado — No reemplaza documentación oficial · Sueldos 360
                  </p>
                  <RecibosPDFButton
                    slipId={slip.id as string}
                    empNombre={empNombre}
                    empCuil={emp?.cuil as string || '—'}
                    empCategoria={emp?.categoria as string || '—'}
                    empFechaIngreso={emp?.fecha_ingreso as string | null}
                    empObraSocial={emp?.obra_social as string | null}
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
