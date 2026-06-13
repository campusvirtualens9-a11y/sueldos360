import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

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
                <div className="flex items-center gap-2">
                  {company.is_active && (
                    <span className="badge badge-green text-xs">Activa</span>
                  )}
                  {company.condicion_mipyme && (
                    <span className="badge badge-blue text-xs">MiPyME</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Actividad</p>
                  <p className="text-slate-700 font-medium">{company.actividad_principal || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Provincia</p>
                  <p className="text-slate-700 font-medium">{company.provincia}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Inicio actividad</p>
                  <p className="text-slate-700 font-medium">{formatDate(company.fecha_inicio_actividad)}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/empresas/${company.id}`}
                  className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-medium">
                  Ver / Editar
                </Link>
                <Link href={`/dashboard/legajos?empresa=${company.id}`}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                  Ver legajos
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🏢</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay empresas creadas</h3>
          <p className="text-slate-500 text-sm mb-6">
            Comenzá creando tu primera empresa para practicar el circuito de liquidación.
          </p>
          <Link href="/dashboard/empresas/nueva"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors">
            Crear primera empresa
          </Link>
        </div>
      )}
    </div>
  )
}
