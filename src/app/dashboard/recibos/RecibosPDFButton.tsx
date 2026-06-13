'use client'

import { formatCurrency, formatPeriodo } from '@/lib/utils'

interface Props {
  slipId: string
  empNombre: string
  empCuil: string
  empCategoria: string
  empFechaIngreso: string | null
  empObraSocial: string | null
  periodo: string
  company: Record<string, unknown>
  result: Record<string, unknown>
  items: Record<string, unknown>[]
}

export default function RecibosPDFButton({
  empNombre, empCuil, empCategoria, empFechaIngreso, empObraSocial,
  periodo, company, result, items,
}: Props) {

  async function handleExport() {
    const { default: jsPDF } = await import('jspdf')

    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const PW  = 210
    const M   = 12
    const R   = PW - M       // 198
    const CW  = R - M        // 186 (content width)
    const MID = M + CW / 2   // 105 (center)

    // two equal columns with 6mm gap
    const COLA  = 90          // left column width
    const GAP   = 6
    const COL2X = M + COLA + GAP   // 108  (right column x-start)
    const COLB  = R - COL2X        // 90   (right column width)

    // ─── WATERMARK ───────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(230, 237, 252)
    doc.setFontSize(68)
    doc.text('SIMULADO', MID, 155, { align: 'center', angle: 40 })
    doc.setFontSize(42)
    doc.text('EDUCATIVO', MID - 8, 215, { align: 'center', angle: 40 })

    // ─── HEADER: BLUE BAR ────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235)
    doc.rect(M, 10, CW, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('RECIBO DE HABERES', MID, 15.5, { align: 'center' })
    doc.setFontSize(6.5)
    doc.text('ORIGINAL', R - 2, 15.5, { align: 'right' })
    doc.text('SUELDOS 360 - SIMULADOR EDUCATIVO', M + 2, 15.5)

    // ─── HEADER: COMPANY INFO ────────────────────────────────────────────────
    doc.setFillColor(249, 250, 251)
    doc.rect(M, 18, CW, 28, 'F')
    // outer border (drawn last so it sits on top)
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.4)
    doc.rect(M, 10, CW, 36)

    // logo badge
    doc.setFillColor(29, 78, 216)
    doc.roundedRect(M + 2, 20, 22, 15, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('$', M + 6.5, 26.5)
    doc.setFontSize(11)
    doc.text('360', M + 4.5, 33)

    // company name + details
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(String(company.razon_social ?? ''), M + 28, 25)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text('CUIT: ' + String(company.cuit ?? '—'), M + 28, 30.5)
    const domLine = [company.domicilio_fiscal, company.localidad, company.provincia]
      .filter(Boolean).join(' · ')
    doc.text('Domicilio: ' + (domLine || '—'), M + 28, 35.5)
    doc.text('Actividad: ' + String(company.actividad_principal ?? '—'), M + 28, 40.5)

    // right side: period info
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Periodo: ' + formatPeriodo(periodo), R - 2, 25, { align: 'right' })
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text('Emision: ' + new Date().toLocaleDateString('es-AR'), R - 2, 30.5, { align: 'right' })
    doc.text('OS: ' + String(company.obra_social_principal ?? 'OSECAC'), R - 2, 35.5, { align: 'right' })
    doc.text('ART: ' + String(company.art_simulada ?? 'Provincia ART'), R - 2, 40.5, { align: 'right' })

    // ─── EMPLOYEE BLOCK ──────────────────────────────────────────────────────
    const eY = 50
    doc.setFillColor(219, 234, 254)
    doc.rect(M, eY, CW, 22, 'F')
    doc.setDrawColor(37, 99, 235)
    doc.rect(M, eY, CW, 22)

    const lbl = (t: string, x: number, y: number) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(29, 78, 216); doc.text(t, x, y)
    }
    const val = (t: string, x: number, y: number) => {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(15, 23, 42); doc.text(t, x, y)
    }

    lbl('APELLIDO Y NOMBRE:', M + 2, eY + 6)
    val(empNombre.toUpperCase(), M + 41, eY + 6)
    lbl('CUIL:', MID + 8, eY + 6)
    val(empCuil || '—', MID + 18, eY + 6)

    lbl('CATEGORIA:', M + 2, eY + 13)
    val(empCategoria || '—', M + 21, eY + 13)
    lbl('INGRESO:', MID - 30, eY + 13)
    const fi = empFechaIngreso
      ? new Date(empFechaIngreso + 'T00:00:00').toLocaleDateString('es-AR')
      : '—'
    val(fi, MID - 14, eY + 13)
    lbl('PERIODO:', MID + 8, eY + 13)
    val(formatPeriodo(periodo), MID + 22, eY + 13)

    lbl('OBRA SOCIAL:', M + 2, eY + 20)
    val(empObraSocial || String(company.obra_social_principal ?? 'OSECAC'), M + 23, eY + 20)

    // ─── CONCEPTOS TABLE ─────────────────────────────────────────────────────
    const tY = 76
    const haberes = items
      .filter(i => String(i.concept_tipo) !== 'descuento' && String(i.concept_tipo) !== 'contribucion_patronal')
      .sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))
    const descuentos = items
      .filter(i => String(i.concept_tipo) === 'descuento')
      .sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))

    // column headers
    doc.setFillColor(37, 99, 235)
    doc.rect(M, tY, COLA, 7, 'F')
    doc.rect(COL2X, tY, COLB, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    doc.text('HABERES Y ADICIONALES', M + 2, tY + 4.8)
    doc.text('IMPORTE', M + COLA - 2, tY + 4.8, { align: 'right' })
    doc.text('DEDUCCIONES', COL2X + 2, tY + 4.8)
    doc.text('IMPORTE', R - 2, tY + 4.8, { align: 'right' })

    const rowH  = 6
    const bodyY = tY + 7
    const minR  = 8
    const nRows = Math.max(haberes.length + 1, descuentos.length + 1, minR)

    for (let i = 0; i < nRows; i++) {
      const even = i % 2 === 0
      doc.setFillColor(even ? 248 : 255, even ? 250 : 255, even ? 252 : 255)
      doc.rect(M, bodyY + i * rowH, COLA, rowH, 'F')
      doc.setFillColor(even ? 255 : 255, even ? 248 : 255, even ? 248 : 255)
      doc.rect(COL2X, bodyY + i * rowH, COLB, rowH, 'F')

      if (haberes[i]) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(15, 23, 42)
        doc.text(String(haberes[i].concept_nombre ?? ''), M + 2, bodyY + i * rowH + 4)
        doc.setTextColor(22, 163, 74)
        doc.text(formatCurrency(Number(haberes[i].importe ?? 0)), M + COLA - 2, bodyY + i * rowH + 4, { align: 'right' })
      }
      if (descuentos[i]) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(15, 23, 42)
        doc.text(String(descuentos[i].concept_nombre ?? ''), COL2X + 2, bodyY + i * rowH + 4)
        doc.setTextColor(220, 38, 38)
        doc.text('- ' + formatCurrency(Number(descuentos[i].importe ?? 0)), R - 2, bodyY + i * rowH + 4, { align: 'right' })
      }
    }

    // total row
    const totY = bodyY + nRows * rowH
    doc.setFillColor(219, 234, 254)
    doc.rect(M, totY, COLA, 8, 'F')
    doc.rect(COL2X, totY, COLB, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(15, 23, 42)
    doc.text('TOTAL DEVENGADO:', M + 2, totY + 5)
    doc.setTextColor(22, 163, 74)
    doc.text(formatCurrency(Number(result.sueldo_bruto ?? 0)), M + COLA - 2, totY + 5, { align: 'right' })
    doc.setTextColor(15, 23, 42)
    doc.text('TOTAL DEDUCCIONES:', COL2X + 2, totY + 5)
    doc.setTextColor(220, 38, 38)
    doc.text('- ' + formatCurrency(Number(result.total_descuentos ?? 0)), R - 2, totY + 5, { align: 'right' })

    // table borders
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.4)
    doc.rect(M, tY, COLA, 7 + nRows * rowH + 8)
    doc.rect(COL2X, tY, COLB, 7 + nRows * rowH + 8)

    // ─── NETO BOX ────────────────────────────────────────────────────────────
    const netoY = totY + 12
    doc.setFillColor(37, 99, 235)
    doc.roundedRect(M, netoY, CW, 13, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('NETO A COBRAR:', M + 4, netoY + 8.5)
    doc.setFontSize(14)
    doc.text(formatCurrency(Number(result.sueldo_neto ?? 0)), R - 4, netoY + 8.5, { align: 'right' })

    // ─── SELLO DE AGUA / CUÑO EDUCATIVO ──────────────────────────────────────
    const selloY = netoY + 18
    const selloX = MID
    doc.setDrawColor(37, 99, 235)
    doc.setLineWidth(0.9)
    doc.circle(selloX, selloY + 11, 14)
    doc.setLineWidth(0.4)
    doc.circle(selloX, selloY + 11, 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(37, 99, 235)
    doc.text('SUELDOS 360 - SIMULADOR EDUCATIVO', selloX, selloY + 5, { align: 'center' })
    doc.setFontSize(10)
    doc.text('S 360', selloX, selloY + 12, { align: 'center' })
    doc.setFontSize(5.5)
    doc.text('NO VALIDO LEGALMENTE', selloX, selloY + 18, { align: 'center' })

    // ─── FIRMA AREA ──────────────────────────────────────────────────────────
    const firmaY = netoY + 18
    doc.setDrawColor(150, 165, 180)
    doc.setLineWidth(0.3)

    // left signature
    const lFirmaEnd = selloX - 20
    doc.line(M + 4, firmaY + 24, lFirmaEnd, firmaY + 24)
    const lFirmaMid = (M + 4 + lFirmaEnd) / 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(71, 85, 105)
    doc.text('Firma y sello del empleador', lFirmaMid, firmaY + 29, { align: 'center' })
    doc.setFontSize(6.5)
    doc.text(String(company.razon_social ?? ''), lFirmaMid, firmaY + 34, { align: 'center' })

    // right signature
    const rFirmaStart = selloX + 20
    doc.line(rFirmaStart, firmaY + 24, R - 4, firmaY + 24)
    const rFirmaMid = (rFirmaStart + R - 4) / 2
    doc.setFontSize(7.5)
    doc.text('Firma del trabajador', rFirmaMid, firmaY + 29, { align: 'center' })
    doc.setFontSize(6.5)
    doc.text(empNombre.toUpperCase(), rFirmaMid, firmaY + 34, { align: 'center' })

    // ─── DISCLAIMER ──────────────────────────────────────────────────────────
    const discY = firmaY + 42
    doc.setFillColor(255, 251, 235)
    doc.rect(M, discY, CW, 12, 'F')
    doc.setDrawColor(200, 160, 0)
    doc.rect(M, discY, CW, 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(120, 80, 0)
    doc.text('AVISO: DOCUMENTO SIMULADO - USO EXCLUSIVAMENTE EDUCATIVO', MID, discY + 4.5, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.text(
      'Los valores, calculos y datos son de referencia pedagogica. Este recibo no tiene validez legal, impositiva ni laboral.',
      MID, discY + 8.5, { align: 'center' }
    )
    doc.text(
      'No reemplaza documentacion oficial homologada. Sueldos 360 - Simulador educativo de liquidacion de sueldos.',
      MID, discY + 11.5, { align: 'center' }
    )

    const fname = `recibo-${empNombre.replace(/[\s,]/g, '-')}-${periodo}.pdf`
    doc.save(fname)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
    >
      <span>📄</span>
      <span>Exportar PDF</span>
    </button>
  )
}
