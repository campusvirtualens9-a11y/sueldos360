'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatPeriodo } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import F931PDFButton from './F931PDFButton'

interface Props {
  company: Record<string, unknown> | null
  closedRuns: Record<string, unknown>[]
  existingReports: Record<string, unknown>[]
  userId: string
}

export default function F931Client({ company, closedRuns, existingReports, userId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [selectedPeriodo, setSelectedPeriodo] = useState('')

  const periodos = [...new Set(closedRuns.map(r => r.periodo as string))].sort().reverse()

  async function handleGenerate() {
    if (!company || !selectedPeriodo) return
    setGenerating(true)

    const runsForPeriod = closedRuns.filter(r => r.periodo === selectedPeriodo)
    if (runsForPeriod.length === 0) {
      setGenerating(false)
      return
    }

    const totals = runsForPeriod.reduce<{ total_remuneraciones: number; total_aportes: number; total_contribuciones: number }>((acc, r) => ({
      total_remuneraciones: acc.total_remuneraciones + (r.total_bruto as number),
      total_aportes: acc.total_aportes + (r.total_aportes_trabajador as number),
      total_contribuciones: acc.total_contribuciones + (r.total_contribuciones_patronales as number),
    }), { total_remuneraciones: 0, total_aportes: 0, total_contribuciones: 0 })

    const jubPct = 0.11
    const osPct = 0.03
    const pamiPct = 0.03
    const aportes_jub = totals.total_remuneraciones * jubPct
    const aportes_os = totals.total_remuneraciones * osPct
    const aportes_pami = totals.total_remuneraciones * pamiPct
    const art = totals.total_remuneraciones * 0.015
    const total_general = totals.total_aportes + totals.total_contribuciones

    await supabase.from('f931_reports').insert([{
      company_id: (company as Record<string, unknown>).id,
      periodo: selectedPeriodo,
      payroll_run_ids: runsForPeriod.map(r => r.id),
      cuit_empresa: (company as Record<string, unknown>).cuit,
      razon_social: (company as Record<string, unknown>).razon_social,
      cantidad_empleados: runsForPeriod.reduce((acc, r) => acc + (r.cantidad_empleados as number || 0), 0),
      total_remuneraciones: totals.total_remuneraciones,
      total_aportes_jubilatorios: aportes_jub,
      total_obra_social: aportes_os,
      total_pami: aportes_pami,
      total_otros_aportes: 0,
      total_contribuciones_patronales: totals.total_contribuciones,
      art_monto: art,
      total_general,
      status: 'borrador',
    }])

    setGenerating(false)
    router.refresh()
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">F.931 Simulado</h1>
        <div className="card text-center py-10"><p className="text-slate-500">Primero creá una empresa.</p></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Informe F.931 Simulado</h1>
        <p className="text-sm text-slate-500 mt-0.5">{(company as Record<string, unknown>).razon_social as string}</p>
      </div>

      <div className="edu-banner mb-6">
        <strong>F.931 simulado:</strong> Resume las obligaciones de seguridad social del empleador: aportes retenidos al trabajador
        más contribuciones patronales. En esta app se utiliza con fines educativos.
        El F.931 simulado resume las cargas sociales del período.
      </div>

      {/* Generar nuevo */}
      {periodos.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Generar nuevo F.931</h2>
          <div className="flex gap-3">
            <select
              value={selectedPeriodo}
              onChange={e => setSelectedPeriodo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar período...</option>
              {periodos.map(p => <option key={p} value={p}>{formatPeriodo(p)}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedPeriodo || generating}
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {generating ? 'Generando...' : 'Generar F.931'}
            </button>
          </div>
          {closedRuns.length === 0 && (
            <p className="text-xs text-orange-600 mt-2">⚠ Necesitás liquidaciones cerradas para generar el F.931.</p>
          )}
        </div>
      )}

      {/* Reportes existentes */}
      {existingReports.length === 0 && (
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-600">Sin informes F.931 generados todavía.</p>
        </div>
      )}

      {existingReports.map(report => (
        <div key={report.id as string} className="card mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">F.931 — {formatPeriodo(report.periodo as string)}</h3>
              <p className="text-xs text-slate-500">CUIT: {report.cuit_empresa as string} · {report.razon_social as string}</p>
            </div>
            <div className="flex items-center gap-2">
              <F931PDFButton report={report} company={company as Record<string, unknown>} />
              <StatusBadge status={report.status as string} reportId={report.id as string} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total remuneraciones', value: report.total_remuneraciones as number },
              { label: 'Aportes jubilatorios', value: report.total_aportes_jubilatorios as number },
              { label: 'Obra social', value: report.total_obra_social as number },
              { label: 'PAMI/INSSJP', value: report.total_pami as number },
              { label: 'Contribuciones patronales', value: report.total_contribuciones_patronales as number },
              { label: 'ART simulada', value: report.art_monto as number },
              { label: 'Total general a pagar', value: report.total_general as number, highlight: true },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-3 ${item.highlight ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>
                <div className={`text-xs mb-1 ${item.highlight ? 'text-blue-200' : 'text-slate-400'}`}>{item.label}</div>
                <div className={`text-sm font-bold font-mono ${item.highlight ? 'text-white text-base' : 'text-slate-800'}`}>
                  {formatCurrency(item.value)}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 italic">
            ⚠ Informe simulado con fines educativos — No reemplaza la presentación oficial del F.931 en ARCA
          </p>
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status, reportId }: { status: string; reportId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [updating, setUpdating] = useState(false)

  const labels: Record<string, string> = {
    borrador: '📝 Borrador',
    presentado: '✅ Presentado',
    rectificativo: '🔄 Rectificativo',
    pagado: '💳 Pagado',
  }

  const next: Record<string, string> = {
    borrador: 'presentado',
    presentado: 'pagado',
  }

  async function advance() {
    if (!next[status]) return
    setUpdating(true)
    await supabase.from('f931_reports').update({ status: next[status] }).eq('id', reportId)
    setUpdating(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`badge text-xs ${
        status === 'pagado' ? 'badge-green' :
        status === 'presentado' ? 'badge-blue' : 'badge-yellow'
      }`}>
        {labels[status] || status}
      </span>
      {next[status] && (
        <button onClick={advance} disabled={updating}
          className="text-xs text-slate-500 hover:text-blue-600 hover:underline disabled:opacity-50">
          {updating ? '...' : `→ Marcar ${next[status]}`}
        </button>
      )}
    </div>
  )
}
