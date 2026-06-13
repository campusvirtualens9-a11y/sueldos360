'use client'

import { formatCurrency, formatPeriodo } from '@/lib/utils'

interface Props {
  slipId: string
  empNombre: string
  periodo: string
  company: Record<string, unknown>
  result: Record<string, unknown>
  items: Record<string, unknown>[]
}

export default function RecibosPDFButton({ slipId, empNombre, periodo, company, result, items }: Props) {
  async function handleExport() {
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Encabezado
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RECIBO DE SUELDO', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Empresa: ${company.razon_social}`, 14, 30)
    doc.text(`CUIT: ${company.cuit}`, 14, 36)
    doc.text(`Empleado: ${empNombre}`, 14, 42)
    doc.text(`Período: ${formatPeriodo(periodo)}`, 14, 48)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 54)

    // Haberes
    const haberes = items.filter(i => i.concept_tipo !== 'descuento' && i.concept_tipo !== 'contribucion_patronal')
    const descuentos = items.filter(i => i.concept_tipo === 'descuento')

    autoTable(doc, {
      startY: 62,
      head: [['Concepto', 'Importe']],
      body: [
        ...haberes.map(i => [i.concept_nombre as string, formatCurrency(i.importe as number)]),
        [{ content: 'TOTAL BRUTO', styles: { fontStyle: 'bold' } }, { content: formatCurrency(result.sueldo_bruto as number), styles: { fontStyle: 'bold' } }],
        ['', ''],
        ...descuentos.map(i => [i.concept_nombre as string, `- ${formatCurrency(i.importe as number)}`]),
        [{ content: 'TOTAL DESCUENTOS', styles: { fontStyle: 'bold' } }, { content: `- ${formatCurrency(result.total_descuentos as number)}`, styles: { fontStyle: 'bold' } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: { 1: { halign: 'right' } },
    })

    const finalY = ((doc as unknown as Record<string, { finalY?: number }>).lastAutoTable?.finalY) ?? 150
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(`NETO A COBRAR: ${formatCurrency(result.sueldo_neto as number)}`, 105, finalY + 15, { align: 'center' })

    // Firmas
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('_______________________', 30, finalY + 35)
    doc.text('Firma empleador', 30, finalY + 40)
    doc.text('_______________________', 130, finalY + 35)
    doc.text('Firma trabajador', 130, finalY + 40)

    doc.setFontSize(8)
    doc.text('⚠ Recibo simulado con fines educativos — Sueldos 360 — No reemplaza documentación oficial', 105, finalY + 55, { align: 'center' })

    doc.save(`recibo-${empNombre.replace(/\s/g, '-')}-${periodo}.pdf`)
  }

  return (
    <button
      onClick={handleExport}
      className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
    >
      📄 Exportar PDF
    </button>
  )
}
