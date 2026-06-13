'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Param {
  id: string
  codigo: string
  nombre: string
  valor: number
  descripcion: string | null
  categoria: string
  editable: boolean
  fuente: string | null
  requires_manual_review: boolean
}

interface Props {
  company: { id: string; razon_social: string } | null
  params: Param[]
}

const CAT_LABELS: Record<string, string> = {
  aportes_trabajador: '👤 Aportes del trabajador',
  contribuciones_patronales: '🏭 Contribuciones patronales',
  parametros_jornada: '🕐 Parámetros de jornada',
}

export default function ParametrosClient({ company, params }: Props) {
  const supabase = createClient()
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(params.map(p => [p.id, p.valor]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function handleSave(param: Param) {
    setSaving(param.id)
    await supabase
      .from('legal_parameters')
      .update({ valor: values[param.id], updated_at: new Date().toISOString() })
      .eq('id', param.id)
    setSaving(null)
    setSaved(param.id)
    setTimeout(() => setSaved(null), 2000)
  }

  if (!company) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Parámetros maestros</h1>
        <div className="card text-center py-10">
          <p className="text-slate-500">Primero creá una empresa para configurar parámetros.</p>
        </div>
      </div>
    )
  }

  const categories = [...new Set(params.map(p => p.categoria))]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Parámetros maestros</h1>
        <p className="text-sm text-slate-500 mt-0.5">{company.razon_social} · Todos los valores son editables</p>
      </div>

      <div className="edu-banner mb-6">
        <strong>Parámetros de liquidación:</strong> Estos son los porcentajes base según la legislación vigente en Argentina.
        Luego se configuran convenios, categorías y parámetros. Todos los valores marcados con ⚠️ requieren revisión manual.
      </div>

      {categories.map(cat => (
        <div key={cat} className="card mb-4">
          <h2 className="text-sm font-bold text-slate-700 mb-4">{CAT_LABELS[cat] || cat}</h2>
          <div className="flex flex-col gap-3">
            {params.filter(p => p.categoria === cat).map(param => (
              <div key={param.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{param.nombre}</span>
                    {param.requires_manual_review && (
                      <span className="badge badge-yellow text-xs">⚠️ Revisar</span>
                    )}
                    {!param.editable && (
                      <span className="badge badge-gray text-xs">Fijo</span>
                    )}
                  </div>
                  {param.descripcion && (
                    <p className="text-xs text-slate-400 mt-0.5">{param.descripcion}</p>
                  )}
                  {param.fuente && (
                    <p className="text-xs text-slate-400">Fuente: {param.fuente}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    disabled={!param.editable}
                    value={values[param.id] ?? param.valor}
                    onChange={e => setValues(v => ({ ...v, [param.id]: parseFloat(e.target.value) || 0 }))}
                    className="w-24 text-right border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <span className="text-xs text-slate-400 w-4">
                    {cat === 'parametros_jornada' ? '' : '%'}
                  </span>
                  {param.editable && (
                    <button
                      onClick={() => handleSave(param)}
                      disabled={saving === param.id}
                      className="text-xs bg-blue-600 text-white px-2 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-[60px] text-center"
                    >
                      {saving === param.id ? '...' : saved === param.id ? '✓' : 'Guardar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">📚 Concepto clave</h3>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-blue-900">
          <div>
            <strong>Aportes del trabajador:</strong> Se descuentan del sueldo bruto.
            El trabajador los paga de su bolsillo (jubilación 11% + obra social 3% + PAMI 3% = 17% base).
          </div>
          <div>
            <strong>Contribuciones patronales:</strong> Son costo del empleador, NO se descuentan al trabajador.
            El empleador paga adicionalmente (jubilación 16% + OS 6% + PAMI 2% + FNE 1,5% + ART = 25,5%+ base).
          </div>
        </div>
      </div>
    </div>
  )
}
