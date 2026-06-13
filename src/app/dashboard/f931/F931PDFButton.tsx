'use client'

import { formatCurrency, formatPeriodo } from '@/lib/utils'

interface Props {
  report: Record<string, unknown>
  company: Record<string, unknown>
}

export default function F931PDFButton({ report, company }: Props) {

  async function handleExport() {
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const PW = 210
    const M  = 15
    const R  = PW - M     // 195
    const CW = R - M      // 180
    const MID = M + CW / 2

    // valores del reporte
    const rem        = Number(report.total_remuneraciones ?? 0)
    const ap_jub     = Number(report.total_aportes_jubilatorios ?? 0)
    const ap_os      = Number(report.total_obra_social ?? 0)
    const ap_pami    = Number(report.total_pami ?? 0)
    const ap_total   = ap_jub + ap_os + ap_pami
    const cp_jub     = rem * 0.16
    const cp_os      = rem * 0.06
    const cp_pami    = rem * 0.02
    const cp_fne     = rem * 0.015
    const cp_art     = Number(report.art_monto ?? rem * 0.015)
    const cp_total   = Number(report.total_contribuciones_patronales ?? 0) || cp_jub + cp_os + cp_pami + cp_fne + cp_art
    const total_gral = Number(report.total_general ?? ap_total + cp_total)
    const nEmpl      = Number(report.cantidad_empleados ?? 0)
    const periodo    = String(report.periodo ?? '')
    const statusMap: Record<string, string> = { borrador: 'BORRADOR', presentado: 'PRESENTADO', pagado: 'PAGADO', rectificativo: 'RECTIFICATIVO' }
    const statusLabel = statusMap[String(report.status ?? 'borrador')] ?? 'BORRADOR'

    // ─── WATERMARK ─────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(70)
    doc.setTextColor(232, 240, 253)
    doc.text('SIMULADO', MID, 165, { align: 'center', angle: 40 })
    doc.setFontSize(40)
    doc.text('EDUCATIVO', MID - 5, 222, { align: 'center', angle: 40 })

    // ─── ENCABEZADO TIPO ARCA ──────────────────────────────────────
    // Franja azul ARCA
    doc.setFillColor(0, 71, 171)
    doc.rect(M, 10, CW, 18, 'F')

    // Logo placeholder ARCA (izquierda)
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(M + 2, 12.5, 24, 13, 1.5, 1.5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 71, 171)
    doc.text('ARCA', M + 14, 21, { align: 'center' })

    // Título del formulario
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('FORMULARIO F.931 — DECLARACIÓN JURADA DE CARGAS SOCIALES MENSUALES', MID + 10, 18, { align: 'center' })
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Agencia de Recaudación y Control Aduanero — República Argentina', MID + 10, 24, { align: 'center' })

    // Badge de estado (derecha)
    const statusColor: [number, number, number] = report.status === 'pagado' ? [22, 163, 74] : report.status === 'presentado' ? [37, 99, 235] : [202, 138, 4]
    doc.setFillColor(...statusColor)
    doc.roundedRect(R - 28, 12, 26, 8, 1, 1, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text(statusLabel, R - 15, 17.3, { align: 'center' })

    // Línea de período (barra gris debajo del header)
    doc.setFillColor(241, 245, 249)
    doc.rect(M, 28, CW, 10, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.rect(M, 28, CW, 10)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('PERÍODO DECLARADO:', M + 3, 34.5)
    doc.setFont('helvetica', 'normal')
    doc.text(formatPeriodo(periodo).toUpperCase(), M + 48, 34.5)
    doc.setFont('helvetica', 'bold')
    doc.text('FECHA DE EMISIÓN:', MID + 5, 34.5)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date().toLocaleDateString('es-AR'), MID + 42, 34.5)

    // ─── DATOS DEL EMPLEADOR ────────────────────────────────────────
    let y = 42
    sectionHeader(doc, 'I. DATOS DEL EMPLEADOR', M, y, CW)
    y += 8
    doc.setFillColor(249, 250, 251)
    doc.rect(M, y, CW, 28, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.rect(M, y, CW, 28)

    const dataRow = (label: string, value: string, x: number, ly: number, w = 80) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(71, 85, 105)
      doc.text(label, x + 2, ly)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(15, 23, 42)
      doc.text(value, x + 2, ly + 5)
    }

    dataRow('CUIT', String(company.cuit ?? '—'), M, y + 7)
    dataRow('RAZÓN SOCIAL', String(company.razon_social ?? '—'), M + 55, y + 7)
    const dom = [company.domicilio_fiscal, company.localidad, company.provincia].filter(Boolean).join(', ')
    dataRow('DOMICILIO FISCAL', dom || '—', M, y + 18)
    dataRow('ACTIVIDAD', String(company.actividad_principal ?? '—'), M + 90, y + 18)
    dataRow('CANT. TRABAJADORES DECLARADOS', String(nEmpl), R - 40, y + 7)

    // ─── REMUNERACIONES ─────────────────────────────────────────────
    y += 32
    sectionHeader(doc, 'II. DECLARACIÓN DE REMUNERACIONES', M, y, CW)
    y += 8
    doc.setFillColor(219, 234, 254)
    doc.rect(M, y, CW, 12, 'F')
    doc.setDrawColor(37, 99, 235)
    doc.rect(M, y, CW, 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(29, 78, 216)
    doc.text('TOTAL REMUNERACIONES IMPONIBLES DECLARADAS', M + 3, y + 5)
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text(formatCurrency(rem), R - 3, y + 8, { align: 'right' })

    // ─── APORTES DEL TRABAJADOR ─────────────────────────────────────
    y += 16
    sectionHeader(doc, 'III. APORTES DEL TRABAJADOR (retención obligatoria)', M, y, CW)
    y += 8

    const rows_ap: [string, string, number][] = [
      ['Jubilación / Retiro — SIPA', '11%', ap_jub],
      ['Obra Social trabajador — ANSSAL', '3%', ap_os],
      ['PAMI / INSSJP trabajador', '3%', ap_pami],
    ]
    y = detailTable(doc, rows_ap, M, y, CW, R)

    // Total aportes
    y += 1
    doc.setFillColor(220, 252, 231)
    doc.rect(M, y, CW, 9, 'F')
    doc.setDrawColor(34, 197, 94)
    doc.rect(M, y, CW, 9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('TOTAL APORTES TRABAJADOR', M + 3, y + 6)
    doc.text(formatCurrency(ap_total), R - 3, y + 6, { align: 'right' })
    y += 10

    // ─── CONTRIBUCIONES PATRONALES ──────────────────────────────────
    y += 4
    sectionHeader(doc, 'IV. CONTRIBUCIONES PATRONALES (cargo del empleador)', M, y, CW)
    y += 8

    const rows_cp: [string, string, number][] = [
      ['Jubilación / Retiro patronal — SIPA', '16%', cp_jub],
      ['Obra Social patronal — ANSSAL', '6%', cp_os],
      ['PAMI / INSSJP patronal', '2%', cp_pami],
      ['Fondo Nacional de Empleo — MTEySS', '1.5%', cp_fne],
      ['ART (Aseguradora de Riesgos del Trabajo)', '1.5%', cp_art],
    ]
    y = detailTable(doc, rows_cp, M, y, CW, R)

    // Total contribuciones
    y += 1
    doc.setFillColor(254, 226, 226)
    doc.rect(M, y, CW, 9, 'F')
    doc.setDrawColor(239, 68, 68)
    doc.rect(M, y, CW, 9)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(15, 23, 42)
    doc.text('TOTAL CONTRIBUCIONES PATRONALES', M + 3, y + 6)
    doc.text(formatCurrency(cp_total), R - 3, y + 6, { align: 'right' })
    y += 10

    // ─── TOTAL GENERAL ──────────────────────────────────────────────
    y += 5
    doc.setFillColor(0, 71, 171)
    doc.roundedRect(M, y, CW, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text('TOTAL GENERAL A DEPOSITAR EN ARCA', M + 4, y + 6)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(147, 197, 253)
    doc.text('Aportes trabajador + Contribuciones patronales', M + 4, y + 11)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(formatCurrency(total_gral), R - 4, y + 10, { align: 'right' })
    y += 18

    // ─── DECLARACIÓN JURADA ─────────────────────────────────────────
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    const declText = 'El/La firmante, en carácter de empleador o representante autorizado, declara bajo juramento que los datos '
      + 'consignados en la presente declaración jurada son exactos y completos, y que no se han omitido ni falsificado datos '
      + 'que deban ser declarados, conociendo las sanciones previstas en el Art. 45 de la Ley 11.683 y concordantes.'
    const lines = doc.splitTextToSize(declText, CW)
    doc.text(lines, M, y)
    y += lines.length * 4 + 6

    // Firma
    doc.setDrawColor(150, 164, 175)
    doc.setLineWidth(0.3)
    const firmaEnd = M + CW * 0.45
    doc.line(M + 5, y + 16, firmaEnd, y + 16)
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('Firma y aclaración / Responsable de la empresa', M + 5 + (firmaEnd - M - 5) / 2, y + 21, { align: 'center' })

    const fechaX = M + CW * 0.65
    doc.line(fechaX, y + 16, R - 5, y + 16)
    doc.text('Lugar y fecha de presentación', fechaX + (R - 5 - fechaX) / 2, y + 21, { align: 'center' })

    // ─── DISCLAIMER ─────────────────────────────────────────────────
    y += 28
    doc.setFillColor(255, 251, 235)
    doc.rect(M, y, CW, 14, 'F')
    doc.setDrawColor(202, 138, 4)
    doc.rect(M, y, CW, 14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(120, 80, 0)
    doc.text('AVISO: FORMULARIO SIMULADO — USO EXCLUSIVAMENTE EDUCATIVO', MID, y + 5, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.text('Este formulario F.931 es una simulación pedagógica. No reemplaza la declaración oficial que debe realizarse en el portal ARCA (ex-AFIP).', MID, y + 9, { align: 'center' })
    doc.text('Los valores son de referencia educativa y no constituyen obligación tributaria ni previsional válida.', MID, y + 13, { align: 'center' })

    const fname = `f931-${String(company.cuit ?? 'empresa').replace(/[-\s]/g, '')}-${periodo}.pdf`
    doc.save(fname)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
    >
      <span>📄</span>
      <span>Exportar F.931 PDF</span>
    </button>
  )
}

function sectionHeader(doc: InstanceType<typeof import('jspdf').default>, title: string, x: number, y: number, w: number) {
  doc.setFillColor(30, 64, 175)
  doc.rect(x, y, w, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(title, x + 3, y + 4.8)
}

function detailTable(
  doc: InstanceType<typeof import('jspdf').default>,
  rows: [string, string, number][],
  M: number, y: number, CW: number, R: number
): number {
  const rowH = 7
  rows.forEach((row, i) => {
    const even = i % 2 === 0
    doc.setFillColor(even ? 249 : 255, even ? 250 : 255, even ? 251 : 255)
    doc.rect(M, y + i * rowH, CW, rowH, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(15, 23, 42)
    doc.text(row[0], M + 3, y + i * rowH + 4.8)
    doc.setTextColor(100, 116, 139)
    doc.text(row[1], M + CW * 0.72, y + i * rowH + 4.8, { align: 'center' })
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(row[2]), R - 3, y + i * rowH + 4.8, { align: 'right' })
  })
  // border
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.rect(M, y, CW, rows.length * rowH)
  // horizontal row lines
  for (let i = 1; i < rows.length; i++) {
    doc.line(M, y + i * rowH, M + CW, y + i * rowH)
  }
  // % column separator
  doc.line(M + CW * 0.65, y, M + CW * 0.65, y + rows.length * rowH)
  return y + rows.length * rowH
}
