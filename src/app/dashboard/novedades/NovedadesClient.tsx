'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPeriodo } from '@/lib/utils'

interface Employee { id: string; apellido: string; nombre: string; status: string; modalidad: string }
interface Novelty {
  id: string; employee_id: string; periodo: string
  dias_trabajados: number; inasistencias_justificadas: number; inasistencias_injustificadas: number
  llegadas_tarde: number; horas_extra_50: number; horas_extra_100: number
  feriados_trabajados: number; comisiones: number; premios: number; adelantos: number
  licencias_pagas_dias: number; licencias_sin_goce_dias: number; suspensiones_dias: number
  vacaciones_dias: number; sac_periodo: boolean; ajuste_manual: number
  observaciones: string | null; status: string
}

interface Props {
  company: { id: string; razon_social: string } | null
  employees: Employee[]
  novelties: Novelty[]
  periodo: string
}

const EMPTY_NOVELTY = {
  dias_trabajados: 30, inasistencias_justificadas: 0, inasistencias_injustificadas: 0,
  llegadas_tarde: 0, horas_extra_50: 0, horas_extra_100: 0, feriados_trabajados: 0,
  comisiones: 0, premios: 0, adelantos: 0, licencias_pagas_dias: 0,
  licencias_sin_goce_dias: 0, suspensiones_dias: 0, vacaciones_dias: 0,
  sac_periodo: false, ajuste_manual: 0, observaciones: ''
}

export default function NovedadesClient({ company, employees, novelties, periodo }: Props) {
  const supabase = createClient()
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_NOVELTY)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const noveltyMap = Object.fromEntries(novelties.map(n => [n.employee_id, n]))

  function selectEmployee(empId: string) {
    setSelectedEmployee(empId)
    const existing = noveltyMap[empId]
    if (existing) {
      setForm({
        dias_trabajados: existing.dias_trabajados,
        inasistencias_justificadas: existing.inasistencias_justificadas,
        inasistencias_injustificadas: existing.inasistencias_injustificadas,
        llegadas_tarde: existing.llegadas_tarde,
        horas_extra_50: existing.horas_extra_50,
        horas_extra_100: existing.horas_extra_100,
        feriados_trabajados: existing.feriados_trabajados,
        comisiones: existing.comisiones,
        premios: existing.premios,
        adelantos: existing.adelantos,
        licencias_pagas_dias: existing.licencias_pagas_dias,
        licencias_sin_goce_dias: existing.licencias_sin_goce_dias,
        suspensiones_dias: existing.suspensiones_dias,
        vacaciones_dias: existing.vacaciones_dias,
        sac_periodo: existing.sac_periodo,
        ajuste_manual: existing.ajuste_manual,
        observaciones: existing.observaciones || ''
      })
    } else {
      setForm(EMPTY_NOVELTY)
    }
  }

  async function handleSave(status: 'con_novedades' | 'sin_novedades') {
    if (!selectedEmployee || !company) return
    setSaving(true)

    const existing = noveltyMap[selectedEmployee]
    const data = { ...form, company_id: company.id, employee_id: selectedEmployee, periodo, status,
      confirmed_at: status === 'con_novedades' ? new Date().toISOString() : null }

    if (existing) {
      await supabase.from('monthly_novelties').update(data).eq('id', existing.id)
    } else {
      await supabase.from('monthly_novelties').insert([data])
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Novedades del mes</h1>
        <div className="card text-center py-10">
          <p className="text-slate-500">Primero creá una empresa.</p>
        </div>
      </div>
    )
  }

  const selectedEmp = employees.find(e => e.id === selectedEmployee)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Novedades del mes</h1>
        <p className="text-sm text-slate-500 mt-0.5">{company.razon_social} · {formatPeriodo(periodo)}</p>
      </div>

      <div className="edu-banner mb-6">
        <strong>Novedades del período:</strong> Registrá las horas extra, inasistencias, comisiones y otros conceptos del mes.
        Después se cargan las novedades del período y se procede a liquidar.
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Lista de empleados */}
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-700">Empleados</h2>
            <p className="text-xs text-slate-400">{employees.length} activos</p>
          </div>
          <div className="divide-y divide-slate-100">
            {employees.length === 0 && (
              <p className="p-4 text-sm text-slate-400 text-center">Sin empleados activos</p>
            )}
            {employees.map(emp => {
              const nov = noveltyMap[emp.id]
              return (
                <button key={emp.id} onClick={() => selectEmployee(emp.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${selectedEmployee === emp.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}>
                  <div className="text-sm font-medium text-slate-800">{emp.apellido}, {emp.nombre}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-400">{emp.modalidad}</span>
                    {nov ? (
                      <span className={`badge text-xs ml-auto ${nov.status === 'con_novedades' ? 'badge-green' : 'badge-yellow'}`}>
                        {nov.status === 'con_novedades' ? '✓' : '—'}
                      </span>
                    ) : (
                      <span className="badge badge-gray text-xs ml-auto">pendiente</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Formulario de novedades */}
        <div className="md:col-span-2">
          {!selectedEmployee ? (
            <div className="card text-center py-12">
              <div className="text-3xl mb-2">👈</div>
              <p className="text-slate-500 text-sm">Seleccioná un empleado para cargar sus novedades</p>
            </div>
          ) : (
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-700 mb-4">
                Novedades — {selectedEmp?.apellido}, {selectedEmp?.nombre}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'dias_trabajados', label: 'Días trabajados', type: 'number' },
                  { key: 'inasistencias_justificadas', label: 'Inasistencias justificadas', type: 'number' },
                  { key: 'inasistencias_injustificadas', label: 'Inasistencias injustificadas', type: 'number' },
                  { key: 'llegadas_tarde', label: 'Llegadas tarde', type: 'number' },
                  { key: 'horas_extra_50', label: 'Horas extra 50%', type: 'number' },
                  { key: 'horas_extra_100', label: 'Horas extra 100%', type: 'number' },
                  { key: 'feriados_trabajados', label: 'Feriados trabajados', type: 'number' },
                  { key: 'comisiones', label: 'Comisiones ($)', type: 'number' },
                  { key: 'premios', label: 'Premios ($)', type: 'number' },
                  { key: 'adelantos', label: 'Adelantos ($)', type: 'number' },
                  { key: 'licencias_pagas_dias', label: 'Licencias pagas (días)', type: 'number' },
                  { key: 'licencias_sin_goce_dias', label: 'Licencias sin goce (días)', type: 'number' },
                  { key: 'suspensiones_dias', label: 'Suspensiones (días)', type: 'number' },
                  { key: 'vacaciones_dias', label: 'Vacaciones (días)', type: 'number' },
                  { key: 'ajuste_manual', label: 'Ajuste manual ($)', type: 'number' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={(form as Record<string, unknown>)[field.key] as number}
                      onChange={e => setForm(f => ({ ...f, [field.key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="sac"
                    checked={form.sac_periodo}
                    onChange={e => setForm(f => ({ ...f, sac_periodo: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded" />
                  <label htmlFor="sac" className="text-sm text-slate-700">¿Período de SAC (aguinaldo)?</label>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
                  <textarea
                    value={form.observaciones}
                    onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                    rows={2}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observaciones opcionales..."
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={() => handleSave('con_novedades')} disabled={saving}
                  className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {saving ? 'Guardando...' : saved ? '✓ Guardado' : '✓ Confirmar novedades'}
                </button>
                <button onClick={() => handleSave('sin_novedades')} disabled={saving}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50">
                  Sin novedades
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
