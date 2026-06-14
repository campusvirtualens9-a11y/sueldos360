import type { SupabaseClient } from '@supabase/supabase-js'

export const ACHIEVEMENT_DEFS = {
  PRIMERA_EMPRESA:     { nombre: 'Primera empresa',      descripcion: 'Registraste tu primera empresa en el sistema',        icono: '🏢' },
  PRIMER_EMPLEADO:     { nombre: 'Primer empleado',      descripcion: 'Diste de alta tu primer legajo',                       icono: '👤' },
  PRIMERA_LIQUIDACION: { nombre: 'Primera liquidación',  descripcion: 'Generaste tu primera liquidación de sueldos',          icono: '💰' },
  MULTICONVENIO:       { nombre: 'Multiconvenio',        descripcion: 'Liquidaste empleados de 3 CCT distintos',              icono: '🌐' },
  RECIBO_EMITIDO:      { nombre: 'Recibo emitido',       descripcion: 'Emitiste tu primer recibo de sueldo',                  icono: '🧾' },
  LIBRO_GENERADO:      { nombre: 'Libro de sueldos',     descripcion: 'Exportaste el libro de sueldos del período',           icono: '📚' },
  F931_GENERADO:       { nombre: 'F.931 preparado',      descripcion: 'Preparaste el formulario F.931 para AFIP',             icono: '📊' },
  PRIMER_EXPORT:       { nombre: 'Primer export',        descripcion: 'Exportaste el libro de trabajo a Excel',               icono: '📤' },
  REPORTE_REVISADO:    { nombre: 'Reportes revisados',   descripcion: 'Analizaste los reportes del período',                  icono: '📈' },
  CIRCUITO_COMPLETO:   { nombre: '¡Circuito completo!',  descripcion: 'Completaste los 10 pasos del circuito de liquidación', icono: '🏆' },
  EXAMEN_APROBADO:     { nombre: 'Experto en liquidación', descripcion: 'Aprobaste el examen final de conocimientos sobre liquidación de sueldos', icono: '🎓' },
} as const

export type AchievementCode = keyof typeof ACHIEVEMENT_DEFS

export async function unlockAchievement(
  supabase: SupabaseClient,
  userId: string,
  companyId: string | null,
  codigo: AchievementCode,
) {
  const def = ACHIEVEMENT_DEFS[codigo]
  await supabase.from('achievements').upsert(
    {
      user_id: userId,
      company_id: companyId,
      codigo,
      nombre: def.nombre,
      descripcion: def.descripcion,
      icono: def.icono,
    },
    { onConflict: 'user_id,codigo', ignoreDuplicates: true },
  )
}
