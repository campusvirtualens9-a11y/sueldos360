'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularLiquidacion } from '@/lib/calculations/payroll'
import { formatCurrency, formatPeriodo, calcularAntiguedadAnios } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  company: Record<string, unknown> | null
  employees: Record<string, unknown>[]
  novelties: Record<string, unknown>[]
  payrollRuns: Record<string, unknown>[]
  periodo: string
  userId: string
  additionals: Record<string, unknown>[]
  nrItems: Record<string, unknown>[]
}

export default function LiquidacionClient({ company, employees, novelties, payrollRuns, periodo, userId, additionals, nrItems }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [tipo, setTipo] = useState<'mensual' | 'quincenal' | 'sac' | 'vacaciones'>('mensual')
  const [calculating, setCalculating] = useState(false)
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null)
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  const noveltyMap = Object.fromEntries((novelties as Record<string, unknown>[]).map(n => [n.employee_id as string, n]))
  const params = (company as Record<string, unknown> | null)?.legal_parameters as Record<string, unknown>[] | undefined || []

  function getParam(codigo: string, defaultVal: number): number {
    const p = params.find((p: Record<string, unknown>) => p.codigo === codigo)
    return p ? (p.valor as number) : defaultVal
  }

  // Buscar adicionales de un convenio por nombre (alimentacion, complemento, fondo de cese)
  function getAdditional(agreementId: string, keyword: string): number {
    const match = additionals.find(
      a => a.agreement_id === agreementId && String(a.nombre).toLowerCase().includes(keyword.toLowerCase())
    )
    return match ? (match.valor as number) || 0 : 0
  }

  // Sumar sumas no remunerativas vigentes para un empleado (por convenio y/o categoría)
  // Filtra por vigencia si tiene fechas, de lo contrario suma todos
  function getNrTotal(agreementId: string | null, categoryId: string | null): number {
    if (!agreementId) return 0
    const today = new Date().toISOString().slice(0, 10)
    return nrItems
      .filter(item => {
        if (item.agreement_id !== agreementId) return false
        // Si tiene category_id, debe coincidir; si es null, aplica a todos del convenio
        if (item.category_id !== null && item.category_id !== categoryId) return false
        // Filtro de vigencia
        if (item.vigencia_desde && String(item.vigencia_desde) > today) return false
        if (item.vigencia_hasta && String(item.vigencia_hasta) < today) return false
        return true
      })
      .reduce((acc, item) => acc + ((item.monto as number) || 0), 0)
  }

  function buildPayrollParams(agreement: Record<string, unknown> | null) {
    // Tipo de liquidación del CCT determina el divisor y las horas
    const tipoLiq = (agreement?.tipo_liquidacion as string) || 'mensual'
    const modalidad: 'mensualizado' | 'jornalizado' | 'quincenal' =
      tipoLiq === 'jornal' ? 'jornalizado' : tipoLiq === 'quincenal' ? 'quincenal' : 'mensualizado'

    // Horas del CCT: Construcción=176, Camioneros=192 (FedCam: mensual/24/8), resto=200
    const horas = (agreement?.jornada_estandar_horas as number) || getParam('HORAS_MENSUALES', 200)

    // Aporte sindical desde el CCT, fallback parámetros empresa
    const sindical = (agreement?.aporte_sindical_porcentaje as number) ?? getParam('SINDICAL_PCT', 2)

    return {
      modalidad,
      params: {
        jubilacion_pct: getParam('JUBILACION_PCT', 11),
        obra_social_pct: getParam('OBRA_SOCIAL_PCT', 3),
        pami_pct: getParam('PAMI_PCT', 3),
        sindical_pct: sindical,
        jubilacion_patronal_pct: getParam('JUB_PATRONAL_PCT', 16),
        obra_social_patronal_pct: getParam('OS_PATRONAL_PCT', 6),
        pami_patronal_pct: getParam('PAMI_PATRONAL_PCT', 2),
        fne_pct: getParam('FNE_PCT', 1.5),
        art_pct: getParam('ART_PCT', 1.5),
        dias_base: getParam('DIAS_BASE', 30),
        horas_mensuales: horas,
        hora_extra_50_factor: getParam('HORA_EXTRA_50', 1.5),
        hora_extra_100_factor: getParam('HORA_EXTRA_100', 2),
        valor_hora_extra_base: 'basico',
      }
    }
  }

  async function handleCalculate() {
    if (!company) return
    setCalculating(true)
    setError(null)
    setWarnings([])

    const warn: string[] = []
    const results = []

    for (const emp of employees) {
      const nov = noveltyMap[emp.id as string]
      const category = emp.agreement_categories as Record<string, unknown> | null
      const agreement = emp.agreements as Record<string, unknown> | null

      const sueldo = (category?.sueldo_basico as number) || (emp.sueldo_basico as number) || 0
      const antiguedadAnios = calcularAntiguedadAnios(emp.fecha_ingreso as string)

      // Validaciones por empleado
      if (!emp.agreement_id) {
        warn.push(`${emp.apellido}, ${emp.nombre}: sin convenio asignado`)
      }
      if (!emp.agreement_category_id && !sueldo) {
        warn.push(`${emp.apellido}, ${emp.nombre}: sin categoría ni básico`)
      }
      if (sueldo === 0) {
        warn.push(`${emp.apellido}, ${emp.nombre}: básico $0 — verificar categoría del CCT`)
      }

      const agreementId = emp.agreement_id as string | null
      const { modalidad, params: payrollParams } = buildPayrollParams(agreement)

      // Adicionales CCT específicos (Gastronomía)
      const alimentacion_pct = agreementId ? getAdditional(agreementId, 'alimentaci') : 0
      const complemento_servicio_pct = agreementId ? getAdditional(agreementId, 'complemento') : 0

      // Fondo de Cese Laboral — Construcción: 12% primer año, 8% desde segundo
      let fondo_cese_pct = 0
      if (agreement && (agreement.codigo as string)?.startsWith('CON-')) {
        fondo_cese_pct = antiguedadAnios < 1 ? 12 : 8
      }

      // Sumas no remunerativas desde la DB (viáticos, SNR convenio, etc.)
      const nr_total = getNrTotal(agreementId, emp.agreement_category_id as string | null)

      const result = calcularLiquidacion({
        sueldo_basico: sueldo,
        antiguedad_anios: antiguedadAnios,
        antiguedad_pct: (agreement?.antiguedad_porcentaje as number) || 1,
        presentismo_pct: (agreement?.presentismo_porcentaje as number) || 0,
        modalidad: (emp.modalidad as 'mensualizado' | 'jornalizado' | 'quincenal') || modalidad,
        jornada: emp.jornada as 'completa' | 'parcial' | 'por_horas',
        novedades: nov ? {
          dias_trabajados: nov.dias_trabajados as number,
          inasistencias_justificadas: nov.inasistencias_justificadas as number,
          inasistencias_injustificadas: nov.inasistencias_injustificadas as number,
          llegadas_tarde: nov.llegadas_tarde as number,
          horas_extra_50: nov.horas_extra_50 as number,
          horas_extra_100: nov.horas_extra_100 as number,
          feriados_trabajados: nov.feriados_trabajados as number,
          comisiones: nov.comisiones as number,
          premios: nov.premios as number,
          adelantos: nov.adelantos as number,
          licencias_pagas_dias: nov.licencias_pagas_dias as number,
          licencias_sin_goce_dias: nov.licencias_sin_goce_dias as number,
          suspensiones_dias: nov.suspensiones_dias as number,
          vacaciones_dias: nov.vacaciones_dias as number,
          sac_periodo: nov.sac_periodo as boolean,
          ajuste_manual: nov.ajuste_manual as number,
        } : {
          dias_trabajados: modalidad === 'jornalizado' ? 25 : 30,
          inasistencias_justificadas: 0, inasistencias_injustificadas: 0,
          llegadas_tarde: 0, horas_extra_50: 0, horas_extra_100: 0, feriados_trabajados: 0,
          comisiones: 0, premios: 0, adelantos: 0, licencias_pagas_dias: 0,
          licencias_sin_goce_dias: 0, suspensiones_dias: 0, vacaciones_dias: 0,
          sac_periodo: false, ajuste_manual: 0,
        },
        params: payrollParams,
        additional_non_remunerative: nr_total,
        alimentacion_pct,
        complemento_servicio_pct,
        fondo_cese_pct,
      })

      results.push({ emp, result })
    }

    if (warn.length > 0) setWarnings(warn)
    setPreview(results as Record<string, unknown>[])
    setCalculating(false)
  }

  async function handleClose() {
    if (!preview || !company) return
    setClosing(true)

    const totals = (preview as { result: ReturnType<typeof calcularLiquidacion> }[]).reduce((acc, { result }) => ({
      total_bruto: acc.total_bruto + result.sueldo_bruto,
      total_descuentos: acc.total_descuentos + result.total_descuentos_trabaj,
      total_neto: acc.total_neto + result.sueldo_neto,
      total_aportes_trabajador: acc.total_aportes_trabajador + result.total_aportes_trabajador,
      total_contribuciones_patronales: acc.total_contribuciones_patronales + result.total_contribuciones_patronales,
      total_costo_laboral: acc.total_costo_laboral + result.costo_laboral_total,
    }), {
      total_bruto: 0, total_descuentos: 0, total_neto: 0,
      total_aportes_trabajador: 0, total_contribuciones_patronales: 0, total_costo_laboral: 0,
    })

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .insert([{
        company_id: (company as Record<string, unknown>).id as string,
        periodo,
        tipo,
        status: 'cerrada',
        ...totals,
        fecha_pago: new Date().toISOString().split('T')[0],
        created_by: userId,
        closed_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (runError || !run) {
      setError('Error al cerrar la liquidación: ' + runError?.message)
      setClosing(false)
      return
    }

    // Guardar resultados por empleado
    for (const { emp, result } of preview as { emp: Record<string, unknown>; result: ReturnType<typeof calcularLiquidacion> }[]) {
      const { data: empResult } = await supabase
        .from('payroll_results')
        .insert([{
          payroll_run_id: run.id,
          employee_id: emp.id as string,
          dias_trabajados: result.items.find(i => i.codigo === '001')?.cantidad || 30,
          sueldo_basico: result.sueldo_basico_proporcional,
          total_remunerativo: result.total_remunerativo,
          total_no_remunerativo: result.total_no_remunerativo,
          total_descuentos: result.total_descuentos_trabaj,
          sueldo_bruto: result.sueldo_bruto,
          sueldo_neto: result.sueldo_neto,
          total_aportes: result.total_aportes_trabajador,
          total_contribuciones: result.total_contribuciones_patronales,
          costo_laboral: result.costo_laboral_total,
        }])
        .select()
        .single()

      if (empResult) {
        // Guardar ítems
        await supabase.from('payroll_result_items').insert(
          result.items.map((item, i) => ({
            payroll_result_id: empResult.id,
            concept_codigo: item.codigo,
            concept_nombre: item.nombre,
            concept_tipo: item.tipo,
            cantidad: item.cantidad || null,
            valor_unitario: item.valor_unitario || null,
            importe: item.importe,
            is_remunerativo: item.tipo === 'remunerativo',
            orden: i,
          }))
        )

        // Crear recibo
        await supabase.from('payslips').insert([{
          payroll_result_id: empResult.id,
          company_id: (company as Record<string, unknown>).id as string,
          employee_id: emp.id as string,
          periodo,
          fecha_pago: new Date().toISOString().split('T')[0],
        }])
      }
    }

    setClosing(false)
    router.push('/dashboard/recibos')
    router.refresh()
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Liquidación de sueldos</h1>
        <div className="card text-center py-10">
          <p className="text-slate-500">Primero creá una empresa.</p>
        </div>
      </div>
    )
  }

  // Empleados sin básico o sin convenio — alerta previa
  const empSinBasico = employees.filter(emp => {
    const cat = emp.agreement_categories as Record<string, unknown> | null
    const s = (cat?.sueldo_basico as number) || (emp.sueldo_basico as number) || 0
    return s === 0
  })
  const empSinConvenio = employees.filter(emp => !emp.agreement_id)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Liquidación de sueldos</h1>
        <p className="text-sm text-slate-500 mt-0.5">{(company as Record<string, unknown>).razon_social as string} · {formatPeriodo(periodo)}</p>
      </div>

      <div className="edu-banner mb-6">
        <strong>Circuito de liquidación:</strong> La liquidación calcula haberes, descuentos, aportes y contribuciones.
        Los aportes son <strong>retenidos al trabajador</strong>. Las contribuciones son <strong>costo del empleador</strong>.
        El recibo muestra el neto que cobra el trabajador.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">❌ {error}</div>
      )}

      {/* Alertas de datos incompletos */}
      {(empSinConvenio.length > 0 || empSinBasico.length > 0) && !preview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm mb-4">
          <p className="font-semibold text-amber-800 mb-1">⚠ Empleados con datos incompletos:</p>
          {empSinConvenio.map(emp => (
            <p key={emp.id as string} className="text-amber-700 text-xs">
              • {emp.apellido as string}, {emp.nombre as string} — sin convenio CCT asignado.{' '}
              <Link href="/dashboard/empleados" className="underline">Completar legajo</Link>
            </p>
          ))}
          {empSinBasico.filter(emp => emp.agreement_id).map(emp => (
            <p key={emp.id as string} className="text-amber-700 text-xs">
              • {emp.apellido as string}, {emp.nombre as string} — categoría sin básico cargado (se liquidará en $0).
            </p>
          ))}
        </div>
      )}

      {/* Warnings del cálculo */}
      {warnings.length > 0 && preview && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm mb-4">
          <p className="font-semibold text-amber-800 mb-1">⚠ Avisos del cálculo:</p>
          {warnings.map((w, i) => <p key={i} className="text-amber-700 text-xs">• {w}</p>)}
        </div>
      )}

      {/* Configuración */}
      {!preview && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Configurar liquidación</h2>
          <div className="flex gap-4 mb-4">
            {(['mensual', 'quincenal', 'sac', 'vacaciones'] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {t === 'sac' ? 'SAC (Aguinaldo)' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {employees.length} empleados activos · {periodo}
            {employees.length === 0 && <span className="text-red-500 ml-1">⚠ Sin empleados activos</span>}
          </p>
          <button
            onClick={handleCalculate}
            disabled={calculating || employees.length === 0}
            className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {calculating ? '⚙️ Calculando...' : '⚙️ Calcular liquidación'}
          </button>
        </div>
      )}

      {/* Vista previa */}
      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Previsualización — {tipo} {formatPeriodo(periodo)}</h2>
            <div className="flex gap-2">
              <button onClick={() => { setPreview(null); setWarnings([]) }}
                className="text-sm border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                ← Modificar
              </button>
              <button onClick={handleClose} disabled={closing}
                className="bg-green-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {closing ? 'Cerrando...' : '✓ Cerrar liquidación'}
              </button>
            </div>
          </div>

          {(preview as { emp: Record<string, unknown>; result: ReturnType<typeof calcularLiquidacion> }[]).map(({ emp, result }) => (
            <div key={emp.id as string} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800">
                  {emp.apellido as string}, {emp.nombre as string}
                </h3>
                <div className="text-right text-xs text-slate-400">
                  {(emp.agreements as Record<string, unknown> | null)?.nombre as string || 'Sin convenio'}
                  {' · '}
                  {(emp.agreement_categories as Record<string, unknown> | null)?.nombre as string || emp.categoria as string || 'Sin categoría'}
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-green-600">Bruto</div>
                  <div className="text-sm font-bold text-green-800">{formatCurrency(result.sueldo_bruto)}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-red-600">Descuentos</div>
                  <div className="text-sm font-bold text-red-800">{formatCurrency(result.total_descuentos_trabaj)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-blue-600">Neto</div>
                  <div className="text-sm font-bold text-blue-800">{formatCurrency(result.sueldo_neto)}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-orange-600">Contrib. patronal</div>
                  <div className="text-sm font-bold text-orange-800">{formatCurrency(result.total_contribuciones_patronales)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 text-center">
                  <div className="text-xs text-purple-600">Costo laboral</div>
                  <div className="text-sm font-bold text-purple-800">{formatCurrency(result.costo_laboral_total)}</div>
                </div>
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-500 hover:text-slate-700 mb-2">Ver detalle de conceptos</summary>
                <table className="table-base text-xs mt-2">
                  <thead><tr><th>Cód.</th><th>Concepto</th><th>Tipo</th><th>Cantidad</th><th>Importe</th></tr></thead>
                  <tbody>
                    {result.items.map(item => (
                      <tr key={item.codigo}>
                        <td className="font-mono">{item.codigo}</td>
                        <td>{item.nombre}</td>
                        <td>
                          <span className={`badge text-xs ${
                            item.tipo === 'remunerativo' ? 'badge-green' :
                            item.tipo === 'no_remunerativo' ? 'badge-blue' :
                            item.tipo === 'contribucion_patronal' ? 'badge-yellow' : 'badge-red'
                          }`}>{item.tipo}</span>
                        </td>
                        <td className="text-slate-500">{item.cantidad || '—'}</td>
                        <td className={`font-mono font-medium ${item.tipo === 'descuento' ? 'text-red-600' : 'text-green-700'}`}>
                          {item.tipo === 'descuento' || item.tipo === 'contribucion_patronal' ? '-' : ''}{formatCurrency(item.importe)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          ))}

          {/* Totales generales */}
          <div className="card bg-slate-800 text-white">
            <h3 className="text-sm font-bold mb-3">Totales del período</h3>
            <div className="grid grid-cols-3 gap-4">
              {(() => {
                const t = (preview as { result: ReturnType<typeof calcularLiquidacion> }[]).reduce((acc, { result }) => ({
                  bruto: acc.bruto + result.sueldo_bruto,
                  neto: acc.neto + result.sueldo_neto,
                  aportes: acc.aportes + result.total_aportes_trabajador,
                  contribuciones: acc.contribuciones + result.total_contribuciones_patronales,
                  costo: acc.costo + result.costo_laboral_total,
                }), { bruto: 0, neto: 0, aportes: 0, contribuciones: 0, costo: 0 })
                return [
                  { label: 'Total bruto', value: t.bruto },
                  { label: 'Total neto', value: t.neto },
                  { label: 'Aportes trabajadores', value: t.aportes },
                  { label: 'Contribuciones patronales', value: t.contribuciones },
                  { label: 'Costo laboral total', value: t.costo },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="text-base font-bold">{formatCurrency(item.value)}</div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      {payrollRuns.length > 0 && !preview && (
        <div className="card mt-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Historial de liquidaciones</h2>
          <table className="table-base text-sm">
            <thead><tr><th>Período</th><th>Tipo</th><th>Bruto</th><th>Neto</th><th>Costo laboral</th><th>Estado</th></tr></thead>
            <tbody>
              {(payrollRuns as Record<string, unknown>[]).map(run => (
                <tr key={run.id as string}>
                  <td>{formatPeriodo(run.periodo as string)}</td>
                  <td className="capitalize">{run.tipo as string}</td>
                  <td className="font-mono">{formatCurrency(run.total_bruto as number)}</td>
                  <td className="font-mono">{formatCurrency(run.total_neto as number)}</td>
                  <td className="font-mono">{formatCurrency(run.total_costo_laboral as number)}</td>
                  <td><span className={`badge text-xs ${run.status === 'cerrada' ? 'badge-green' : 'badge-yellow'}`}>{run.status as string}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
