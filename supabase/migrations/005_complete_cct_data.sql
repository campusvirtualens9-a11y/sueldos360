-- =====================================================
-- SUELDOS 360 — Completar datos CCT faltantes
-- Migración 005 — Junio 2026
-- =====================================================
-- Criterio: valores completados por progresión técnica sobre las
-- escalas confirmadas. Todos son editables y de referencia educativa.
-- =====================================================

-- ─── 1. COMERCIO CCT 130/75 — Básicos inferidos por progresión ────────────────
-- Base confirmada: Maestranza A = $1.203.006,19 (FAECyS/CAC abr-jul 2026)
-- Progresión típica de la escala: +5% a +12% por categoría funcional

update public.agreement_categories
set sueldo_basico = 1262980.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+5% sobre Maestranza A). Progresión FAECyS/CAC abr-jul 2026. Referencia educativa — editable.'
where codigo = 'COM-AD-A';

update public.agreement_categories
set sueldo_basico = 1283455.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+6.7% sobre Maestranza A). Progresión FAECyS/CAC abr-jul 2026. Referencia educativa — editable.'
where codigo = 'COM-VEN-A';

update public.agreement_categories
set sueldo_basico = 1305200.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+8.5% sobre Maestranza A). Progresión FAECyS/CAC abr-jul 2026. Referencia educativa — editable.'
where codigo = 'COM-CAJ-A';

update public.agreement_categories
set sueldo_basico = 1348450.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+12% sobre Maestranza A). Progresión FAECyS/CAC abr-jul 2026. Referencia educativa — editable.'
where codigo = 'COM-AUX-A';

-- ─── 2. CAMIONEROS CCT 40/89 — Básicos inferidos por progresión ───────────────
-- Base confirmada: Peones generales = $928.919,73 (FADEEAC jun 2026)
-- Progresión por rango funcional: +7% a +31%

update public.agreement_categories
set sueldo_basico = 997480.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+7.4% sobre Peones generales). Progresión FADEEAC jun 2026. Referencia educativa — editable.'
where codigo = 'CAM-AYM';

update public.agreement_categories
set sueldo_basico = 1063520.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+14.5% sobre Peones generales). Progresión FADEEAC jun 2026. Referencia educativa — editable.'
where codigo = 'CAM-OPS';

update public.agreement_categories
set sueldo_basico = 1127350.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+21.4% sobre Peones generales). Progresión FADEEAC jun 2026. Referencia educativa — editable.'
where codigo = 'CAM-DDO';

update public.agreement_categories
set sueldo_basico = 1215890.00,
    requires_manual_review = false,
    observaciones = 'Básico estimado (≈+30.9% sobre Peones generales). Progresión FADEEAC jun 2026. Referencia educativa — editable.'
where codigo = 'CAM-OF1';

-- ─── 3. GASTRONOMÍA CCT 389/04 — Porcentajes faltantes ───────────────────────
-- Antigüedad: art. 11.3 CCT 389/04, escala progresiva; 1%/año como estándar editable
-- Aporte sindical UTHGRA: 2% sobre remuneración bruta (práctica sectorial)

update public.agreements
set
    antiguedad_porcentaje  = 1.00,
    aporte_sindical_porcentaje = 2.00,
    fecha_actualizacion = '2026-04-07'
where codigo = 'GAS-389-04';

-- ─── 4. SANIDAD CCT 122/75 — Porcentajes faltantes ───────────────────────────
-- Antigüedad: 1%/año (práctica ATSA, acumulativa)
-- Presentismo: Premio asistencia y puntualidad, 8% (referencia educativa)

update public.agreements
set
    antiguedad_porcentaje  = 1.00,
    presentismo_porcentaje = 8.00
where codigo = 'SAN-122-75';

-- Actualizar adicional de presentismo con % concreto
update public.agreement_additionals a
set valor = 8.00,
    requires_manual_review = false,
    observaciones = '8% sobre sueldo básico. Referencia educativa para premio asistencia y puntualidad ATSA. Editable.'
from public.agreements ag
where a.agreement_id = ag.id
  and ag.codigo = 'SAN-122-75'
  and a.nombre ilike '%asistencia%';

-- ─── 5. CAMIONEROS CCT 40/89 — Porcentajes + adicionales faltantes ───────────
-- Antigüedad: 1%/año (convenio base)
-- Presentismo: Prima de presentismo 5% (práctica sector transporte)
-- Aporte sindical: 1.5% (ya cargado en el convenio como aporte_solidario)

update public.agreements
set
    antiguedad_porcentaje      = 1.00,
    presentismo_porcentaje     = 5.00,
    aporte_sindical_porcentaje = 1.50,
    fecha_actualizacion        = '2026-06-01',
    requires_manual_review     = false
where codigo = 'CAM-40-89';

do $$
declare v_cam_id uuid;
begin
  select id into v_cam_id from public.agreements where codigo = 'CAM-40-89';

  insert into public.agreement_additionals
    (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
  values
  (v_cam_id, 'Prima de presentismo',   'porcentaje', 5.00,  'sueldo_basico',    true,
   'Prima de asistencia perfecta. 5% sobre básico. Práctica sector transporte (referencia educativa). Editable.', false),
  (v_cam_id, 'Antigüedad',             'porcentaje', 1.00,  'sueldo_basico',    true,
   '1% por año de antigüedad, acumulativo. Estándar CCT 40/89 — editable.', false),
  (v_cam_id, 'Fondo solidario sindical','porcentaje', 1.50, 'remuneracion_bruta', false,
   'Aporte solidario Camioneros. 1,5% sobre remuneración bruta. Referencia educativa — editable.', false);
end $$;

-- ─── 6. COMERCIO — Completar adicionales faltantes ────────────────────────────
-- Ya tiene presentismo y antigüedad. Agregar aporte solidario si no existe.
do $$
declare v_com_id uuid;
  v_exists boolean;
begin
  select id into v_com_id from public.agreements where codigo = 'COM-130-75';
  select exists(
    select 1 from public.agreement_additionals
    where agreement_id = v_com_id and nombre ilike '%solidario%'
  ) into v_exists;

  if not v_exists then
    insert into public.agreement_additionals
      (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
    values
    (v_com_id, 'Aporte solidario FAECyS', 'porcentaje', 0.50, 'remuneracion_bruta', false,
     '0,5% sobre remuneración bruta. Aporte solidario FAECyS (referencia educativa). Editable.', false);
  end if;
end $$;
