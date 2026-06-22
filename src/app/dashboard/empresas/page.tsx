import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { TributarSyncCard } from './TributarSyncCard'

export default async function EmpresasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const canCreate = !companies || companies.length < 2

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {companies?.length || 0}/2 empresas creadas
          </p>
        </div>
        {canCreate ? (
          <Link href="/dashboard/empresas/nueva"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Nueva empresa
          </Link>
        ) : (
          <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
            ⚠️ Límite de 2 empresas alcanzado
          </span>
        )}
      </div>

      <div className="edu-banner mb-6">
        <strong>Límite educativo:</strong> Cada usuario puede crear hasta <strong>2 empresas</strong> con hasta <strong>10 empleados</strong> cada una. Los datos son simulados para prácticas de aula.
      </div>

      {companies && companies.length > 0 ? (
        <div className="grid gap-4">
          {companies.map(company => (
            <div key={company.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {company.razon_social.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{company.razon_social}</h3>
                    {company.nombre_fantasia && (
                      <p className="text-xs text-slate-500">"{company.nombre_fantasia}"</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">CUIT: {company.cuit}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/empresas/${company.id}`}
                    className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                    Editar
                  </Link>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span>Actividad: {company.actividad_principal || '—'}</span>
                <span>Provincia: {company.provincia}</span>
                <span>MiPyME: {company.condicion_mipyme ? 'Sí' : 'No'}</span>
                <span>Activa desde: {company.fecha_inicio_actividad ? formatDate(company.fecha_inicio_actividad) : '—'}</span>
              </div>

              {/* Código de sincronización con TRIBUT.AR */}
              <TributarSyncCard
                token={(company as any).sync_token ?? null}
                companyName={company.razon_social}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">🏢</p>
          <p className="font-medium">Todavía no cargaste ninguna empresa</p>
          <p className="text-sm mt-1">Creá tu primera empresa para comenzar a liquidar sueldos</p>
          <Link href="/dashboard/empresas/nueva"
            className="inline-block mt-4 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700">
            + Crear empresa
          </Link>
        </div>
      )}
    </div>
  )
}