'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { unlockAchievement } from '@/lib/achievements'
import Link from 'next/link'

interface Agreement { id: string; nombre: string; numero_cct: string }
interface Category { id: string; nombre: string; sueldo_basico: number | null; agreement_id: string }

export default function NuevoEmpleadoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<{ id: string; razon_social: string } | null>(null)
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedAgreement, setSelectedAgreement] = useState('')
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: companies } = await supabase.from('companies').select('id, razon_social').eq('user_id', user.id).limit(1)
      if (companies?.[0]) setCompany(companies[0])

      const { data: agrs } = await supabase.from('agreements').select('id, nombre, numero_cct').order('nombre')
      setAgreements(agrs || [])

      const { data: cats } = await supabase.from('agreement_categories').select('id, nombre, sueldo_basico, agreement_id')
      setCategories(cats || [])
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedAgreement) {
      setFilteredCategories(categories.filter(c => c.agreement_id === selectedAgreement))
    }
  }, [selectedAgreement, categories])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'cargas_de_familia' || name === 'sueldo_basico' ? Number(value) : value }))

    if (name === 'agreement_id') {
      setSelectedAgreement(value)
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
    if (!company) return
    setLoading(true)
    setError(null)

    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .neq('status', 'baja')

    if (count && count >= 10) {
      setError('Límite alcanzado: máximo 10 empleados activos por empresa (simulador educativo).')
      setLoading(false)
      return
    }

    const { data: emp, error: insertError } = await supabase
      .from('employees')
      .insert([{ ...form, company_id: company.id, agreement_id: form.agreement_id || null, agreement_category_id: form.agreement_category_id || null }])
      .select().single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    if (emp) {
      await supabase.from('employee_files').insert([{ employee_id: emp.id }])
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await unlockAchievement(supabase, user.id, company.id, 'PRIMER_EMPLEADO')
    }

    router.push('/dashboard/legajos')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/legajos" className="text-slate-400 hover:text-slate-600 text-sm">← Legajos</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium text-sm">Nuevo empleado</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Nuevo empleado</h1>
      <p className="text-sm text-slate-500 mb-6">{company?.razon_social || 'Sin empresa'}</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">❌ {error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="card">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Datos personales</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'cuil', label: 'CUIL *', placeholder: '20-12345678-1', required: true },
              { name: 'dni', label: 'DNI *', placeholder: '12345678', required: true },
              { name: 'apellido', label: 'Apellido *', placeholder: 'García', required: true },
              { name: 'nombre', label: 'Nombre *', placeholder: 'Juan', required: true },
              { name: 'fecha_nacimiento', label: 'Fecha nacimiento', type: 'date' },
              { name: 'telefono', label: 'Teléfono', placeholder: '(376) 4123456' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'empleado@mail.com' },
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
              <input name="puesto" value={form.puesto} onChange={handleChange} placeholder="Administrativo"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Convenio colectivo</label>
              <select name="agreement_id" value={form.agreement_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar convenio...</option>
                {agreements.map(a => <option key={a.id} value={a.id}>{a.nombre} ({a.numero_cct})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
              <select name="agreement_category_id" value={form.agreement_category_id} onChange={handleChange}
                disabled={!selectedAgreement}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100">
                <option value="">Seleccionar categoría...</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{c.sueldo_basico ? ` — $${c.sueldo_basico.toLocaleString('es-AR')}` : ' — (sin básico)'}
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
              <p className="text-xs text-slate-400 mt-0.5">Se autocompleta al seleccionar categoría</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Obra social</label>
              <input name="obra_social" value={form.obra_social} onChange={handleChange} placeholder="OSDE, Swiss Medical..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sindicato</label>
              <input name="sindicato" value={form.sindicato} onChange={handleChange} placeholder="FAECyS, UOCRA..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
            {loading ? 'Guardando...' : '✓ Crear empleado'}
          </button>
          <Link href="/dashboard/legajos"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
