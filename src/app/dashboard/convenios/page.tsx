import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ConveniosPage() {
  const supabase = await createClient()

  const { data: agreements } = await supabase
    .from('agreements')
    .select('*, agreement_categories(*), agreement_additionals(*), agreement_sources(*)')
    .order('rubro')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Convenios Colectivos de Trabajo</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {agreements?.length || 0} convenios disponibles · Datos de referencia educativa
        </p>
      </div>

      <div className="edu-banner mb-6">
        <strong>Datos de convenio:</strong> Los básicos cargados son de referencia a junio 2026. Los valores marcados con ⚠️ requieren verificación manual desde las fuentes oficiales.
        Todos los importes son <strong>editables</strong>. No cargar como definitivos sin verificar.
      </div>

      {agreements?.map(agr => (
        <div key={agr.id} className="card mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-800">{agr.nombre}</h2>
                {agr.requires_manual_review && (
                  <span className="badge badge-yellow text-xs">⚠️ Requiere revisión</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {agr.numero_cct} · {agr.rubro} · Actualizado: {formatDate(agr.fecha_actualizacion)}
              </p>
            </div>
            <span className="badge badge-blue text-xs">{agr.tipo_liquidacion}</span>
          </div>

          {agr.observaciones_educativas && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3 text-xs text-blue-800 leading-relaxed">
              📝 {agr.observaciones_educativas}
            </div>
          )}

          {/* Parámetros del convenio */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Jornada</div>
              <div className="font-semibold text-sm text-slate-700">{agr.jornada_estandar_horas}h/mes</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Antigüedad</div>
              <div className="font-semibold text-sm text-slate-700">{agr.antiguedad_porcentaje ? `${agr.antiguedad_porcentaje}% x año` : '—'}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Presentismo</div>
              <div className="font-semibold text-sm text-slate-700">{agr.presentismo_porcentaje ? `${agr.presentismo_porcentaje}%` : '—'}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <div className="text-xs text-slate-400">Aporte solidario</div>
              <div className="font-semibold text-sm text-slate-700">{agr.aporte_solidario_porcentaje ? `${agr.aporte_solidario_porcentaje}%` : '—'}</div>
            </div>
          </div>

          {/* Categorías */}
          {agr.agreement_categories && agr.agreement_categories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Categorías y básicos</h3>
              <div className="overflow-x-auto">
                <table className="table-base text-xs">
                  <thead>
                    <tr>
                      <th>Categoría</th>
                      <th>Básico mensual</th>
                      {agr.tipo_liquidacion === 'jornal' && <th>Valor hora</th>}
                      <th>Zona</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agr.agreement_categories.map((cat: { id: string; nombre: string; sueldo_basico: number | null; valor_hora: number | null; zona: string | null; clase_establecimiento: string | null; requires_manual_review: boolean }) => (
                      <tr key={cat.id}>
                        <td className="font-medium">{cat.nombre}</td>
                        <td className="font-mono">
                          {cat.sueldo_basico ? formatCurrency(cat.sueldo_basico) : (
                            <span className="text-orange-500">NULL — pendiente revisión</span>
                          )}
                        </td>
                        {agr.tipo_liquidacion === 'jornal' && (
                          <td className="font-mono">
                            {cat.valor_hora ? `$${cat.valor_hora.toLocaleString('es-AR')}` : '—'}
                          </td>
                        )}
                        <td className="text-slate-500">{cat.zona || cat.clase_establecimiento || '—'}</td>
                        <td>
                          {cat.requires_manual_review
                            ? <span className="badge badge-yellow">⚠️ Revisar</span>
                            : <span className="badge badge-green">✓ OK</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fuentes */}
          {agr.agreement_sources && agr.agreement_sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">Fuente: </span>
              {agr.agreement_sources.map((src: { id: string; nombre: string; url: string | null; fecha_consulta: string | null }) => (
                <span key={src.id} className="text-xs text-slate-500">
                  {src.nombre}
                  {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 ml-1 hover:underline">[ver]</a>}
                  {src.fecha_consulta && <span className="text-slate-400"> ({formatDate(src.fecha_consulta)})</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="edu-banner mt-6">
        <strong>Convenios colectivos:</strong> Luego se configuran convenios, categorías y parámetros.
        Los datos cargados son semillas educativas de referencia. Para uso real, verificar con los organismos sindicales y cámaras oficiales.
      </div>
    </div>
  )
}
