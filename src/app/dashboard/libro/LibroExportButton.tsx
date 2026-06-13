'use client'

import { formatCurrency, formatPeriodo } from '@/lib/utils'

interface Props {
  run: Record<string, unknown>
  company: Record<string, unknown>
  results: Record<string, unknown>[]
}

export default function LibroExportButton({ run, company, results }: Props) {
  async function exportCSV() {
    const header = ['Empleado','CUIL','Días','Remunerativo','No Remunerativo','Descuentos','Neto','Aportes','Contribuciones','Costo Laboral']
    const rows = results.map(r => {
      const e = r.employees as Record<string, unknown>
      return [
        `${e?.apellido}, ${e?.nombre}`,
        e?.cuil,
        r.dias_trabajados,
        r.total_remunerativo,
        r.total_no_remunerativo,
        r.total_descuentos,
        r.sueldo_neto,
        r.total_aportes,
        r.total_contribuciones,
        r.costo_laboral,
      ]
    })
    const csv = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `libro-sueldos-${run.periodo}-${company.cuit}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(14)
    doc.text('LIBRO DE SUELDOS Y JORNALES — SIMULACIÓN EDUCATIVA', 148, 15, { align: 'center' })
    doc.setFontSize(10)
    doc.text(`Empresa: ${company.razon_social} · CUIT: ${company.cuit}`, 14, 22)
    doc.text(`Período: ${formatPeriodo(run.periodo as string)} · Tipo: ${run.tipo}`, 14, 28)

    autoTable(doc, {
      startY: 34,
      head: [['Empleado','CUIL','Días','Remunerativo','No Rem.','Descuentos','Neto','Aportes','Contrib.','Costo Laboral']],
      body: results.map(r => {
        const e = r.employees as Record<string, unknown>
        return [
          `${e?.apellido}, ${e?.nombre}`,
          String(e?.cuil ?? ''),
          String(r.dias_trabajados ?? ''),
          formatCurrency(r.total_remunerativo as number),
          formatCurrency(r.total_no_remunerativo as number),
          formatCurrency(r.total_descuentos as number),
          formatCurrency(r.sueldo_neto as number),
          formatCurrency(r.total_aportes as number),
          formatCurrency(r.total_contribuciones as number),
          formatCurrency(r.costo_laboral as number),
        ]
      }),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 7 },
    })

    doc.setFontSize(8)
    doc.text('⚠ Simulación educativa — Sueldos 360 — No reemplaza el Libro de Sueldos oficial', 148, 200, { align: 'center' })
    doc.save(`libro-sueldos-${run.periodo}-${company.cuit}.pdf`)
  }

  return (
    <div className="flex gap-2">
      <button onClick={exportCSV}
        className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium">
        📊 CSV
      </button>
      <button onClick={exportPDF}
        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
        📄 PDF
      </button>
    </div>
  )
}
