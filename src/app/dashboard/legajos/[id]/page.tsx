'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { calcularAntiguedadAnios, formatDate } from '@/lib/utils'

interface Agreement { id: string; nombre: string; numero_cct: string }
interface Category { id: string; nombre: string; sueldo_basico: number | null; agreement_id: string }

export default function EmpleadoDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    cuil: '', dni: '', apellido: '', nombre: '', fecha_nacimiento: '',
    domicilio: '', telefono: '', email: '', estado_civil: '', cargas_de_familia: 0,
    fecha_ingreso: '', puesto: '', categoria: '', agreement_id: '', agreement_category_id: '',
    jornada: 'completa', modalidad: 'mensualizado', sueldo_basico: 0,
    banco_pago: '', obra_social: '', sindicato: '', status: 'activo'
  })

  useEffect(() => {
    async function load() {
      const [{ data: emp }, { data: agrs }, { data: cats }] = await Promise.all([
        supabase.from('employees').select('*').eq('id', params.id).single(),
        supabase.from('agreements').select('id, nombre, numero_cct').order('nombre'),
        supabase.from('agreement_categories').select('id, nombre, sueldo_basico, agreement_id'),
      ])

      if (emp) {
        setForm({
          cuil: emp.cuil || '',
          dni: emp.dni || '',
          apellido: emp.apellido || '',
          nombre: emp.nombre || '',
          fecha_nacimiento: emp.fecha_nacimiento || '',
          domicilio: emp.domicilio || '',
          telefono: emp.telefono || '',
          email: emp.email || '',
          estado_civil: emp.estado_civil || '',
          cargas_de_familia: emp.cargas_de_familia || 0,
          fecha_ingreso: emp.fecha_ingreso || '',
          puesto: emp.puesto || '',
          categoria: emp.categoria || '',
          agreement_id: emp.agreement_id || '',
          agreement_category_id: emp.agreement_category_id || '',
          jornada: emp.jornada || 'completa',
          modalidad: emp.modalidad || 'mensualizado',
          sueldo_basico: emp.sueldo_basico || 0,
          banco_pago: emp.banco_pago || '',
          obra_social: emp.obra_social || '',
          sindicato: emp.sindicato || '',
          status: emp.status || 'activo',
        })
        if (emp.agreement_id) {
          setFilteredCategories((cats || []).filter(c => c.agreement_id === emp.agreement_id))
        }
      }
      setAgreements(agrs || [])
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [params.id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'cargas_de_familia' || name === 'sueldo_basico' ? Number(value) : value }))

    if (name === 'agreement_id') {
      setFilteredCategories(categories.filter(c => c.agreement_id === value))
      setForm(prev => ({ ...prev, agreement_category_id: '' }))
    }
    if (name === 'agreement_category_id') {
      const cat = categories.find(c => c.id === value)
      if (cat?.sueldo_basico) {
        setForm(prev => ({ ...prev, sueldo_basico: cat.sueldo_basico! }))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('employees')
      .update({ ...form, agreement_id: form.agreement_id || null, agreement_category_id: form.agreement_category_id || null })
      .eq('id', params.id)
    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/dashboard/legajos')
      router.refresh()
    }
    setSaving(false)
  }

  async function handleBaja() {
    if (!confirm('¿Confirmar baja del empleado? Esta acción cambia su estado a "baja".')) return
    await supabase.from('employees').update({ status: 'baja' }).eq('id', params.id)
    router.push('/dashboard/legajos')
    router.refresh()
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Cargando...</div>

  const antiguedad = form.fecha_ingreso ? calcularAntiguedadAnios(form.fecha_ingreso) : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/legajos" className="text-slate-400 hover:text-slate-600 text-sm">← Legajos</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium text-sm">{form.apellido}, {form.nombre}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{form.apellido}, {form.nombre}</h1>
          {antiguedad !== null && (
            <p className="text-sm text-slate-500 mt-0.5">
              Antigüedad: {antiguedad} {antiguedad === 1 ? 'año' : 'años'}
              {form.fecha_ingreso && ` · Ingreso: ${formatDate(form.fecha_ingreso)}`}
            </p>
          )}
        </div>
        <span className={`badge text-xs ${form.status === 'activo' ? 'badge-green' : form.status === 'suspendido' ? 'badge-orange' : 'badge-red'}`}>
          {form.status}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">❌ {error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="card">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Datos personales</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'cuil', label: 'CUIL *', placeholder: '20-12345678-1', required: true },
              { name: 'dni', label: 'DNI *', placeholder: '12345678', required: true },
              { name: 'apellido', label: 'Apellido *', required: true },
              { name: 'nombre', label: 'Nombre *', required: true },
              { name: 'fecha_nacimiento', label: 'Fecha nacimiento', type: 'date' },
              { name: 'telefono', label: 'Teléfono' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'domicilio', label: 'Domicilio' },
            ].map(f => (
              <div key={f.name} className={f.name === 'domicilio' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  name={f.name}
                  required={f.required}
                  value={(form as Record<string, unknown>)[f.name] as string}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cargas de familia</label>
              <input type="number" name="cargas_de_familia" min="0" value={form.cargas_de_familia}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Datos laborales</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha ingreso *</label>
              <input type="date" name="fecha_ingreso" required value={form.fecha_ingreso} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Puesto</label>
              <input name="puesto" value={form.puesto} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Convenio colectivo</label>
              <select name="agreement_id" value={form.agreement_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sin convenio</option>
                {agreements.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.numero_cct})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría CCT</label>
              <select name="agreement_category_id" value={form.agreement_category_id} onChange={handleChange}
                disabled={!form.agreement_id}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100">
                <option value="">Sin categoría</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{c.sueldo_basico ? ` — $${c.sueldo_basico.toLocaleString('es-AR')}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jornada</label>
              <select name="jornada" value={form.jornada} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="completa">Completa</option>
                <option value="parcial">Parcial</option>
                <option value="por_horas">Por horas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modalidad</label>
              <select name="modalidad" value={form.modalidad} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="mensualizado">Mensualizado</option>
                <option value="jornalizado">Jornalizado</option>
                <option value="quincenal">Quincenal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sueldo básico ($)</label>
              <input type="number" name="sueldo_basico" min="0" step="0.01" value={form.sueldo_basico}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Estado</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="licencia">Licencia</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Obra social</label>
              <input name="obra_social" value={form.obra_social} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sindicato</label>
              <input name="sindicato" value={form.sindicato} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
            {saving ? 'Guardando...' : '✓ Guardar cambios'}
          </button>
          <Link href="/dashboard/legajos"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium">
            Cancelar
          </Link>
          <button type="button" onClick={handleBaja}
            className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium">
            Dar de baja
          </button>
        </div>
      </form>
    </div>
  )
}
