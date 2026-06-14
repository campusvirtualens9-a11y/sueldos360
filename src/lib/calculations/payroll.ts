// Motor de liquidación educativo — Sueldos 360
// Todos los valores son simulados y editables

export interface PayrollParams {
  // Aportes del trabajador
  jubilacion_pct: number        // 11%
  obra_social_pct: number       // 3%
  pami_pct: number              // 3%
  sindical_pct: number          // variable por convenio

  // Contribuciones patronales
  jubilacion_patronal_pct: number  // 16%
  obra_social_patronal_pct: number // 6%
  pami_patronal_pct: number        // 2%
  fne_pct: number                  // 1.5% Fondo Nacional de Empleo
  art_pct: number                  // variable

  // Parámetros de jornada
  dias_base: number             // 30 (mensual) o 25 (jornalizado)
  horas_mensuales: number       // 200 o 176 (construcción)
  hora_extra_50_factor: number  // 1.5
  hora_extra_100_factor: number // 2.0
  valor_hora_extra_base: string // 'basico' | 'bruto'
}

export interface NovedadInput {
  dias_trabajados: number
  inasistencias_justificadas: number
  inasistencias_injustificadas: number
  llegadas_tarde: number
  horas_extra_50: number
  horas_extra_100: number
  feriados_trabajados: number
  comisiones: number
  premios: number
  adelantos: number
  licencias_pagas_dias: number
  licencias_sin_goce_dias: number
  suspensiones_dias: number
  vacaciones_dias: number
  sac_periodo: boolean
  ajuste_manual: number
}

export interface EmployeePayrollInput {
  sueldo_basico: number
  antiguedad_anios: number
  antiguedad_pct: number         // % por año de convenio (ej: 1% x año / 2% Sanidad)
  presentismo_pct: number
  modalidad: 'mensualizado' | 'jornalizado' | 'quincenal'
  jornada: 'completa' | 'parcial' | 'por_horas'
  novedades: NovedadInput
  params: PayrollParams
  additional_non_remunerative: number  // SNR del convenio
  // Adicionales CCT específicos (opcionales, default 0)
  alimentacion_pct?: number          // Gastronomía UTHGRA: 10% sobre básico
  complemento_servicio_pct?: number  // Gastronomía UTHGRA: 12% sobre básico
  fondo_cese_pct?: number            // Construcción UOCRA: 12% 1er año, 8% desde 2do (patronal)
}

export interface PayrollLineItem {
  codigo: string
  nombre: string
  tipo: 'remunerativo' | 'no_remunerativo' | 'descuento' | 'contribucion_patronal'
  importe: number
  cantidad?: number
  valor_unitario?: number
}

export interface PayrollCalculationResult {
  items: PayrollLineItem[]
  sueldo_basico_proporcional: number
  total_remunerativo: number
  total_no_remunerativo: number
  sueldo_bruto: number
  descuento_inasistencias: number
  total_descuentos_trabaj: number
  aportes_jubilacion: number
  aportes_obra_social: number
  aportes_pami: number
  aportes_sindical: number
  total_aportes_trabajador: number
  sueldo_neto: number
  contrib_jubilacion: number
  contrib_obra_social: number
  contrib_pami: number
  contrib_fne: number
  contrib_art: number
  contrib_fondo_cese: number
  total_contribuciones_patronales: number
  costo_laboral_total: number
}

export function calcularLiquidacion(input: EmployeePayrollInput): PayrollCalculationResult {
  const {
    sueldo_basico, antiguedad_anios, antiguedad_pct, presentismo_pct,
    modalidad, novedades, params, additional_non_remunerative,
    alimentacion_pct = 0, complemento_servicio_pct = 0, fondo_cese_pct = 0,
  } = input

  const items: PayrollLineItem[] = []

  // 1. Sueldo básico proporcional
  // Jornalizado usa divisor 25 (sueldo_basico almacenado = jornal × 25)
  // → jornal diario = sueldo_basico / 25; valor_hora = jornal / 8 = sueldo_basico / 200
  // Mensualizado y quincenal usan dias_base (30)
  const divisor = modalidad === 'jornalizado' ? 25 : params.dias_base
  const dias_base = params.dias_base
  const dias_trab = novedades.dias_trabajados
  const sueldo_basico_prop = (sueldo_basico / divisor) * dias_trab

  // valor_hora para horas extra:
  // jornalizado → jornal/8 = sueldo_basico/(25×8) = sueldo_basico/200
  // mensualizado → sueldo_basico / horas_mensuales (ej: 200 para Comercio, 192 para Camioneros)
  const horas_divisor_extra = modalidad === 'jornalizado' ? 200 : params.horas_mensuales

  items.push({
    codigo: '001', nombre: 'Sueldo básico',
    tipo: 'remunerativo', importe: sueldo_basico_prop,
    cantidad: dias_trab, valor_unitario: sueldo_basico / divisor
  })

  // 2. Adicional antigüedad
  // Sanidad CCT 122/75: 2% por año (art. 10). Comercio, Camioneros: 1% por año.
  let adicional_antiguedad = 0
  if (antiguedad_anios > 0 && antiguedad_pct > 0) {
    adicional_antiguedad = sueldo_basico_prop * (antiguedad_pct / 100) * antiguedad_anios
    items.push({
      codigo: '002', nombre: `Antigüedad (${antiguedad_anios} año/s × ${antiguedad_pct}%)`,
      tipo: 'remunerativo', importe: adicional_antiguedad
    })
  }

  // 3. Presentismo / Asistencia perfecta
  // Comercio art. 40: 8.33% | Gastronomía: 10% | Construcción: 20% | Camioneros: 5%
  let adicional_presentismo = 0
  if (presentismo_pct > 0 && novedades.inasistencias_injustificadas === 0 && novedades.llegadas_tarde === 0) {
    adicional_presentismo = sueldo_basico_prop * (presentismo_pct / 100)
    items.push({
      codigo: '003', nombre: `Presentismo (${presentismo_pct}%)`,
      tipo: 'remunerativo', importe: adicional_presentismo
    })
  }

  // 4. Alimentación — Gastronomía UTHGRA (art. CCT 389/04)
  let adicional_alimentacion = 0
  if (alimentacion_pct > 0) {
    adicional_alimentacion = sueldo_basico_prop * (alimentacion_pct / 100)
    items.push({
      codigo: '004', nombre: `Alimentación (${alimentacion_pct}%)`,
      tipo: 'remunerativo', importe: adicional_alimentacion
    })
  }

  // 5. Complemento de servicio — Gastronomía UTHGRA (art. CCT 389/04)
  let adicional_complemento = 0
  if (complemento_servicio_pct > 0) {
    adicional_complemento = sueldo_basico_prop * (complemento_servicio_pct / 100)
    items.push({
      codigo: '005', nombre: `Complemento de servicio (${complemento_servicio_pct}%)`,
      tipo: 'remunerativo', importe: adicional_complemento
    })
  }

  // 6. Horas extra al 50%
  // Valor hora: jornalizado = sueldo/200 (jornal/8); mensualizado = sueldo/horas_mensuales
  let horas_extra_50_importe = 0
  if (novedades.horas_extra_50 > 0) {
    const valor_hora = sueldo_basico / horas_divisor_extra
    horas_extra_50_importe = novedades.horas_extra_50 * valor_hora * params.hora_extra_50_factor
    items.push({
      codigo: '006', nombre: 'Horas extra 50%',
      tipo: 'remunerativo', importe: horas_extra_50_importe,
      cantidad: novedades.horas_extra_50, valor_unitario: valor_hora * params.hora_extra_50_factor
    })
  }

  // 7. Horas extra al 100%
  let horas_extra_100_importe = 0
  if (novedades.horas_extra_100 > 0) {
    const valor_hora = sueldo_basico / horas_divisor_extra
    horas_extra_100_importe = novedades.horas_extra_100 * valor_hora * params.hora_extra_100_factor
    items.push({
      codigo: '007', nombre: 'Horas extra 100%',
      tipo: 'remunerativo', importe: horas_extra_100_importe,
      cantidad: novedades.horas_extra_100, valor_unitario: valor_hora * params.hora_extra_100_factor
    })
  }

  // 8. Feriados trabajados
  // Valor día: jornalizado usa divisor 25 (jornal diario); mensualizado usa dias_base (30)
  let feriados_importe = 0
  if (novedades.feriados_trabajados > 0) {
    const valor_dia = sueldo_basico / divisor
    feriados_importe = novedades.feriados_trabajados * valor_dia * 2
    items.push({
      codigo: '008', nombre: 'Feriados trabajados (doble)',
      tipo: 'remunerativo', importe: feriados_importe,
      cantidad: novedades.feriados_trabajados
    })
  }

  // 9. Comisiones
  if (novedades.comisiones > 0) {
    items.push({
      codigo: '009', nombre: 'Comisiones',
      tipo: 'remunerativo', importe: novedades.comisiones
    })
  }

  // 10. Premios
  if (novedades.premios > 0) {
    items.push({
      codigo: '010', nombre: 'Premios',
      tipo: 'remunerativo', importe: novedades.premios
    })
  }

  // 11. Ajuste manual
  if (novedades.ajuste_manual !== 0) {
    items.push({
      codigo: '011', nombre: 'Ajuste manual',
      tipo: novedades.ajuste_manual > 0 ? 'remunerativo' : 'descuento',
      importe: Math.abs(novedades.ajuste_manual)
    })
  }

  // 12. Suma no remunerativa del convenio
  if (additional_non_remunerative > 0) {
    items.push({
      codigo: '012', nombre: 'Suma no remunerativa (convenio)',
      tipo: 'no_remunerativo', importe: additional_non_remunerative
    })
  }

  // Calcular totales parciales
  const total_remunerativo = items
    .filter(i => i.tipo === 'remunerativo')
    .reduce((acc, i) => acc + i.importe, 0)

  const total_no_remunerativo = items
    .filter(i => i.tipo === 'no_remunerativo')
    .reduce((acc, i) => acc + i.importe, 0)

  // Descuento por inasistencias injustificadas
  // Jornalizado usa divisor 25 (jornal diario); mensualizado usa dias_base (30)
  let descuento_inasistencias = 0
  if (novedades.inasistencias_injustificadas > 0) {
    const valor_dia = sueldo_basico / divisor
    descuento_inasistencias = novedades.inasistencias_injustificadas * valor_dia
    items.push({
      codigo: 'D01', nombre: 'Descuento inasistencias injustificadas',
      tipo: 'descuento', importe: descuento_inasistencias,
      cantidad: novedades.inasistencias_injustificadas, valor_unitario: valor_dia
    })
  }

  // Adelantos
  if (novedades.adelantos > 0) {
    items.push({
      codigo: 'D02', nombre: 'Adelanto de sueldo',
      tipo: 'descuento', importe: novedades.adelantos
    })
  }

  const sueldo_bruto = total_remunerativo + total_no_remunerativo - descuento_inasistencias - novedades.adelantos

  // Aportes del trabajador (sobre total remunerativo neto de inasistencias)
  const base_aportes = total_remunerativo - descuento_inasistencias
  const aportes_jubilacion = base_aportes * (params.jubilacion_pct / 100)
  const aportes_obra_social = base_aportes * (params.obra_social_pct / 100)
  const aportes_pami = base_aportes * (params.pami_pct / 100)
  const aportes_sindical = base_aportes * (params.sindical_pct / 100)
  const total_aportes_trabajador = aportes_jubilacion + aportes_obra_social + aportes_pami + aportes_sindical

  items.push({ codigo: 'AP01', nombre: `Jubilación (${params.jubilacion_pct}%)`, tipo: 'descuento', importe: aportes_jubilacion })
  items.push({ codigo: 'AP02', nombre: `Obra social (${params.obra_social_pct}%)`, tipo: 'descuento', importe: aportes_obra_social })
  items.push({ codigo: 'AP03', nombre: `PAMI/INSSJP (${params.pami_pct}%)`, tipo: 'descuento', importe: aportes_pami })
  if (aportes_sindical > 0) {
    items.push({ codigo: 'AP04', nombre: `Sindicato (${params.sindical_pct}%)`, tipo: 'descuento', importe: aportes_sindical })
  }

  const total_descuentos_trabaj = descuento_inasistencias + novedades.adelantos + total_aportes_trabajador
  const sueldo_neto = sueldo_bruto - total_aportes_trabajador

  // Contribuciones patronales (costo del empleador, no descuentan al trabajador)
  const contrib_jubilacion = base_aportes * (params.jubilacion_patronal_pct / 100)
  const contrib_obra_social = base_aportes * (params.obra_social_patronal_pct / 100)
  const contrib_pami = base_aportes * (params.pami_patronal_pct / 100)
  const contrib_fne = base_aportes * (params.fne_pct / 100)
  const contrib_art = sueldo_bruto * (params.art_pct / 100)
  // Fondo de Cese Laboral — Construcción CCT 76/75 (12% 1er año, 8% desde 2do)
  const contrib_fondo_cese = fondo_cese_pct > 0 ? base_aportes * (fondo_cese_pct / 100) : 0

  const total_contribuciones_patronales =
    contrib_jubilacion + contrib_obra_social + contrib_pami + contrib_fne + contrib_art + contrib_fondo_cese

  if (contrib_fondo_cese > 0) {
    items.push({
      codigo: 'CP06', nombre: `Fondo de Cese Laboral (${fondo_cese_pct}%)`,
      tipo: 'contribucion_patronal', importe: contrib_fondo_cese
    })
  }

  const costo_laboral_total = sueldo_bruto + total_contribuciones_patronales

  return {
    items,
    sueldo_basico_proporcional: sueldo_basico_prop,
    total_remunerativo,
    total_no_remunerativo,
    sueldo_bruto,
    descuento_inasistencias,
    total_descuentos_trabaj,
    aportes_jubilacion,
    aportes_obra_social,
    aportes_pami,
    aportes_sindical,
    total_aportes_trabajador,
    sueldo_neto,
    contrib_jubilacion,
    contrib_obra_social,
    contrib_pami,
    contrib_fne,
    contrib_art,
    contrib_fondo_cese,
    total_contribuciones_patronales,
    costo_laboral_total,
  }
}

export function calcularSAC(mejorRemuneracion: number): number {
  return mejorRemuneracion / 2
}

export function calcularVacaciones(sueldoBasico: number, diasVacaciones: number): number {
  return (sueldoBasico / 25) * diasVacaciones
}

export function getDiasVacaciones(antiguedadAnios: number): number {
  if (antiguedadAnios < 5) return 14
  if (antiguedadAnios < 10) return 21
  if (antiguedadAnios < 20) return 28
  return 35
}
