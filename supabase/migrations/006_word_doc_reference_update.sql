-- =====================================================
-- SUELDOS 360 — Actualización con datos de referencia Word/Excel
-- Migración 006 — 2026-06-13
-- =====================================================
-- Fuentes documentadas:
--   Word: "Sueldos básicos vigentes de cinco CCT clave en Argentina.docx"
--   Excel: "base_referencia_sueldos_cct.xlsx"
-- Criterio: solo se actualizan datos respaldados en los documentos.
--   Valores marcados con requires_manual_review=true donde hay incertidumbre.
-- =====================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. COMERCIO CCT 130/75 — Valores VERIFICADOS junio 2026
-- Fuente: FAECYS Circular escalas salariales abril-julio 2026 (2026-04-07)
-- Estado: Verificado ✓
-- ─────────────────────────────────────────────────────────────────────────────

update public.agreement_categories
set
  sueldo_basico         = 1113585.00,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026 (2026-04-07). Valor hora ref: $5.567,93 (sueldo/200).'
where codigo = 'COM-MA-A';

update public.agreement_categories
set
  sueldo_basico         = 1125631.00,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.628,16.'
where codigo = 'COM-AD-A';

update public.agreement_categories
set
  sueldo_basico         = 1129646.00,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.648,23.'
where codigo = 'COM-VEN-A';

update public.agreement_categories
set
  sueldo_basico         = 1129646.00,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.648,23.'
where codigo = 'COM-CAJ-A';

update public.agreement_categories
set
  sueldo_basico         = 1139287.00,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.696,44.'
where codigo = 'COM-AUX-A';

-- Agregar Maestranza B y C que aparecen en el Word doc (si no existen)
do $$
declare v_com_id uuid;
begin
  select id into v_com_id from public.agreements where codigo = 'COM-130-75';

  insert into public.agreement_categories
    (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, zona, observaciones, requires_manual_review)
  values
  (v_com_id, 'COM-MA-B', 'Maestranza B', 1116794.00, 200, null,
   'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.583,97.', false),
  (v_com_id, 'COM-MA-C', 'Maestranza C', 1128038.00, 200, null,
   'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.640,19.', false),
  (v_com_id, 'COM-AD-B', 'Administrativos B', 1130454.00, 200, null,
   'Básico junio 2026 verificado. Fuente: FAECYS circular abril-julio 2026. Valor hora ref: $5.652,27.', false)
  on conflict (agreement_id, codigo) do update
    set sueldo_basico = excluded.sueldo_basico,
        requires_manual_review = false,
        observaciones = excluded.observaciones;
end $$;

update public.agreements
set fecha_actualizacion = '2026-06-01',
    observaciones_educativas = 'Escala verificada junio 2026. Fuente: FAECYS circular abril-julio 2026. '
      'Presentismo art. 40: 8,33% (1/12 de remuneraciones computables). Antigüedad: 1% por año sobre básico. '
      'Valores de referencia educativa — actualizar con nueva escala cuando corresponda.'
where codigo = 'COM-130-75';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CONSTRUCCIÓN CCT 76/75 — Valores mayo 2026 (requiere revisión)
-- Fuente: Acuerdo UOCRA/CAMARCO/FAEC publicado 2026-04-30 (vigente mayo 2026)
-- Estado: Revisión manual — no se localizó escala oficial junio 2026
-- Fórmula correcta: jornal/8 = valor_hora; jornal × 25 = mensual_referencia
-- CORRECCIÓN IMPORTANTE: el seed anterior usaba jornal como valor_hora (error × 8)
-- ─────────────────────────────────────────────────────────────────────────────

update public.agreement_categories
set
  sueldo_basico         = 111300.00,      -- jornal $4.452 × 25 días
  valor_hora            = 556.50,         -- jornal $4.452 / 8 hs
  requires_manual_review = true,
  observaciones         = 'Jornal oficial Zona A mayo 2026: $4.452/día. '
    'Mensual ref = jornal × 25 = $111.300. Valor hora = jornal / 8 = $556,50. '
    'Fuente: acuerdo UOCRA/CAMARCO 2026-04-30. Requiere revisión: escala junio 2026 no localizada. '
    'CORRECCIÓN: seed anterior usaba jornal diario como valor/hora (error × 8).'
where codigo = 'CON-AYU-A';

update public.agreement_categories
set
  sueldo_basico         = 120925.00,      -- jornal $4.837 × 25 días
  valor_hora            = 604.63,         -- jornal $4.837 / 8 hs
  requires_manual_review = true,
  observaciones         = 'Jornal oficial Zona A mayo 2026: $4.837/día. '
    'Mensual ref = $120.925. Valor hora = $604,63. '
    'Fuente: acuerdo UOCRA/CAMARCO 2026-04-30. Requiere revisión: escala junio 2026 no localizada.'
where codigo = 'CON-MED-A';

update public.agreement_categories
set
  sueldo_basico         = 130875.00,      -- jornal $5.235 × 25 días
  valor_hora            = 654.38,         -- jornal $5.235 / 8 hs
  requires_manual_review = true,
  observaciones         = 'Jornal oficial Zona A mayo 2026: $5.235/día. '
    'Mensual ref = $130.875. Valor hora = $654,38. '
    'Fuente: acuerdo UOCRA/CAMARCO 2026-04-30. Requiere revisión: escala junio 2026 no localizada.'
where codigo = 'CON-OFI-A';

update public.agreement_categories
set
  sueldo_basico         = 152975.00,      -- jornal $6.119 × 25 días
  valor_hora            = 764.88,         -- jornal $6.119 / 8 hs
  requires_manual_review = true,
  observaciones         = 'Jornal oficial Zona A mayo 2026: $6.119/día. '
    'Mensual ref = $152.975. Valor hora = $764,88. '
    'Fuente: acuerdo UOCRA/CAMARCO 2026-04-30. Requiere revisión: escala junio 2026 no localizada. '
    'CORRECCIÓN: seed anterior tenía $6.666 como valor_hora (debía ser jornal diario / 8 = $764,88).'
where codigo = 'CON-OE-A';

update public.agreement_categories
set
  sueldo_basico         = 808877.00,
  valor_hora            = 4044.39,        -- $808.877 / 200
  requires_manual_review = true,
  observaciones         = 'Básico mensual oficial mayo 2026. '
    'Sereno tiene jornada específica según CCT 76/75. '
    'Fuente: acuerdo UOCRA/CAMARCO 2026-04-30.'
where codigo = 'CON-SER-A';

-- Corregir SNR de Construcción para reflejar montos actualizados
-- (Los SNR del seed estaban referenciados a la escala anterior)
update public.agreement_non_remunerative_items nri
set
  monto = case
    when ac.codigo = 'CON-OE-A'  then 63300.00
    when ac.codigo = 'CON-OFI-A' then 58300.00
    when ac.codigo = 'CON-MED-A' then 53400.00
    when ac.codigo = 'CON-AYU-A' then 50300.00
    when ac.codigo = 'CON-SER-A' then 50300.00
    else nri.monto
  end,
  requires_manual_review = true,
  notas = 'SNR Zona A junio 2026 según acuerdo UOCRA/CAMARCO. Requiere confirmación escala junio 2026.'
from public.agreement_categories ac
join public.agreements ag on ag.id = ac.agreement_id
where nri.category_id = ac.id
  and ag.codigo = 'CON-76-75';

-- Aporte sindical UOCRA: 2.5% (Fuente: Excel parametros_calculo)
update public.agreements
set
  aporte_sindical_porcentaje = 2.50,
  fecha_actualizacion        = '2026-05-27',
  observaciones_educativas   = 'Liquida por jornal/hora y zona salarial (Zona A como referencia estándar). '
    'Fórmula hora: jornal / 8. Mensual referencia: jornal × 25. '
    'Jornada: 176 hs/mes (8h/día × 22 días hábiles). '
    'Aporte sindical UOCRA: 2,5%. Asistencia perfecta: 20%. '
    'Fondo de Cese Laboral: 12% (1° año), 8% (desde 2° año). '
    'ATENCIÓN: escala junio 2026 no localizada — usar mayo 2026 como referencia, marcar revisión.'
where codigo = 'CON-76-75';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. GASTRONOMÍA CCT 389/04 — Completar categorías 6 y 7
-- Fuente: UTHGRA CABA tercer tramo 2025-2026 (2026-04-07). Subescala B.
-- Estado: Revisión manual (escala CABA; verificar para interior/otras regiones)
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare v_gas_id uuid;
begin
  select id into v_gas_id from public.agreements where codigo = 'GAS-389-04';

  insert into public.agreement_categories
    (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, clase_establecimiento, observaciones, requires_manual_review, educational_note)
  values
  (v_gas_id, 'GAS-P6-B', 'Punto 6 — Categoría B', 1384689.00, 200, 'Categoría B (Hotel 3★ / Restaurante B)',
   'Básico junio 2026 Subescala B. Jefes de cocina, maîtres, sommelier, recepcionista principal. '
   'Fuente: UTHGRA CABA tercer tramo 2025-2026 (2026-04-07). Valor hora ref: $6.923,45.',
   true,
   'Verificar para establecimientos fuera de CABA o de otra subescala. Editable.'),
  (v_gas_id, 'GAS-P7-B', 'Punto 7 — Categoría B', 1538297.00, 200, 'Categoría B (Hotel 3★ / Restaurante B)',
   'Básico junio 2026 Subescala B. Categoría máxima — jefes de recepción, chef ejecutivo. '
   'Fuente: UTHGRA CABA tercer tramo 2025-2026 (2026-04-07). Valor hora ref: $7.691,49.',
   true,
   'Verificar para establecimientos fuera de CABA o de otra subescala. Editable.')
  on conflict (agreement_id, codigo) do update
    set sueldo_basico = excluded.sueldo_basico,
        observaciones = excluded.observaciones;
end $$;

-- Aporte sindical UTHGRA: 2.5% (Fuente: Excel parametros_calculo)
update public.agreements
set
  aporte_sindical_porcentaje = 2.50,
  observaciones_educativas   = 'Escala por clase de establecimiento (A, B, Especial) y región. '
    'Categoría B como referencia (hotel 3★ / restaurante B). '
    'Adicionales: presentismo 10%, alimentación 10%, complemento de servicio 12%. '
    'Plus CABA: 15% (requiere revisión según ámbito). Aporte sindical UTHGRA: 2,5%. '
    'Fuente: UTHGRA CABA tercer tramo 2025-2026.'
where codigo = 'GAS-389-04';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SANIDAD CCT 122/75 — Corrección y nuevas categorías abril 2026
-- Fuente: Acuerdo FATSA/ATSA marzo 2026 (2026-03-30), vigencia feb 2026-ene 2027
-- Estado: Revisión manual — pendiente escala posterior a abril 2026
-- CRÍTICO: Antigüedad = 2% por año (art. 10 CCT 122/75), no 1%
-- ─────────────────────────────────────────────────────────────────────────────

-- Corregir antigüedad: art. 10 CCT 122/75 establece 2% anual acumulativo
update public.agreements
set
  antiguedad_porcentaje      = 2.00,
  aporte_sindical_porcentaje = 2.00,
  presentismo_porcentaje     = 8.00,
  fecha_actualizacion        = '2026-04-01',
  observaciones_educativas   = 'Convenio con familias ocupacionales bien definidas. '
    'Antigüedad: 2% por año (acumulativo, art. 10 CCT 122/75 — texto completo vigente 2025). '
    'Presentismo: 8% editable — porcentaje no recuperado en fuente indexada; ajustar según acuerdo. '
    'Aporte sindical: 2% (ATSA/FATSA). '
    'Suma no remunerativa abril 2026: $90.000. '
    'Fuente principal: FATSA/ATSA Acuerdo marzo 2026 (2026-03-30). '
    'ATENCIÓN: pendiente escala posterior a abril 2026 (revisión comprometida mayo 2026).'
where codigo = 'SAN-122-75';

-- Corregir SAN-A1: Word doc dice $1.372.187,59 (el seed tenía $1.327.187,59)
update public.agreement_categories
set
  sueldo_basico         = 1372187.59,
  requires_manual_review = true,
  observaciones         = 'Básico abril 2026 verificado: Profesionales bioquímicos / nutricionistas / farmacéuticos / kinesiólogos. '
    'CORRECCIÓN respecto a seed anterior ($1.327.187,59). '
    'Fuente: FATSA/ATSA Acuerdo marzo 2026. Valor hora ref: $6.860,94. '
    'Requiere actualización cuando se publique escala posterior a abril 2026.'
where codigo = 'SAN-A1';

-- Agregar categorías de Sanidad del Word doc
do $$
declare v_san_id uuid;
begin
  select id into v_san_id from public.agreements where codigo = 'SAN-122-75';

  insert into public.agreement_categories
    (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, observaciones, requires_manual_review, educational_note)
  values
  (v_san_id, 'SAN-ENF-P', 'Enfermero/a de piso o consultorios externos', 1160387.33, 200,
   'Básico abril 2026. Fuente: FATSA/ATSA Acuerdo marzo 2026. Valor hora ref: $5.801,94.',
   true, 'Requiere actualización cuando se publique escala post-abril 2026.'),
  (v_san_id, 'SAN-MUC-P', 'Mucama de piso / consultorios externos / geriátricos', 981730.08, 200,
   'Básico abril 2026. Fuente: FATSA/ATSA Acuerdo marzo 2026. Valor hora ref: $4.908,65.',
   true, 'Requiere actualización cuando se publique escala post-abril 2026.'),
  (v_san_id, 'SAN-ADM-3', 'Administrativo/a de tercera', 1034595.93, 200,
   'Básico abril 2026. Fuente: FATSA/ATSA Acuerdo marzo 2026. Valor hora ref: $5.172,98.',
   true, 'Requiere actualización cuando se publique escala post-abril 2026.'),
  (v_san_id, 'SAN-CAD', 'Cadete', 922472.96, 200,
   'Básico abril 2026. El mínimo más bajo del convenio. '
   'Fuente: FATSA/ATSA Acuerdo marzo 2026. Valor hora ref: $4.612,36.',
   true, 'Requiere actualización cuando se publique escala post-abril 2026.')
  on conflict (agreement_id, codigo) do update
    set sueldo_basico = excluded.sueldo_basico,
        observaciones = excluded.observaciones;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CAMIONEROS CCT 40/89 — Valores verificados junio 2026 + viáticos
-- Fuente: FedCam Planilla de sueldos junio 2026 (publicada 2026-06-05)
-- Estado: Verificado ✓
-- Fórmula hora correcta: mensual / 24 días / 8 hs = mensual / 192
-- ─────────────────────────────────────────────────────────────────────────────

-- Corregir jornada_estandar_horas: FedCam usa divisor 24 días × 8 hs = 192
update public.agreements
set
  jornada_estandar_horas     = 192,
  antiguedad_porcentaje      = 1.00,
  aporte_sindical_porcentaje = 3.00,
  requires_manual_review     = false,
  fecha_actualizacion        = '2026-06-05',
  observaciones_educativas   = 'Planilla verificada junio 2026. Fuente: FedCam 2026-06-05. '
    'Fórmula hora: mensual / 24 / 8 = mensual / 192 (FedCam publica relación mes/día con divisor 24). '
    'Antigüedad: 1% sobre todos los conceptos remunerativos. Aporte sindical: 3%. '
    'Viáticos principales (referencia junio 2026): comida $15.563,09 / viático especial $7.809,53 / '
    'pernoctada $18.126,68 / viático larga distancia $81,37/km / '
    'permanencia fuera de residencia $54.924,39. '
    'Presentismo para logística/distribución: pendiente de verificación (revisión manual).'
where codigo = 'CAM-40-89';

-- Actualizar Operador de servicios: Word doc tiene $1.082.223,10 (estimación 005 tenía $1.063.520)
update public.agreement_categories
set
  sueldo_basico         = 1082223.10,
  requires_manual_review = false,
  observaciones         = 'Básico junio 2026 verificado. Fuente: FedCam Planilla junio 2026. '
    'Valor hora ref (mensual/192): $5.636,58.'
where codigo = 'CAM-OPS';

-- Agregar categorías verificadas del Word doc
do $$
declare v_cam_id uuid;
begin
  select id into v_cam_id from public.agreements where codigo = 'CAM-40-89';

  insert into public.agreement_categories
    (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, observaciones, requires_manual_review)
  values
  (v_cam_id, 'CAM-CHO1', 'Conductor de primera categoría', 1017089.13, 192,
   'Básico junio 2026 verificado. Fuente: FedCam Planilla junio 2026. Valor hora ref (mensual/192): $5.297,34.',
   false),
  (v_cam_id, 'CAM-ADM1', 'Personal administrativo primera categoría', 1012138.40, 192,
   'Básico junio 2026 verificado. Fuente: FedCam Planilla junio 2026. Valor hora ref (mensual/192): $5.271,55.',
   false),
  (v_cam_id, 'CAM-OFT', 'Oficial completo de taller', 1074073.30, 192,
   'Básico junio 2026 verificado. Fuente: FedCam Planilla junio 2026. Valor hora ref (mensual/192): $5.594,13.',
   false)
  on conflict (agreement_id, codigo) do update
    set sueldo_basico = excluded.sueldo_basico,
        requires_manual_review = false,
        observaciones = excluded.observaciones;

  -- Viáticos: NR items a nivel de convenio (category_id = null = aplica a todos)
  -- Solo insertar si no existen ya
  insert into public.agreement_non_remunerative_items
    (agreement_id, category_id, concepto, monto, vigencia_desde, vigencia_hasta, requires_manual_review, notas)
  select v_cam_id, null, concepto, monto, '2026-06-01', '2026-06-30', false, notas
  from (values
    ('Comida (CCT 40/89 junio 2026)',           15563.09, 'Verificado FedCam Planilla junio 2026. No remunerativo. Editable.'),
    ('Viático especial (CCT 40/89 junio 2026)', 7809.53,  'Verificado FedCam Planilla junio 2026. No remunerativo. Editable.'),
    ('Pernoctada (CCT 40/89 junio 2026)',        18126.68, 'Verificado FedCam Planilla junio 2026. No remunerativo. Editable.')
  ) as v(concepto, monto, notas)
  where not exists (
    select 1 from public.agreement_non_remunerative_items nri
    where nri.agreement_id = v_cam_id and nri.concepto = v.concepto
  );
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. PARÁMETROS GENERALES — Completar adicional UTHGRA Plus CABA
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare v_gas_id uuid;
  v_exists boolean;
begin
  select id into v_gas_id from public.agreements where codigo = 'GAS-389-04';
  select exists(
    select 1 from public.agreement_additionals
    where agreement_id = v_gas_id and nombre ilike '%CABA%'
  ) into v_exists;

  if not v_exists then
    insert into public.agreement_additionals
      (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
    values
    (v_gas_id, 'Plus CABA (15%)', 'porcentaje', 15.00, 'sueldo_basico', true,
     'Plus territorial para establecimientos en CABA. 15% sobre básico. '
     'Fuente: UTHGRA CABA tercer tramo 2025-2026. Verificar si aplica fuera de CABA.', true);
  end if;
end $$;

-- Agregar adicional antigüedad Camioneros (con note del Excel: 1% sobre todos los remunerativos)
do $$
declare v_cam_id uuid;
  v_exists boolean;
begin
  select id into v_cam_id from public.agreements where codigo = 'CAM-40-89';
  select exists(
    select 1 from public.agreement_additionals
    where agreement_id = v_cam_id and nombre ilike '%antigüedad%'
  ) into v_exists;

  if not v_exists then
    insert into public.agreement_additionals
      (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
    values
    (v_cam_id, 'Antigüedad', 'porcentaje', 1.00, 'total_remunerativo',
     true,
     '1% por año sobre todos los conceptos remunerativos (no solo el básico). '
     'Fuente: FedCam Planilla junio 2026. Editable.', false);
  end if;
end $$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FUENTE DOCUMENTAL — Registrar los documentos utilizados en esta migración
-- ─────────────────────────────────────────────────────────────────────────────

do $$
declare v_id uuid;
begin
  for v_id in select id from public.agreements
              where codigo in ('COM-130-75','CON-76-75','GAS-389-04','SAN-122-75','CAM-40-89')
  loop
    insert into public.agreement_sources
      (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
    values
    (v_id, 'Documento de investigación', 'Sueldos básicos vigentes de cinco CCT clave en Argentina.docx',
     null, '2026-06-13',
     'Documento Word de análisis e investigación. '
     'Fuente secundaria que cita fuentes primarias (FAECYS, UOCRA, UTHGRA, FATSA, FedCam). '
     'Referencia para migración 006.');
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTA FINAL
-- ─────────────────────────────────────────────────────────────────────────────
-- Cambios principales:
--   1. Comercio: 5 categorías actualizadas con valores verificados junio 2026
--   2. Comercio: 3 categorías nuevas (MA-B, MA-C, AD-B) con valores verificados
--   3. Construcción: CORRECCIÓN de error ×8 en valor_hora (jornal/8, no jornal)
--   4. Gastronomía: 2 categorías nuevas (P6, P7); sindical 2% → 2.5%
--   5. Sanidad: antigüedad 1% → 2% (art. 10 CCT 122/75); SAN-A1 corregido
--   6. Sanidad: 4 categorías nuevas del Word doc (ENF-P, MUC-P, ADM-3, CAD)
--   7. Camioneros: jornada_estandar_horas 200 → 192 (fórmula FedCam = mensual/192)
--   8. Camioneros: OPS corregido; 3 categorías nuevas (CHO1, ADM1, OFT)
--   9. Camioneros: 3 viáticos NR (comida, viático especial, pernoctada) junio 2026
-- Todos los valores son de referencia educativa y editables desde la app.
