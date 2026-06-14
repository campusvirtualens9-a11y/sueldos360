'use client'

import { formatPeriodo } from '@/lib/utils'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/client'
import { unlockAchievement } from '@/lib/achievements'

interface Props {
  company: Record<string, unknown> | null
  employees: Record<string, unknown>[]
  payrollRuns: Record<string, unknown>[]
  userId: string
}

export default function ExportacionesClient({ company, employees, payrollRuns, userId }: Props) {
  const supabase = createClient()
  function downloadCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function exportNominaCSV() {
    downloadCSV('nomina-empleados.csv',
      ['CUIL','DNI','Apellido','Nombre','Puesto','Categoría','Fecha ingreso','Modalidad','Sueldo básico','Estado'],
      employees.map(e => [e.cuil, e.dni, e.apellido, e.nombre, e.puesto, e.categoria, e.fecha_ingreso, e.modalidad, e.sueldo_basico, e.status] as (string | number | null | undefined)[])
    )
  }

  function exportLiquidacionesCSV() {
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

  async function exportLibroXLSX() {
    const wb = XLSX.utils.book_new()

    // Hoja 1: Nómina
    const nominaHeaders = ['CUIL','DNI','Apellido','Nombre','Puesto','Categoría','Fecha ingreso','Modalidad','Sueldo básico','Estado']
    const nominaRows = employees.map(e => [
      e.cuil, e.dni, e.apellido, e.nombre, e.puesto, e.categoria,
      e.fecha_ingreso, e.modalidad, e.sueldo_basico, e.status,
    ])
    const wsNomina = XLSX.utils.aoa_to_sheet([nominaHeaders, ...nominaRows])
    wsNomina['!cols'] = nominaHeaders.map((_, i) => ({ wch: i === 2 || i === 3 ? 20 : 14 }))
    XLSX.utils.book_append_sheet(wb, wsNomina, 'Nómina')

    // Hoja 2: Liquidaciones por período
    const liqHeaders = ['Período','Tipo','CUIL','Apellido','Nombre','Días trab.','Total rem.','Total no rem.','Descuentos','Bruto','Neto','Aportes trab.','Contrib. patronal','Costo laboral','Estado']
    const liqRows = payrollRuns.flatMap(run =>
      ((run.payroll_results as Record<string, unknown>[]) || []).map(r => {
        const emp = r.employees as Record<string, unknown>
        return [
          formatPeriodo(run.periodo as string), run.tipo,
          emp?.cuil, emp?.apellido, emp?.nombre,
          r.dias_trabajados, r.total_remunerativo, r.total_no_remunerativo,
          r.total_descuentos, r.sueldo_bruto, r.sueldo_neto,
          r.total_aportes, r.total_contribuciones, r.costo_laboral, run.status,
        ]
      })
    )
    const wsLiq = XLSX.utils.aoa_to_sheet([liqHeaders, ...liqRows])
    wsLiq['!cols'] = liqHeaders.map((_, i) => ({ wch: i < 5 ? 16 : 14 }))
    XLSX.utils.book_append_sheet(wb, wsLiq, 'Liquidaciones')

    // Hoja 3: Resumen por período
    const resHeaders = ['Período','Tipo','Empleados','Total bruto','Total neto','Total aportes','Total contribuciones','Costo laboral total','Estado']
    const resRows = payrollRuns.map(run => [
      formatPeriodo(run.periodo as string), run.tipo,
      ((run.payroll_results as unknown[]) || []).length,
      run.total_bruto, run.total_neto,
      run.total_aportes_trabajador, run.total_contribuciones_patronales,
      run.total_costo_laboral, run.status,
    ])
    const wsRes = XLSX.utils.aoa_to_sheet([resHeaders, ...resRows])
    wsRes['!cols'] = resHeaders.map(() => ({ wch: 16 }))
    XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen')

    const empresa = (company?.razon_social as string || 'empresa').replace(/\s/g, '-')
    XLSX.writeFile(wb, `libro-sueldos-${empresa}.xlsx`)

    if (company?.id) {
      await unlockAchievement(supabase, userId, company.id as string, 'PRIMER_EXPORT')
    }
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
      action: exportNominaCSV,
      format: 'CSV',
      disabled: employees.length === 0,
    },
    {
      title: '📊 Libro de sueldos completo',
      desc: 'Nómina + liquidaciones + resumen por período en un solo archivo Excel (3 hojas)',
      action: exportLibroXLSX,
      format: 'XLSX',
      disabled: !company,
    },
    {
      title: '💰 Liquidaciones',
      desc: 'Historial de liquidaciones con detalle por empleado',
      action: exportLiquidacionesCSV,
      format: 'CSV',
      disabled: payrollRuns.length === 0,
    },
    {
      title: '💾 Backup completo',
      desc: 'Exportar todos los datos de la empresa en formato JSON',
      action: exportBackupJSON,
      format: 'JSON',
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
        <strong>Exportaciones disponibles:</strong> Nómina CSV, Libro de sueldos Excel (3 hojas), liquidaciones CSV,
        backup JSON, recibos PDF (desde Recibos), Libro de Sueldos PDF (desde Libro de Sueldos) e informe F.931 (desde F.931).
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
                exp.format === 'XLSX' ? 'badge-yellow' :
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
          <p className="text-sm text-slate-500">El Libro de Sueldos PDF se exporta desde <strong>Libro de Sueldos</strong>.</p>
          <p className="text-sm text-slate-500">El F.931 simulado se genera desde <strong>F.931 Simulado</strong>.</p>
        </div>
      </div>
    </div>
  )
}
