'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { unlockAchievement } from '@/lib/achievements'
import Link from 'next/link'

const PROVINCIAS = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
  'Ciudad Autónoma de Buenos Aires'
]

export default function NuevaEmpresaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    cuit: '',
    razon_social: '',
    nombre_fantasia: '',
    actividad_principal: '',
    condicion_mipyme: false,
    domicilio_fiscal: '',
    localidad: '',
    provincia: 'Misiones',
    telefono: '',
    email: '',
    art_simulada: 'Provincia ART (simulada)',
    obra_social_principal: '',
    fecha_inicio_actividad: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Verificar límite
    const { count } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= 2) {
      setError('Límite alcanzado: ya tenés 2 empresas creadas (límite del simulador educativo).')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('companies')
      .insert([{ ...form, user_id: user.id }])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Crear parámetros maestros por defecto
    if (data) {
      await supabase.from('legal_parameters').insert([
        { company_id: data.id, codigo: 'JUBILACION_PCT', nombre: 'Jubilación trabajador', valor: 11, categoria: 'aportes_trabajador', descripcion: 'Aporte jubilatorio del trabajador', fuente: 'Ley 24.241' },
        { company_id: data.id, codigo: 'OBRA_SOCIAL_PCT', nombre: 'Obra social trabajador', valor: 3, categoria: 'aportes_trabajador', descripcion: 'Aporte de obra social del trabajador', fuente: 'Ley 23.660' },
        { company_id: data.id, codigo: 'PAMI_PCT', nombre: 'PAMI/INSSJP trabajador', valor: 3, categoria: 'aportes_trabajador', descripcion: 'Aporte PAMI del trabajador', fuente: 'Ley 19.032' },
        { company_id: data.id, codigo: 'SINDICAL_PCT', nombre: 'Aporte sindical', valor: 2, categoria: 'aportes_trabajador', descripcion: 'Aporte sindical (varía por convenio)', fuente: 'CCT aplicable', requires_manual_review: true },
        { company_id: data.id, codigo: 'JUB_PATRONAL_PCT', nombre: 'Jubilación patronal', valor: 16, categoria: 'contribuciones_patronales', descripcion: 'Contribución patronal jubilación', fuente: 'Ley 24.241' },
        { company_id: data.id, codigo: 'OS_PATRONAL_PCT', nombre: 'Obra social patronal', valor: 6, categoria: 'contribuciones_patronales', descripcion: 'Contribución patronal obra social', fuente: 'Ley 23.660' },
        { company_id: data.id, codigo: 'PAMI_PATRONAL_PCT', nombre: 'PAMI patronal', valor: 2, categoria: 'contribuciones_patronales', descripcion: 'Contribución patronal PAMI', fuente: 'Ley 19.032' },
        { company_id: data.id, codigo: 'FNE_PCT', nombre: 'Fondo Nacional de Empleo', valor: 1.5, categoria: 'contribuciones_patronales', descripcion: 'Contribución patronal FNE', fuente: 'Ley 24.013' },
        { company_id: data.id, codigo: 'ART_PCT', nombre: 'ART (riesgo del trabajo)', valor: 1.5, categoria: 'contribuciones_patronales', descripcion: 'Alícuota ART — varía por actividad y prestadora', fuente: 'Ley 24.557', requires_manual_review: true },
        { company_id: data.id, codigo: 'DIAS_BASE', nombre: 'Días base del mes', valor: 30, categoria: 'parametros_jornada', descripcion: 'Días base para cálculo proporcional mensual', fuente: 'Práctica habitual' },
        { company_id: data.id, codigo: 'HORAS_MENSUALES', nombre: 'Horas mensuales estándar', valor: 200, categoria: 'parametros_jornada', descripcion: 'Horas mensuales para cálculo de valor hora', fuente: 'LCT art. 197' },
        { company_id: data.id, codigo: 'HORAS_CONSTRUCCION', nombre: 'Horas mensuales construcción', valor: 176, categoria: 'parametros_jornada', descripcion: 'Horas de referencia CCT 76/75 UOCRA', fuente: 'CCT 76/75' },
        { company_id: data.id, codigo: 'HORA_EXTRA_50', nombre: 'Factor hora extra 50%', valor: 1.5, categoria: 'parametros_jornada', descripcion: 'Multiplicador para hora extra al 50%', fuente: 'LCT art. 201' },
        { company_id: data.id, codigo: 'HORA_EXTRA_100', nombre: 'Factor hora extra 100%', valor: 2, categoria: 'parametros_jornada', descripcion: 'Multiplicador para hora extra al 100%', fuente: 'LCT art. 201' },
      ])
      await unlockAchievement(supabase, user.id, data.id, 'PRIMERA_EMPRESA')
    }

    router.push('/dashboard/empresas')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/empresas" className="text-slate-400 hover:text-slate-600 text-sm">← Empresas</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium text-sm">Nueva empresa</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Nueva empresa</h1>
      <p className="text-sm text-slate-500 mb-6">
        Completá los datos de la empresa para comenzar el circuito de liquidación.
      </p>

      <div className="edu-banner mb-6">
        <strong>Primero se cargan los datos de la empresa y los legajos.</strong> Esta es la base de todo el circuito educativo. Los datos son simulados.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
        <h2 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100">Datos fiscales</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CUIT *</label>
            <input name="cuit" required value={form.cuit} onChange={handleChange}
              placeholder="30-12345678-0"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Razón social *</label>
            <input name="razon_social" required value={form.razon_social} onChange={handleChange}
              placeholder="Empresa SRL"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de fantasía</label>
            <input name="nombre_fantasia" value={form.nombre_fantasia} onChange={handleChange}
              placeholder="Nombre comercial"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Actividad principal</label>
            <input name="actividad_principal" value={form.actividad_principal} onChange={handleChange}
              placeholder="Comercio minorista"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="condicion_mipyme" id="mipyme"
            checked={form.condicion_mipyme}
            onChange={e => setForm(p => ({ ...p, condicion_mipyme: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded" />
          <label htmlFor="mipyme" className="text-sm text-slate-700">
            Empresa MiPyME <span className="text-slate-400">(micro, pequeña o mediana empresa)</span>
          </label>
        </div>

        <h2 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100 mt-2">Domicilio</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Domicilio fiscal</label>
            <input name="domicilio_fiscal" value={form.domicilio_fiscal} onChange={handleChange}
              placeholder="Calle 123, piso 1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Localidad</label>
            <input name="localidad" value={form.localidad} onChange={handleChange}
              placeholder="Posadas"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Provincia</label>
            <select name="provincia" value={form.provincia} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-100 mt-2">Contacto y otros</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange}
              placeholder="(376) 4123456"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="empresa@mail.com"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">ART simulada</label>
            <input name="art_simulada" value={form.art_simulada} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio actividad</label>
            <input type="date" name="fecha_inicio_actividad" value={form.fecha_inicio_actividad} onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm">
            {loading ? 'Guardando...' : '✓ Crear empresa'}
          </button>
          <Link href="/dashboard/empresas"
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
