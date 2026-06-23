import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatDate, calcularAntiguedadAnios } from '@/lib/utils'

export default async function LegajosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, razon_social')
    .eq('user_id', user!.id)

  const company = companies?.[0] || null

  const { data: employees } = company
    ? await supabase
        .from('employees')
        .select('*, employee_files(*)')
        .eq('company_id', company.id)
        .order('apellido')
    : { data: [] }

  function legajoProgress(emp: Record<string, unknown>): number {
    const ef = (emp.employee_files as Record<string, unknown>[])?.[0]
    if (!ef) return 0
    const checks = ['dni_copia','cuil_constancia','alta_temprana','contrato_designacion','constancia_domicilio','ficha_datos_personales']
    const done = checks.filter(c => ef[c]).length
    return Math.round((done / checks.length) * 100)
  }

  const canCreate = !employees || employees.length < 10

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Legajos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {employees?.length || 0}/10 empleados · {company?.razon_social || 'Sin empresa'}
          </p>
        </div>
        {company && canCreate && (
          <Link href="/dashboard/legajos/nuevo"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Nuevo empleado
          </Link>
        )}
        {company && !canCreate && (
          <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
            Límite: 10 empleados
          </span>
        )}
      </div>

      {!company && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">🏢</div>
          <p className="text-slate-600 font-medium mb-2">Primero creá una empresa</p>
          <Link href="/dashboard/empresas/nueva" className="text-blue-600 text-sm font-medium hover:underline">
            Crear empresa →
          </Link>
        </div>
      )}

      {company && employees && employees.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-slate-600 font-medium mb-2">No hay empleados todavía</p>
          <Link href="/dashboard/legajos/nuevo"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-1">
            Agregar primer empleado
          </Link>
        </div>
      )}

      {employees && employees.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>CUIL</th>
                <th>Categoría</th>
                <th>Ingreso</th>
                <th>Antigüedad</th>
                <th>Estado</th>
                <th>Legajo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const antiguedad = calcularAntiguedadAnios(emp.fecha_ingreso)
                const progress = legajoProgress(emp as Record<string, unknown>)
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="font-medium text-slate-800">{emp.apellido}, {emp.nombre}</div>
                      <div className="text-xs text-slate-400">{emp.puesto || '—'}</div>
                    </td>
                    <td className="font-mono text-xs">{emp.cuil}</td>
                    <td className="text-xs">{emp.categoria || '—'}</td>
                    <td className="text-xs">{formatDate(emp.fecha_ingreso)}</td>
                    <td className="text-xs">{antiguedad} año{antiguedad !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={`badge text-xs ${
                        emp.status === 'activo' ? 'badge-green' :
                        emp.status === 'baja' ? 'badge-red' : 'badge-yellow'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{progress}%</span>
                      </div>
                    </td>
                    <td>
                      <Link href={`/dashboard/legajos/${emp.id}`}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <div className="edu-banner mt-6">
        <strong>Legajos completos:</strong> Cada legajo debe tener DNI, CUIL, alta temprana simulada, contrato y constancia de domicilio.
        Los legajos incompletos generan alertas en el dashboard.
      </div>
    </div>
  )
}
