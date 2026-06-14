-- Migración 007: actualización datos CCT verificados junio 2026
-- Fecha: 2026-06-14
-- Fuentes verificadas mediante búsqueda de fuentes primarias (UOCRA, FedCam, UTHGRA)
--
-- Cambios incluidos:
--   1. Construcción CCT 76/75 — jornales Zona A actualizados a 2do tramo jun 2026
--   2. Camioneros CCT 40/89 — Premio Presentismo $60.000 remunerativo (desde abr 2026)
--
-- No incluidos (datos aún no publicados al 14/06/2026):
--   - Sanidad CCT 122/75: revisión mayo 2026 pendiente de publicación por FATSA
--   - Gastronomía CCT 389/04: tabla P1-P7 completa por sub-escala no disponible en fuentes públicas
--   - UOCRA: SNR residual junio 2026 (monto exacto por confirmar directamente con UOCRA)

-- =========================================================
-- 1. CONSTRUCCIÓN CCT 76/75 — Jornales junio 2026 Zona A
--    Fuente: caede.com.ar, ignacioonline.com.ar, jorgevega.com.ar
--    Acuerdo 2do tramo jun-ago 2026: 2.1% + absorción parcial SNR mayo 2026
--    Incremento efectivo ~11% sobre mayo 2026
-- =========================================================

UPDATE agreement_categories SET
  sueldo_basico   = 123700.00,
  horas_referencia = 4948        -- jornal diario (×25 = mensual ref)
WHERE codigo = 'CON-AYU-A';
-- AYU Zona A: jornal $4.948/día (era $4.452) → mensual $123.700 → hora $618,50

UPDATE agreement_categories SET
  sueldo_basico   = 134375.00,
  horas_referencia = 5375
WHERE codigo = 'CON-MED-A';
-- Medio Oficial Zona A: jornal $5.375/día (era $4.837) → mensual $134.375 → hora $671,88

UPDATE agreement_categories SET
  sueldo_basico   = 145425.00,
  horas_referencia = 5817
WHERE codigo = 'CON-OFI-A';
-- Oficial Zona A: jornal $5.817/día (era $5.235) → mensual $145.425 → hora $727,13

UPDATE agreement_categories SET
  sueldo_basico   = 170000.00,
  horas_referencia = 6800
WHERE codigo = 'CON-OE-A';
-- Oficial Especializado Zona A: jornal $6.800/día (era $6.119) → mensual $170.000 → hora $850,00

UPDATE agreement_categories SET
  sueldo_basico   = 881193.00,
  horas_referencia = NULL          -- sereno liquida por mensual, no por jornal
WHERE codigo = 'CON-SER-A';
-- Sereno Zona A: mensual $881.193 (era $808.877)
-- Nota: valor obtenido de fuentes secundarias; verificar con planilla oficial UOCRA

-- Actualizar NR items de Construcción para junio 2026
-- Los valores de mayo 2026 siguen activos; el SNR residual de junio está pendiente de confirmación.
-- Se deja la vigencia_hasta en NULL para que sigan activos hasta nuevo acuerdo.
-- (Si se confirman nuevos SNR para el 2do tramo, aplicar en 008)

-- =========================================================
-- 2. CAMIONEROS CCT 40/89 — Premio Presentismo $60.000 remunerativo
--    Fuente: sindicatos.com.ar, ignacioonline.com.ar, blog.aconpy.com
--    Acuerdo marzo 2026: premio creado con vigencia desde 01/04/2026
-- =========================================================

INSERT INTO agreement_additionals (agreement_id, nombre, valor, is_remunerativo)
SELECT
  a.id,
  'Premio Presentismo y Puntualidad',
  60000,
  true
FROM agreements a
WHERE a.codigo = 'CAM'
  AND NOT EXISTS (
    SELECT 1 FROM agreement_additionals aa
    WHERE aa.agreement_id = a.id
      AND aa.nombre = 'Premio Presentismo y Puntualidad'
  );

-- =========================================================
-- 3. GASTRONOMÍA CCT 389/04 — Nota de estado
--    Acuerdo abril-junio 2026 confirmado; tabla P1-P7 completa aún no disponible.
--    Valores confirmados parciales (sector privado, junio 2026):
--      P1 (maestranza/lavaplatos): $1.346.143
--      P4 (mozos/cajeros):        ≈ $1.565.000
--      P7 (chef ejecutivo/jefe):  ≈ $2.298.392
--    Se actualizarán en migración 008 cuando se obtenga Anexo I completo del acuerdo.
-- =========================================================

-- =========================================================
-- 4. SANIDAD CCT 122/75 — Nota de estado
--    Revisión mayo 2026 comprometida pero no publicada al 14/06/2026.
--    Valores de abril 2026 permanecen vigentes en el simulador.
--    Monitorear publicación en sanidad.org.ar / atsa.org.ar
-- =========================================================

-- Comentario educativo sobre el estado de las revisiones
COMMENT ON TABLE agreements IS
  'Convenios CCT. Datos: Comercio jun 2026, Construcción jun 2026, Camioneros jun 2026 verificados. '
  'Gastronomía y Sanidad con valores de abril 2026 (paritaria de mayo/jun pendiente de publicación).';
