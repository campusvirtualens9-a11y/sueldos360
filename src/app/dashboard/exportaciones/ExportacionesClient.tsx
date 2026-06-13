'use client'

import { formatCurrency, formatDate, formatPeriodo } from '@/lib/utils'

interface Props {
  company: Record<string, unknown> | null
  employees: Record<string, unknown>[]
  payrollRuns: Record<string, unknown>[]
}

export default function ExportacionesClient({ company, employees, payrollRuns }: Props) {
  function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function exportNomina() {
    downloadCSV('nomina-empleados.csv',
      ['CUIL','DNI','Apellido','Nombre','Puesto','Categoría','Fecha ingreso','Modalidad','Sueldo básico','Estado'],
      employees.map(e => [e.cuil, e.dni, e.apellido, e.nombre, e.puesto, e.categoria, e.fecha_ingreso, e.modalidad, e.sueldo_basico, e.status] as (string | number | null | undefined)[])
    )
  }

  function exportLiquidaciones() {
    const rows: (string | number | null | undefined)[][] = payrollRuns.flatMap(run =>
      ((run.payroll_results as Record<string, unknown>[]) || []).map(r => {
        const emp = r.employees as Record<string, unknown>
        return [run.periodo, run.tipo, emp?.cuil, emp?.apellido, emp?.nombre,
          r.dias_trabajados, r.total_remunerativo, r.total_no_remunerativo,
          r.total_descuentos, r.sueldo_bruto, r.sueldo_neto,
          r.total_aportes, r.total_contribuciones, r.costo_laboral, run.status] as (string | number | null | undefined)[]
      })
    )
    downloadCSV('liquidaciones.csv',
      ['Período','Tipo','CUIL','Apellido','Nombre','Días','Remunerativo','No Rem.','Descuentos','Bruto','Neto','Aportes','Contribuciones','Costo Laboral','Estado'],
      rows
    )
  }

  function exportBackupJSON() {
    const data = { empresa: company, empleados: employees, liquidaciones: payrollRuns, exportado_en: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `backup-${(company?.razon_social as string || 'empresa').replace(/\s/g, '-')}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const exports = [
    {
      title: '📋 Nómina de empleados',
      desc: 'Lista completa de empleados con datos personales y laborales',
      action: exportNomina,
      format: 'CSV',
      color: 'green',
      disabled: employees.length === 0,
    },
    {
      title: '💰 Liquidaciones',
      desc: 'Historial de liquidaciones con detalle por empleado',
      action: exportLiquidaciones,
      format: 'CSV',
      color: 'blue',
      disabled: payrollRuns.length === 0,
    },
    {
      title: '💾 Backup completo',
      desc: 'Exportar todos los datos de la empresa en formato JSON',
      action: exportBackupJSON,
      format: 'JSON',
      color: 'purple',
      disabled: !company,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Exportaciones</h1>
        <p className="text-sm text-slate-500 mt-0.5">{(company?.razon_social as string) || 'Sin empresa'}</p>
      </div>

      <div className="edu-banner mb-6">
        <strong>Exportaciones disponibles:</strong> Nómina en CSV, liquidaciones en CSV, recibos PDF (desde la sección Recibos),
        Libro de Sueldos PDF/CSV (desde Libro de Sueldos), e informe F.931 PDF (desde F.931).
        Todos los archivos son simulados con fines educativos.
      </div>

      <div className="grid gap-4">
        {exports.map(exp => (
          <div key={exp.title} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{exp.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{exp.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge text-xs ${
                exp.format === 'CSV' ? 'badge-green' :
                exp.format === 'JSON' ? 'badge-blue' : 'badge-red'
              }`}>{exp.format}</span>
              <button
                onClick={exp.action}
                disabled={exp.disabled}
                className="text-sm font-medium bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                📤 Exportar
              </button>
            </div>
          </div>
        ))}

        <div className="card border-dashed border-slate-300 text-center py-6">
          <p className="text-sm text-slate-500">Los recibos PDF se exportan desde <strong>Recibos</strong>.</p>
          <p className="text-sm text-slate-500">El Libro de Sueldos PDF/CSV se exporta desde <strong>Libro de Sueldos</strong>.</p>
          <p className="text-sm text-slate-500">El F.931 simulado se genera desde <strong>F.931 Simulado</strong>.</p>
        </div>
      </div>
    </div>
  )
}
