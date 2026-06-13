'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function EditarEmpresaPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    razon_social: '', cuit: '', domicilio: '', localidad: '',
    provincia: '', cp: '', actividad_principal: '', fecha_inicio_actividades: '',
    responsable_inscripto: false,
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', params.id)
        .single()
      if (data) {
        setForm({
          razon_social: data.razon_social || '',
          cuit: data.cuit || '',
          domicilio: data.domicilio || '',
          localidad: data.localidad || '',
          provincia: data.provincia || '',
          cp: data.cp || '',
          actividad_principal: data.actividad_principal || '',
          fecha_inicio_actividades: data.fecha_inicio_actividades || '',
          responsable_inscripto: data.responsable_inscripto || false,
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('companies')
      .update(form)
      .eq('id', params.id)
    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/dashboard/empresas')
      router.refresh()
    }
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/empresas" className="text-slate-400 hover:text-slate-600 text-sm">← Empresas</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium text-sm">Editar empresa</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Editar empresa</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">❌ {error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="card">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Datos de la empresa</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Razón social *</label>
              <input name="razon_social" required value={form.razon_social} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CUIT *</label>
              <input name="cuit" required value={form.cuit} onChange={handleChange} placeholder="30-12345678-9"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio actividades</label>
              <input type="date" name="fecha_inicio_actividades" value={form.fecha_inicio_actividades} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Domicilio</label>
              <input name="domicilio" value={form.domicilio} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Localidad</label>
              <input name="localidad" value={form.localidad} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CP</label>
              <input name="cp" value={form.cp} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Provincia</label>
              <select name="provincia" value={form.provincia} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                {['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos',
                  'Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro',
                  'Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero',
                  'Tierra del Fuego','Tucumán'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Actividad principal</label>
              <input name="actividad_principal" value={form.actividad_principal} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" name="responsable_inscripto" id="ri" checked={form.responsable_inscripto} onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300" />
              <label htmlFor="ri" className="text-sm text-slate-700">Responsable inscripto en IVA</label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
            {saving ? 'Guardando...' : '✓ Guardar cambios'}
          </button>
          <Link href="/dashboard/empresas"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
