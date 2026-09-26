/**
 * Reglas que un recibo de sueldo no puede violar.
 * Si alguna de estas falla, el recibo que ve el alumno está mal.
 */
import { describe, it, expect } from 'vitest'
import {
  calcularLiquidacion, calcularSAC, calcularVacaciones, getDiasVacaciones,
  type EmployeePayrollInput,
} from '@/lib/calculations/payroll'

/** Los porcentajes van como enteros: 11 significa 11%. */
const PARAMS = {
  jubilacion_pct: 11, obra_social_pct: 3, pami_pct: 3, sindical_pct: 2,
  jubilacion_patronal_pct: 16, obra_social_patronal_pct: 6, pami_patronal_pct: 2,
  fne_pct: 1.5, art_pct: 1.5,
  dias_base: 30, horas_mensuales: 200,
  hora_extra_50_factor: 1.5, hora_extra_100_factor: 2,
  valor_hora_extra_base: 'basico' as const,
}

const SIN_NOVEDADES = {
  dias_trabajados: 30, inasistencias_justificadas: 0, inasistencias_injustificadas: 0,
  llegadas_tarde: 0, horas_extra_50: 0, horas_extra_100: 0, feriados_trabajados: 0,
  comisiones: 0, premios: 0, adelantos: 0, licencias_pagas_dias: 0,
  licencias_sin_goce_dias: 0, suspensiones_dias: 0, vacaciones_dias: 0,
  sac_periodo: false, ajuste_manual: 0,
}

function empleado(cambios: Partial<EmployeePayrollInput> = {}): EmployeePayrollInput {
  return {
    sueldo_basico: 1_000_000,
    antiguedad_anios: 0,
    antiguedad_pct: 1,
    presentismo_pct: 0,
    modalidad: 'mensualizado',
    jornada: 'completa',
    novedades: { ...SIN_NOVEDADES, ...(cambios.novedades ?? {}) },
    params: { ...PARAMS, ...(cambios.params ?? {}) },
    additional_non_remunerative: 0,
    ...cambios,
  } as EmployeePayrollInput
}

const r2 = (n: number) => Math.round(n * 100) / 100

describe('identidades que siempre deben cumplirse', () => {
  it('el neto es el bruto menos los descuentos al trabajador', () => {
    const r = calcularLiquidacion(empleado())
    expect(r2(r.sueldo_neto)).toBe(r2(r.sueldo_bruto - r.total_descuentos_trabaj))
  })

  it('el costo laboral es el bruto más las contribuciones patronales', () => {
    const r = calcularLiquidacion(empleado())
    expect(r2(r.costo_laboral_total)).toBe(r2(r.sueldo_bruto + r.total_contribuciones_patronales))
  })

  it('el empleado cobra menos de lo que le cuesta a la empresa', () => {
    const r = calcularLiquidacion(empleado())
    expect(r.sueldo_neto).toBeLessThan(r.costo_laboral_total)
  })

  it('los aportes suman lo que dice el total de aportes', () => {
    const r = calcularLiquidacion(empleado())
    const suma = r.aportes_jubilacion + r.aportes_obra_social + r.aportes_pami + r.aportes_sindical
    expect(r2(suma)).toBe(r2(r.total_aportes_trabajador))
  })
})

describe('cálculos concretos', () => {
  it('la jubilación es el 11% de la base remunerativa', () => {
    const r = calcularLiquidacion(empleado())
    expect(r2(r.aportes_jubilacion)).toBe(r2(r.total_remunerativo * 0.11))
  })

  it('la antigüedad suma 1% por año sobre el básico', () => {
    const sin = calcularLiquidacion(empleado({ antiguedad_anios: 0 }))
    const con = calcularLiquidacion(empleado({ antiguedad_anios: 5, antiguedad_pct: 1 }))
    expect(r2(con.total_remunerativo - sin.total_remunerativo)).toBe(r2(1_000_000 * 0.05))
  })

  it('la hora extra al 50% se paga una vez y media el valor hora', () => {
    const sin = calcularLiquidacion(empleado())
    const con = calcularLiquidacion(empleado({ novedades: { ...SIN_NOVEDADES, horas_extra_50: 8 } }))
    const valorHora = 1_000_000 / 200
    expect(r2(con.sueldo_bruto - sin.sueldo_bruto)).toBe(r2(8 * valorHora * 1.5))
  })

  it('las ausencias injustificadas descuentan', () => {
    const sin = calcularLiquidacion(empleado())
    const con = calcularLiquidacion(empleado({
      novedades: { ...SIN_NOVEDADES, dias_trabajados: 29, inasistencias_injustificadas: 1 },
    }))
    expect(con.sueldo_neto).toBeLessThan(sin.sueldo_neto)
  })
})

describe('SAC y vacaciones', () => {
  it('el aguinaldo es la mitad de la mejor remuneración', () => {
    expect(calcularSAC(1_200_000)).toBe(600_000)
  })

  it('los días de vacaciones siguen la escala por antigüedad', () => {
    expect(getDiasVacaciones(2)).toBe(14)
    expect(getDiasVacaciones(7)).toBe(21)
    expect(getDiasVacaciones(15)).toBe(28)
    expect(getDiasVacaciones(25)).toBe(35)
  })

  it('las vacaciones se pagan sobre el divisor 25', () => {
    expect(r2(calcularVacaciones(1_000_000, 14))).toBe(r2((1_000_000 / 25) * 14))
  })
})
