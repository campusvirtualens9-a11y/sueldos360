-- =====================================================
-- SUELDOS 360 — Migration 009
-- CCT 76/75 Construcción UOCRA — Corrección de valores
-- =====================================================
-- Migration 007 introdujo un error en la escala de Construcción:
--   • Usó el jornal diario ($4.948/día) en horas_referencia (campo de horas)
--   • Calculó el mensual como jornal_diario × 25 = $123.700 (INCORRECTO)
--   • La metodología UOCRA es: valor_hora × 176 hs/mes = sueldo_basico mensual
--   • El campo valor_hora no fue tocado por migration 007 → valores correctos
--
-- Fuente: Acuerdo UOCRA/CAMARCO mayo 2026, Zona A
--   Publicado en: caede.com.ar, ignacioonline.com.ar, jorgevega.com.ar
--   Vigente para el período junio–agosto 2026
-- =====================================================

-- Ayudante Zona A
-- valor_hora = $4.851/h → mensual = $4.851 × 176 = $853.776
UPDATE public.agreement_categories SET
  sueldo_basico    = 853776.00,
  horas_referencia = 176,
  observaciones    = 'Mensual = valor_hora $4.851 × 176 hs. Acuerdo UOCRA/CAMARCO may-2026, vigente jun-2026.'
WHERE codigo = 'CON-AYU-A';

-- Medio Oficial Zona A
-- valor_hora = $5.270/h → mensual = $5.270 × 176 = $927.520
UPDATE public.agreement_categories SET
  sueldo_basico    = 927520.00,
  horas_referencia = 176,
  observaciones    = 'Mensual = valor_hora $5.270 × 176 hs. Acuerdo UOCRA/CAMARCO may-2026, vigente jun-2026.'
WHERE codigo = 'CON-MED-A';

-- Oficial Zona A
-- valor_hora = $5.703/h → mensual = $5.703 × 176 = $1.003.728
UPDATE public.agreement_categories SET
  sueldo_basico    = 1003728.00,
  horas_referencia = 176,
  observaciones    = 'Mensual = valor_hora $5.703 × 176 hs. Acuerdo UOCRA/CAMARCO may-2026, vigente jun-2026.'
WHERE codigo = 'CON-OFI-A';

-- Oficial Especializado Zona A
-- valor_hora = $6.666/h → mensual = $6.666 × 176 = $1.173.216
UPDATE public.agreement_categories SET
  sueldo_basico    = 1173216.00,
  horas_referencia = 176,
  observaciones    = 'Mensual = valor_hora $6.666 × 176 hs. Acuerdo UOCRA/CAMARCO may-2026, vigente jun-2026.'
WHERE codigo = 'CON-OE-A';

-- Sereno Zona A
-- Liquida por mensual fijo; migration 007 dejó horas_referencia en NULL
UPDATE public.agreement_categories SET
  sueldo_basico    = 881193.00,
  horas_referencia = 176,
  observaciones    = 'Básico mensual fijo $881.193. Jornada nocturna específica del CCT 76/75. Fuente: acuerdo UOCRA may-2026.'
WHERE codigo = 'CON-SER-A';
