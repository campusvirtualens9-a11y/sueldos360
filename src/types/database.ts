export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PayrollRunType = 'mensual' | 'quincenal' | 'jornal' | 'sac' | 'vacaciones' | 'liquidacion_final' | 'ajuste'
export type PayrollRunStatus = 'borrador' | 'calculada' | 'observada' | 'cerrada' | 'rectificada'
export type F931Status = 'borrador' | 'presentado' | 'rectificativo' | 'pagado'
export type EmployeeStatus = 'activo' | 'baja' | 'suspendido'
export type NoveltyCopyStatus = 'sin_novedades' | 'con_novedades' | 'pendiente'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  cuit: string
  razon_social: string
  nombre_fantasia: string | null
  actividad_principal: string | null
  condicion_mipyme: boolean
  domicilio_fiscal: string | null
  localidad: string | null
  provincia: string
  telefono: string | null
  email: string | null
  art_simulada: string | null
  obra_social_principal: string | null
  fecha_inicio_actividad: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  company_id: string
  cuil: string
  dni: string
  apellido: string
  nombre: string
  fecha_nacimiento: string | null
  domicilio: string | null
  telefono: string | null
  email: string | null
  estado_civil: string | null
  cargas_de_familia: number
  fecha_ingreso: string
  fecha_baja: string | null
  puesto: string | null
  categoria: string | null
  agreement_id: string | null
  agreement_category_id: string | null
  jornada: 'completa' | 'parcial' | 'por_horas'
  modalidad: 'mensualizado' | 'jornalizado' | 'quincenal'
  sueldo_basico: number
  banco_pago: string | null
  obra_social: string | null
  sindicato: string | null
  status: EmployeeStatus
  created_at: string
  updated_at: string
}

export interface EmployeeFile {
  id: string
  employee_id: string
  dni_copia: boolean
  cuil_constancia: boolean
  alta_temprana: boolean
  contrato_designacion: boolean
  constancia_domicilio: boolean
  ficha_datos_personales: boolean
  notas: string | null
  created_at: string
  updated_at: string
}

export interface Agreement {
  id: string
  codigo: string
  nombre: string
  numero_cct: string
  rubro: string
  actividad: string | null
  jornada_estandar_horas: number
  tipo_liquidacion: 'mensual' | 'jornal' | 'hora' | 'quincenal'
  antiguedad_porcentaje: number | null
  presentismo_porcentaje: number | null
  aporte_sindical_porcentaje: number | null
  aporte_solidario_porcentaje: number | null
  region_aplica: string
  fecha_actualizacion: string | null
  observaciones_educativas: string | null
  requires_manual_review: boolean
  is_global: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AgreementCategory {
  id: string
  agreement_id: string
  codigo: string
  nombre: string
  sueldo_basico: number | null
  horas_referencia: number | null
  valor_hora: number | null
  zona: string | null
  subescala: string | null
  clase_establecimiento: string | null
  observaciones: string | null
  requires_manual_review: boolean
  educational_note: string | null
  created_at: string
}

export interface AgreementScale {
  id: string
  agreement_id: string
  category_id: string
  vigencia_desde: string
  vigencia_hasta: string | null
  sueldo_basico: number | null
  valor_hora: number | null
  zona: string | null
  fuente_url: string | null
  requires_manual_review: boolean
  notas: string | null
  created_at: string
}

export interface AgreementAdditional {
  id: string
  agreement_id: string
  nombre: string
  tipo: 'porcentaje' | 'fijo' | 'formula'
  valor: number | null
  formula: string | null
  base_calculo: string | null
  is_remunerativo: boolean
  observaciones: string | null
  requires_manual_review: boolean
  created_at: string
}

export interface AgreementNonRemunerative {
  id: string
  agreement_id: string
  category_id: string | null
  concepto: string
  monto: number | null
  vigencia_desde: string | null
  vigencia_hasta: string | null
  zona: string | null
  requires_manual_review: boolean
  notas: string | null
  created_at: string
}

export interface AgreementSource {
  id: string
  agreement_id: string
  tipo: string
  nombre: string
  url: string | null
  fecha_consulta: string | null
  observaciones: string | null
  created_at: string
}

export interface LegalParameter {
  id: string
  company_id: string
  nombre: string
  codigo: string
  valor: number
  descripcion: string | null
  categoria: string
  editable: boolean
  fuente: string | null
  requires_manual_review: boolean
  updated_at: string
}

export interface PayrollConcept {
  id: string
  company_id: string | null
  codigo: string
  nombre: string
  tipo: 'remunerativo' | 'no_remunerativo' | 'descuento' | 'contribucion_patronal'
  impacta_bruto: boolean
  impacta_aportes: boolean
  impacta_contribuciones: boolean
  impacta_neto: boolean
  impacta_f931: boolean
  editable: boolean
  is_global: boolean
  orden: number
  created_at: string
}

export interface MonthlyNovelty {
  id: string
  company_id: string
  employee_id: string
  periodo: string
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
  observaciones: string | null
  status: NoveltyCopyStatus
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface PayrollRun {
  id: string
  company_id: string
  periodo: string
  tipo: PayrollRunType
  status: PayrollRunStatus
  total_bruto: number
  total_descuentos: number
  total_neto: number
  total_aportes_trabajador: number
  total_contribuciones_patronales: number
  total_costo_laboral: number
  fecha_pago: string | null
  observaciones: string | null
  closed_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface PayrollResult {
  id: string
  payroll_run_id: string
  employee_id: string
  agreement_id: string | null
  category_id: string | null
  dias_trabajados: number
  sueldo_basico: number
  total_remunerativo: number
  total_no_remunerativo: number
  total_descuentos: number
  sueldo_bruto: number
  sueldo_neto: number
  total_aportes: number
  total_contribuciones: number
  costo_laboral: number
  observaciones: string | null
  created_at: string
}

export interface PayrollResultItem {
  id: string
  payroll_result_id: string
  concept_id: string | null
  concept_codigo: string
  concept_nombre: string
  concept_tipo: string
  cantidad: number | null
  valor_unitario: number | null
  importe: number
  is_remunerativo: boolean
  orden: number
  created_at: string
}

export interface Payslip {
  id: string
  payroll_result_id: string
  company_id: string
  employee_id: string
  periodo: string
  fecha_pago: string | null
  emitido: boolean
  emitido_at: string | null
  pdf_url: string | null
  created_at: string
}

export interface SalaryBook {
  id: string
  company_id: string
  payroll_run_id: string
  periodo: string
  exportado: boolean
  exportado_at: string | null
  created_at: string
}

export interface F931Report {
  id: string
  company_id: string
  periodo: string
  payroll_run_ids: string[]
  cuit_empresa: string
  razon_social: string
  cantidad_empleados: number
  total_remuneraciones: number
  total_aportes_jubilatorios: number
  total_obra_social: number
  total_pami: number
  total_otros_aportes: number
  total_contribuciones_patronales: number
  art_monto: number
  total_general: number
  status: F931Status
  presentado_at: string | null
  pagado_at: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  company_id: string | null
  codigo: string
  nombre: string
  descripcion: string
  icono: string
  unlocked_at: string
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string | null
  old_data: Json | null
  new_data: Json | null
  created_at: string
}

// Tipos para la UI
export interface DashboardStats {
  company: Company
  activeEmployees: number
  totalBruto: number
  totalAportes: number
  totalContribuciones: number
  costoLaboral: number
  circuitProgress: number
  alerts: DashboardAlert[]
  lastPayrolls: PayrollRun[]
}

export interface DashboardAlert {
  type: 'warning' | 'error' | 'info'
  message: string
  action?: string
  href?: string
}

export interface CircuitStep {
  id: number
  label: string
  completed: boolean
  href: string
}
