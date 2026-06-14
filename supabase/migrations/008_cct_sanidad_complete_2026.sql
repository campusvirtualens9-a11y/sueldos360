-- =====================================================
-- SUELDOS 360 — Migration 008
-- CCT 122/75 Sanidad — Escala completa abr-2026
-- Fuente: Acuerdo FATSA-ADECRA-CONFECLISA-CACEP firmado 16/03/2026
--         Vigencia: 01/02/2026 – 31/01/2027
-- Valores: Abril 2026 (tercer tramo feb→mar→abr del acuerdo)
-- =====================================================
-- Categorías ya existentes y CORRECTAS (no se modifican):
--   SAN-A1  : Profesionales                         $1.372.187,59 ✓
--   SAN-A2  : Obstétricas e instrumentadoras        $1.247.895,44 ✓
--   SAN-A3  : Cabos/as de cirugía                   $1.247.895,44 ✓
--   SAN-A4  : Enfermeros/as de cirugía/esteriliz.   $1.193.206,30 ✓
--   SAN-A5  : Mucamas de cirugía                    $1.030.949,16 ✓
--   SAN-ENF-P: Enfermero/a de piso / c.externos     $1.160.387,33 ✓
--   SAN-MUC-P: Mucama de piso / g.externos          $  981.730,08 ✓
--   SAN-ADM-3: Administrativo/a de tercera          $1.034.595,93 ✓
--   SAN-CAD  : Cadete                               $  922.472,96 ✓
-- =====================================================

DO $$
DECLARE
  v_san_id uuid;
BEGIN
  SELECT id INTO v_san_id FROM public.agreements WHERE codigo = 'SAN-122-75';

  -- ─── SECCIÓN A — Profesionales, Técnicos y Servicios Complementarios ─────────
  INSERT INTO public.agreement_categories (
    agreement_id, codigo, nombre, sueldo_basico, horas_referencia,
    observaciones, educational_note, requires_manual_review
  ) VALUES
  -- inc. c — diferente de los Cabos de Cirugía (inc. b)
  (v_san_id, 'SAN-CAB-PIS',
   'Cabos/as de Piso o Pabellón',
   1226019.30, 200,
   'Sec. A inc. c — Acuerdo FATSA mar-2026, valor abr-2026',
   'Supervisión de mucamas y personal de piso. Sueldo básico mensual.', false),

  -- inc. e — mismo valor que enfermeros de cirugía
  (v_san_id, 'SAN-RX',
   'Auxiliar Técnico de Rayos X',
   1193206.30, 200,
   'Sec. A inc. e — Acuerdo FATSA mar-2026, valor abr-2026',
   'Técnico que opera equipos de radiodiagnóstico bajo supervisión médica.', false),

  -- inc. f
  (v_san_id, 'SAN-PED',
   'Pedicuros y Masajistas',
   1193206.30, 200,
   'Sec. A inc. f — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- inc. i — Personal en áreas críticas especializadas
  (v_san_id, 'SAN-TI',
   'Personal de Unidades Críticas (UTI, Climax, Coronaria, Nursery, Foníatría, Riñón)',
   1160387.33, 200,
   'Sec. A inc. i — Acuerdo FATSA mar-2026, valor abr-2026',
   'Mismo valor que Enfermero de Piso (inc. h). Reciben adicional por área crítica.', false),

  -- inc. j
  (v_san_id, 'SAN-MEN',
   'Personal de atención de enfermos mentales y nerviosos',
   1160387.33, 200,
   'Sec. A inc. j — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- inc. g — Personal técnico de laboratorio / diagnóstico
  (v_san_id, 'SAN-TEC',
   'Personal Técnico: Hemoterapia, Fisioterapia, Anatomía Patológica, Laboratorio',
   1109344.90, 200,
   'Sec. A inc. g — Acuerdo FATSA mar-2026, valor abr-2026',
   'Personal técnico no profesional que opera equipos de diagnóstico y tratamiento.', false),

  -- inc. k
  (v_san_id, 'SAN-AYT',
   'Ayudante de Radiología, Fisioterapia, Hemoterapia y Laboratorio de Análisis Clínico',
   1109344.90, 200,
   'Sec. A inc. k — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- inc. l — categoría exclusiva de geriátricos dentro de la Sección A
  (v_san_id, 'SAN-ASG',
   'Asistente Geriátrica',
   1009073.42, 200,
   'Sec. A inc. l — Acuerdo FATSA mar-2026, valor abr-2026',
   'Personal de apoyo directo al paciente adulto mayor en instituciones geriátricas.', false),

  -- inc. m
  (v_san_id, 'SAN-ASC',
   'Asistente de Comedores con atención al público',
   1003605.42, 200,
   'Sec. A inc. m — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- inc. n
  (v_san_id, 'SAN-CAMI',
   'Camilleros y Fotógrafos',
   1003605.42, 200,
   'Sec. A inc. n — Acuerdo FATSA mar-2026, valor abr-2026',
   'Fotógrafos: fotografía médica/radiológica.', false),

  -- inc. ñ
  (v_san_id, 'SAN-LAV',
   'Personal de Lavadero y Ropería',
   987196.72, 200,
   'Sec. A inc. ñ — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- ─── SECCIÓN B — Personal de Mantenimiento ────────────────────────────────
  (v_san_id, 'SAN-B1',
   'Oficiales de Mantenimiento',
   1128484.34, 200,
   'Sec. B inc. a — Acuerdo FATSA mar-2026, valor abr-2026',
   'Electricistas, plomeros, soldadores y otros oficios con formación técnica.', false),

  (v_san_id, 'SAN-B2',
   'Medio Oficiales de Mantenimiento',
   1062846.74, 200,
   'Sec. B inc. b — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-B3',
   'Ascensoristas, Porteros y Serenos',
   1020010.41, 200,
   'Sec. B inc. c — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-B4',
   'Jardineros',
   981730.08, 200,
   'Sec. B inc. d — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-B5',
   'Peones en General (Mantenimiento)',
   1003605.42, 200,
   'Sec. B inc. e — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- ─── SECCIÓN C — Personal de Cocina ─────────────────────────────────────
  (v_san_id, 'SAN-C1',
   'Primer Cocinero y/o Repostero y/o Fiambrero',
   1128484.34, 200,
   'Sec. C inc. a — Acuerdo FATSA mar-2026, valor abr-2026',
   'Máxima categoría del personal de cocina.', false),

  (v_san_id, 'SAN-C2',
   'Segundo Cocinero y/o Repostero y/o Fiambrero',
   1066497.70, 200,
   'Sec. C inc. b — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-C3',
   'Cocinero/a de Establecimientos Geriátricos',
   1066497.70, 200,
   'Sec. C inc. c — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-C4',
   'Encargado/a de Office, Cafeteros, Jefe de Despacho de Cocina',
   1066497.70, 200,
   'Sec. C inc. d — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-C5',
   'Ayudante de Cocina y Cacerolero',
   1044623.14, 200,
   'Sec. C inc. e — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  (v_san_id, 'SAN-C6',
   'Peones de Cocina en General',
   981730.08, 200,
   'Sec. C inc. f — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- ─── SECCIÓN D — Personal Administrativo ─────────────────────────────────
  -- SAN-ADM-3 y SAN-CAD ya existen; agregar Primera y Segunda
  (v_san_id, 'SAN-ADM-1',
   'Administrativo/a de Primera',
   1098403.19, 200,
   'Sec. D inc. a — Acuerdo FATSA mar-2026, valor abr-2026',
   'Personal administrativo con mayor responsabilidad y antigüedad en el sector.', false),

  (v_san_id, 'SAN-ADM-2',
   'Administrativo/a de Segunda',
   1066497.70, 200,
   'Sec. D inc. b — Acuerdo FATSA mar-2026, valor abr-2026',
   null, false),

  -- ─── ESTABLECIMIENTOS GERIÁTRICOS (exclusivo) ─────────────────────────────
  (v_san_id, 'SAN-AUX-ENF',
   'Auxiliar de Enfermería (Establecimientos Geriátricos)',
   1051911.55, 200,
   'Geriátricos exclusivamente — Acuerdo FATSA mar-2026, valor abr-2026',
   'Categoría exclusiva para auxiliares de enfermería en geriátricos. Diferente del enfermero titulado (SAN-A4).', false)

  ON CONFLICT (agreement_id, codigo) DO UPDATE SET
    sueldo_basico     = EXCLUDED.sueldo_basico,
    nombre            = EXCLUDED.nombre,
    observaciones     = EXCLUDED.observaciones,
    educational_note  = COALESCE(EXCLUDED.educational_note, agreement_categories.educational_note);

  -- ─── Extender vigencia del SNR $90.000 hasta fin de acuerdo ────────────────
  -- El acuerdo cubre 01/02/2026 – 31/01/2027; el seed la tenía solo hasta 30/04/2026
  UPDATE public.agreement_non_remunerative_items
  SET vigencia_hasta = '2027-01-31',
      notas = 'SNR $90.000/mes. Acuerdo FATSA-ADECRA mar-2026 firmado 16/03/2026. '
              'Feb-26: $80.000 | Mar-26: $85.000 | Abr-26 en adelante: $90.000. '
              'Vigencia convenio: 01/02/2026–31/01/2027. Revisión paritaria prevista may-2026.'
  WHERE agreement_id = v_san_id
    AND concepto ILIKE '%no remuner%';

  -- Actualizar fecha_actualizacion del convenio
  UPDATE public.agreements
  SET fecha_actualizacion = '2026-04-01',
      observaciones_educativas = 'Convenio CCT 122/75. Acuerdo firmado 16/03/2026 entre FATSA, ADECRA, '
        'CONFECLISA, CACEP, AAEG y CEPSAL. Vigencia 01/02/2026–31/01/2027. '
        'Cuatro secciones: A (Profesionales/Técnicos), B (Mantenimiento), C (Cocina), D (Administrativo). '
        'Más categorías exclusivas para Geriátricos. SNR $90.000/mes desde abr-2026. '
        'Aporte solidario 1% sobre remuneración integral. Antigüedad 2% por año (art. 10).'
  WHERE codigo = 'SAN-122-75';

END $$;
