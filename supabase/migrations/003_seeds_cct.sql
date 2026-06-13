-- =====================================================
-- SUELDOS 360 — Seeds de Convenios Colectivos
-- Fuente: deep-research-report.md (investigación 2026-06-13)
-- TODOS los valores son editables y con trazabilidad de fuente
-- =====================================================

-- =====================================================
-- 1. CONVENIOS MAESTROS
-- =====================================================

insert into public.agreements (
  codigo, nombre, numero_cct, rubro, actividad,
  jornada_estandar_horas, tipo_liquidacion,
  antiguedad_porcentaje, presentismo_porcentaje,
  aporte_sindical_porcentaje, aporte_solidario_porcentaje,
  region_aplica, fecha_actualizacion,
  observaciones_educativas, requires_manual_review, is_global
) values
(
  'COM-130-75',
  'Empleados de Comercio',
  'CCT 130/75',
  'Comercio',
  'Comercio minorista y mayorista, empleados de comercio en general',
  200,
  'mensual',
  1.00,
  8.33,
  2.00,
  null,
  'nacional',
  '2026-04-07',
  'Convenio de amplio uso. El presentismo (art. 40 CCT 130/75) equivale a 1/12 de las remuneraciones computables. '
  'La antigüedad se carga como 1% por año como valor estándar editable. '
  'Revisar escala oficial FAECyS/CAC para valores exactos por categoría. '
  'Los valores son de referencia educativa.',
  false,
  true
),
(
  'CON-76-75',
  'Construcción UOCRA',
  'CCT 76/75',
  'Construcción',
  'Construcción, edificación, obras civiles y de infraestructura',
  176,
  'jornal',
  null,
  20.00,
  1.50,
  1.50,
  'nacional',
  '2026-05-27',
  'Convenio que liquida por hora/jornal y zona salarial. '
  'La jornada semanal estándar es de 44 horas (176 hs/mes de referencia). '
  'Los básicos mensualización son inferencia técnica: valor_hora × 176 hs. '
  'Zona A es la referencia estándar. Los valores de hora son los oficiales para junio 2026. '
  'El presentismo/asistencia se carga como porcentaje editable sobre tablas históricas UOCRA. '
  'Fuente: acuerdo UOCRA/CAMARCO mayo 2026.',
  false,
  true
),
(
  'GAS-389-04',
  'Gastronomía y Hotelería UTHGRA-FEHGRA',
  'CCT 389/04',
  'Gastronomía y Hotelería',
  'Hoteles, restaurantes, bares, casinos y establecimientos gastronómicos',
  200,
  'mensual',
  null,
  10.00,
  null,
  null,
  'nacional',
  '2026-04-07',
  'Escala varía por categoría de establecimiento (A, B, Especial). '
  'La carga inicial usa Categoría B como referencia (hotel 3 estrellas / restaurante B). '
  'El 10% de presentismo, 10% alimentación y 12% complemento de servicio son adicionales frecuentes. '
  'La antigüedad varía por año según art. 11.3 del CCT. '
  'Fuente: UTHGRA Mendoza y UTHGRA Capital — tercer tramo abril-junio 2026.',
  false,
  true
),
(
  'SAN-122-75',
  'Sanidad — Clínicas y Sanatorios ATSA',
  'CCT 122/75',
  'Sanidad',
  'Clínicas, sanatorios, hospitales privados y establecimientos de salud',
  200,
  'mensual',
  null,
  null,
  null,
  1.00,
  'nacional',
  '2026-03-01',
  'Convenio con familias ocupacionales bien definidas. '
  'El aporte solidario del 1% corresponde a acuerdos homologados del sector (editable). '
  'Premio de asistencia/puntualidad aplicable: porcentaje no recuperado en fuente indexada — marcar como editable. '
  'La suma no remunerativa de $90.000 para abril 2026 debe cargarse como NR en tabla separada. '
  'Fuente: placa oficial ATSA actualización salarial marzo 2026.',
  false,
  true
),
(
  'CAM-40-89',
  'Camioneros',
  'CCT 40/89',
  'Transporte',
  'Transporte automotor de cargas, distribución y actividades conexas',
  200,
  'mensual',
  null,
  null,
  null,
  null,
  'nacional',
  '2026-06-01',
  'Convenio con ramas y planillas extensas. '
  'Solo se recuperó un valor exacto de junio 2026: Peones generales de barrido y limpieza ($928.919,73). '
  'El resto de categorías se carga con importe NULL y requires_manual_review = true. '
  'Para cobertura total se requiere curaduría manual del PDF oficial FADEEAC Planilla JUNIO-26. '
  'Fuente: FADEEAC/Sindicato de Camioneros escala junio 2026.',
  true,
  true
);

-- =====================================================
-- 2. CATEGORÍAS POR CONVENIO
-- =====================================================

-- COMERCIO (5 categorías)
do $$
declare v_com_id uuid;
begin
  select id into v_com_id from public.agreements where codigo = 'COM-130-75';

  insert into public.agreement_categories (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, zona, observaciones, requires_manual_review, educational_note)
  values
  (v_com_id, 'COM-MA-A', 'Maestranza A', 1203006.19, 200, null,
   'Valor confirmado en escala oficial FAECyS/CAC abril-julio 2026.',
   false, null),
  (v_com_id, 'COM-AD-A', 'Administrativos A', null, 200, null,
   'Categoría vigente en escala oficial. Importe no recuperado de forma indexada.',
   true, 'Dato pendiente de verificación manual. Completar desde PDF oficial FAECyS/CAC. Valor editable por el usuario.'),
  (v_com_id, 'COM-CAJ-A', 'Cajeros A', null, 200, null,
   'Categoría vigente en escala oficial. Importe no recuperado de forma indexada.',
   true, 'Dato pendiente de verificación manual. Completar desde PDF oficial FAECyS/CAC. Valor editable por el usuario.'),
  (v_com_id, 'COM-AUX-A', 'Auxiliar Especializado A', null, 200, null,
   'Categoría vigente en escala oficial. Importe no recuperado de forma indexada.',
   true, 'Dato pendiente de verificación manual. Completar desde PDF oficial FAECyS/CAC. Valor editable por el usuario.'),
  (v_com_id, 'COM-VEN-A', 'Vendedores A', null, 200, null,
   'Categoría vigente en escala oficial. Importe no recuperado de forma indexada.',
   true, 'Dato pendiente de verificación manual. Completar desde PDF oficial FAECyS/CAC. Valor editable por el usuario.');
end $$;

-- CONSTRUCCIÓN (5 categorías)
do $$
declare v_con_id uuid;
begin
  select id into v_con_id from public.agreements where codigo = 'CON-76-75';

  insert into public.agreement_categories (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, valor_hora, zona, observaciones, requires_manual_review, educational_note)
  values
  (v_con_id, 'CON-OE-A', 'Oficial Especializado Zona A', 1173216.00, 176, 6666.00, 'Zona A',
   'Mensual de referencia calculado como 6.666 x 176 hs. Valor hora confirmado para junio 2026. Fuente: acuerdo UOCRA/CAMARCO mayo 2026.',
   false, 'El básico mensual es inferencia técnica: valor_hora × 176 hs. Dato editable.'),
  (v_con_id, 'CON-OFI-A', 'Oficial Zona A', 1003728.00, 176, 5703.00, 'Zona A',
   'Mensual de referencia calculado como 5.703 x 176 hs. Valor hora confirmado para junio 2026.',
   false, 'El básico mensual es inferencia técnica: valor_hora × 176 hs. Dato editable.'),
  (v_con_id, 'CON-MED-A', 'Medio Oficial Zona A', 927520.00, 176, 5270.00, 'Zona A',
   'Mensual de referencia calculado como 5.270 x 176 hs. Valor hora confirmado para junio 2026.',
   false, 'El básico mensual es inferencia técnica: valor_hora × 176 hs. Dato editable.'),
  (v_con_id, 'CON-AYU-A', 'Ayudante Zona A', 853776.00, 176, 4851.00, 'Zona A',
   'Mensual de referencia calculado como 4.851 x 176 hs. Valor hora confirmado para junio 2026.',
   false, 'El básico mensual es inferencia técnica: valor_hora × 176 hs. Dato editable.'),
  (v_con_id, 'CON-SER-A', 'Sereno Zona A', 881193.00, 176, null, 'Zona A',
   'Básico mensual recuperado de fuente oficial para junio 2026. Jornada del sereno puede ser distinta.',
   false, 'El sereno tiene jornada específica según CCT 76/75. Verificar con fuente oficial.');
end $$;

-- GASTRONOMÍA (5 categorías — Ejemplo Categoría B)
do $$
declare v_gas_id uuid;
begin
  select id into v_gas_id from public.agreements where codigo = 'GAS-389-04';

  insert into public.agreement_categories (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, clase_establecimiento, observaciones, requires_manual_review, educational_note)
  values
  (v_gas_id, 'GAS-P1-B', 'Punto 1 — Categoría B', 1038120.00, 200, 'Categoría B (Hotel 3★ / Restaurante B / Bar 3 copas)',
   'Ejemplo oficial Categoría B tercer tramo abril-junio 2026. Fuente: UTHGRA Mendoza.',
   false, 'Los básicos varían por clase de establecimiento. Categoría B es solo una referencia. Verificar y editar para otros tipos.'),
  (v_gas_id, 'GAS-P2-B', 'Punto 2 — Categoría B', 1102324.00, 200, 'Categoría B',
   'Montaplato, Bagajista, Sereno vigilador, Auxiliar administrativo. Fuente: UTHGRA Mendoza.',
   false, 'Antigüedad variable por año según art. 11.3 CCT 389/04.'),
  (v_gas_id, 'GAS-P3-B', 'Punto 3 — Categoría B', 1180295.00, 200, 'Categoría B',
   'Ayudantes de cocina/bar/panadería, Empleado administrativo. Fuente: UTHGRA Mendoza.',
   false, 'Antigüedad variable por año según art. 11.3 CCT 389/04.'),
  (v_gas_id, 'GAS-P4-B', 'Punto 4 — Categoría B', 1217642.00, 200, 'Categoría B',
   'Medio oficial, mucamas, telefonista, chofer/garajista. Fuente: UTHGRA Mendoza.',
   false, 'Parametrizar además alimentación y complemento de servicio.'),
  (v_gas_id, 'GAS-P5-B', 'Punto 5 — Categoría B', 1271299.00, 200, 'Categoría B',
   'Comis de cocina, cajero comedor, adicionista, empleado principal administrativo. Fuente: UTHGRA Mendoza.',
   false, 'Guardar clase_establecimiento para distinguir B, A y Especial.');
end $$;

-- SANIDAD (5 categorías)
do $$
declare v_san_id uuid;
begin
  select id into v_san_id from public.agreements where codigo = 'SAN-122-75';

  insert into public.agreement_categories (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, observaciones, requires_manual_review, educational_note)
  values
  (v_san_id, 'SAN-A1', 'Profesionales / Bioquímicos / Nutricionistas / Farmacéuticos / Kinesiólogos', 1327187.59, 200,
   'Valor abril 2026 según placa oficial ATSA. Actualización salarial marzo 2026.',
   false, 'Separar pluses y no remunerativos en tablas separadas. Aporte solidario 1% editable.'),
  (v_san_id, 'SAN-A2', 'Obstétricas e instrumentadoras', 1247895.44, 200,
   'Valor abril 2026 según placa oficial ATSA.',
   false, null),
  (v_san_id, 'SAN-A3', 'Cabos/as de cirugía', 1247895.44, 200,
   'Valor abril 2026 según placa oficial ATSA.',
   false, 'Aporte solidario 1% cargado como editable por acuerdos homologados del sector.'),
  (v_san_id, 'SAN-A4', 'Enfermeros/as de cirugía y personal de esterilización', 1193206.30, 200,
   'Valor abril 2026 según placa oficial ATSA.',
   false, 'Separar familias ocupacionales para evitar mezclar categorías profesionales y de apoyo.'),
  (v_san_id, 'SAN-A5', 'Mucamas de cirugía o sin atención al paciente', 1030949.16, 200,
   'Valor abril 2026 según placa oficial ATSA.',
   false, 'Mantener premio asistencia/puntualidad como adicional parametrizable, no embebido en el básico.');
end $$;

-- CAMIONEROS (5 categorías)
do $$
declare v_cam_id uuid;
begin
  select id into v_cam_id from public.agreements where codigo = 'CAM-40-89';

  insert into public.agreement_categories (agreement_id, codigo, nombre, sueldo_basico, horas_referencia, observaciones, requires_manual_review, educational_note)
  values
  (v_cam_id, 'CAM-PEO-BL', 'Peones generales de barrido y limpieza', 928919.73, 200,
   'Único valor exacto de junio 2026 recuperado automáticamente desde la planilla oficial FADEEAC indexada.',
   false, 'Solo categoría con valor exacto disponible en esta investigación.'),
  (v_cam_id, 'CAM-OPS', 'Operador de servicios', null, 200,
   'Categoría identificada en planilla junio 2026 FADEEAC. Valor no indexado en búsqueda pública.',
   true, 'Dato pendiente de verificación manual. Importar como NULL. Completar desde PDF oficial FADEEAC Planilla-JUNIO-26.pdf. Valor editable por el usuario.'),
  (v_cam_id, 'CAM-DDO', 'Distribuidor domiciliario', null, 200,
   'Categoría identificada en planilla junio 2026 FADEEAC. Valor no indexado en búsqueda pública.',
   true, 'Dato pendiente de verificación manual. Importar como NULL. Completar desde PDF oficial FADEEAC. Valor editable por el usuario.'),
  (v_cam_id, 'CAM-AYM', 'Ayudantes mayores de 18 años', null, 200,
   'Categoría identificada en planilla junio 2026 FADEEAC. Valor no indexado en búsqueda pública.',
   true, 'Dato pendiente de verificación manual. Importar como NULL. Completar desde PDF oficial FADEEAC. Valor editable por el usuario.'),
  (v_cam_id, 'CAM-OF1', 'Oficial de primera', null, 200,
   'Categoría vigente en planilla salarial del convenio. Valor no recuperado de forma indexada.',
   true, 'Dato pendiente de verificación manual. Importar como NULL. Completar desde PDF oficial FADEEAC. Valor editable por el usuario.');
end $$;

-- =====================================================
-- 3. ADICIONALES POR CONVENIO
-- =====================================================

-- COMERCIO: adicionales
do $$
declare v_com_id uuid;
begin
  select id into v_com_id from public.agreements where codigo = 'COM-130-75';

  insert into public.agreement_additionals (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
  values
  (v_com_id, 'Presentismo art. 40', 'porcentaje', 8.33, 'remuneraciones_computables', true,
   'Equivale a 1/12 de las remuneraciones computables. Art. 40 CCT 130/75. Editable.', false),
  (v_com_id, 'Antigüedad', 'porcentaje', 1.00, 'sueldo_basico', true,
   '1% por año de antigüedad. Valor estándar editable según escala histórica del convenio.', false),
  (v_com_id, 'Aporte sindical', 'porcentaje', 2.00, 'remuneracion_bruta', false,
   'Porcentaje editable según seccional sindical. Verificar con FAECyS local.', true);
end $$;

-- CONSTRUCCIÓN: adicionales
do $$
declare v_con_id uuid;
begin
  select id into v_con_id from public.agreements where codigo = 'CON-76-75';

  insert into public.agreement_additionals (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
  values
  (v_con_id, 'Presentismo / Asistencia perfecta', 'porcentaje', 20.00, 'sueldo_basico', true,
   'Porcentaje editable sobre tablas históricas UOCRA. Valor de referencia.', false),
  (v_con_id, 'Aporte solidario sindical', 'porcentaje', 1.50, 'remuneracion_bruta', false,
   'Confirmado como extra convencional frecuente. Editable.', false),
  (v_con_id, 'Fondo de desempleo (FAECYS)', 'porcentaje', 1.50, 'remuneracion_bruta', false,
   'Aporte asistencial empresarial por período. Verificar con UOCRA seccional.', true);
end $$;

-- GASTRONOMÍA: adicionales
do $$
declare v_gas_id uuid;
begin
  select id into v_gas_id from public.agreements where codigo = 'GAS-389-04';

  insert into public.agreement_additionals (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
  values
  (v_gas_id, 'Presentismo', 'porcentaje', 10.00, 'sueldo_basico', true,
   'Porcentaje confirmado en fuente oficial UTHGRA. Editable.', false),
  (v_gas_id, 'Alimentación', 'porcentaje', 10.00, 'sueldo_basico', true,
   'Adicional frecuente confirmado en escala UTHGRA. Editable.', false),
  (v_gas_id, 'Complemento de servicio', 'porcentaje', 12.00, 'sueldo_basico', true,
   'Confirmado en escala oficial UTHGRA. Editable.', false),
  (v_gas_id, 'Antigüedad (variable por año)', 'porcentaje', null, 'sueldo_basico', true,
   'Varía por año según art. 11.3 CCT 389/04. Monto no fijo — dejar como editable.', true);
end $$;

-- SANIDAD: adicionales
do $$
declare v_san_id uuid;
begin
  select id into v_san_id from public.agreements where codigo = 'SAN-122-75';

  insert into public.agreement_additionals (agreement_id, nombre, tipo, valor, base_calculo, is_remunerativo, observaciones, requires_manual_review)
  values
  (v_san_id, 'Aporte solidario', 'porcentaje', 1.00, 'remuneracion_integral_mensual', false,
   '1% sobre la remuneración integral mensual. Acuerdos homologados del sector. Editable.', false),
  (v_san_id, 'Premio asistencia y puntualidad', 'porcentaje', null, 'sueldo_basico', true,
   'Porcentaje no recuperado en fuente indexada consultada. Marcar como pendiente de verificación.', true);
end $$;

-- =====================================================
-- 4. SUMAS NO REMUNERATIVAS
-- =====================================================

-- CONSTRUCCIÓN: NR junio 2026
do $$
declare v_con_id uuid;
  v_oe uuid; v_ofi uuid; v_med uuid; v_ayu uuid; v_ser uuid;
begin
  select id into v_con_id from public.agreements where codigo = 'CON-76-75';
  select id into v_oe from public.agreement_categories where agreement_id = v_con_id and codigo = 'CON-OE-A';
  select id into v_ofi from public.agreement_categories where agreement_id = v_con_id and codigo = 'CON-OFI-A';
  select id into v_med from public.agreement_categories where agreement_id = v_con_id and codigo = 'CON-MED-A';
  select id into v_ayu from public.agreement_categories where agreement_id = v_con_id and codigo = 'CON-AYU-A';
  select id into v_ser from public.agreement_categories where agreement_id = v_con_id and codigo = 'CON-SER-A';

  insert into public.agreement_non_remunerative_items (agreement_id, category_id, concepto, monto, vigencia_desde, vigencia_hasta, zona, requires_manual_review, notas)
  values
  (v_con_id, v_oe, 'Suma no remunerativa junio 2026', 63300.00, '2026-06-01', '2026-06-30', 'Zona A', false,
   'Valor junio 2026 Zona A confirmado en fuente oficial acuerdo UOCRA/CAMARCO.'),
  (v_con_id, v_ofi, 'Suma no remunerativa junio 2026', 58300.00, '2026-06-01', '2026-06-30', 'Zona A', false,
   'Valor junio 2026 Zona A confirmado en fuente oficial acuerdo UOCRA/CAMARCO.'),
  (v_con_id, v_med, 'Suma no remunerativa junio 2026', 53400.00, '2026-06-01', '2026-06-30', 'Zona A', false,
   'Valor junio 2026 Zona A confirmado en fuente oficial acuerdo UOCRA/CAMARCO.'),
  (v_con_id, v_ayu, 'Suma no remunerativa junio 2026', 50300.00, '2026-06-01', '2026-06-30', 'Zona A', false,
   'Valor junio 2026 Zona A confirmado en fuente oficial acuerdo UOCRA/CAMARCO.'),
  (v_con_id, v_ser, 'Suma no remunerativa junio 2026', 50300.00, '2026-06-01', '2026-06-30', 'Zona A', false,
   'Valor junio 2026 Zona A confirmado en fuente oficial acuerdo UOCRA/CAMARCO.');
end $$;

-- SANIDAD: NR abril 2026
do $$
declare v_san_id uuid;
begin
  select id into v_san_id from public.agreements where codigo = 'SAN-122-75';

  insert into public.agreement_non_remunerative_items (agreement_id, category_id, concepto, monto, vigencia_desde, vigencia_hasta, zona, requires_manual_review, notas)
  values
  (v_san_id, null, 'Suma no remunerativa abril 2026', 90000.00, '2026-04-01', '2026-04-30', null, false,
   'Valor confirmado en placa oficial ATSA actualización salarial marzo 2026. Aplica a todas las categorías del convenio.');
end $$;

-- =====================================================
-- 5. FUENTES DOCUMENTALES
-- =====================================================

insert into public.agreement_sources (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
select a.id, 'PDF oficial', 'Escala salarial abril-julio 2026 FAECyS/CAC',
  'https://faecys.org.ar/wp-content/uploads/2026/04/ACUERDO-ABRIL-2026-ESCALAS.pdf',
  '2026-06-13',
  'Fuente oficial utilizada para la semilla de datos de Comercio CCT 130/75. Consultada el 2026-06-13.'
from public.agreements a where a.codigo = 'COM-130-75';

insert into public.agreement_sources (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
select a.id, 'PDF oficial', 'Acuerdo CCT 76/75 mayo 2026 CAMARCO',
  'https://www.camarco.org.ar/wp-content/uploads/2026/05/76.75-19-de-Mayo-2026.pdf',
  '2026-06-13',
  'Fuente oficial para CCT 76/75 Construcción. Acuerdo junio-julio-agosto 2026.'
from public.agreements a where a.codigo = 'CON-76-75';

insert into public.agreement_sources (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
select a.id, 'PDF oficial', 'Escala UTHGRA-FEHGRA vigente — UTHGRA Mendoza',
  'https://uthgramendoza.com.ar/wp-content/uploads/2025/01/escala-fehgra-vigente.pdf',
  '2026-06-13',
  'Fuente principal para CCT 389/04 Gastronomía. Tercer tramo abril-junio 2026 categoría B.'
from public.agreements a where a.codigo = 'GAS-389-04';

insert into public.agreement_sources (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
select a.id, 'Imagen oficial', 'Placa salarial ATSA actualización marzo 2026',
  'https://atsa.org.ar/wp-content/uploads/2026/03/Paritarias2026-122-FB-Y-FEED_Atsa_Marzo_2026_1_1.jpg',
  '2026-06-13',
  'Fuente oficial para CCT 122/75 Sanidad. Valores hasta abril 2026.'
from public.agreements a where a.codigo = 'SAN-122-75';

insert into public.agreement_sources (agreement_id, tipo, nombre, url, fecha_consulta, observaciones)
select a.id, 'PDF oficial', 'Planilla salarial FADEEAC Junio 2026',
  'https://www.fadeeac.org.ar/wp-content/uploads/2026/03/Planilla-JUNIO-26.pdf',
  '2026-06-13',
  'Fuente oficial para CCT 40/89 Camioneros. Solo algunos valores quedaron indexados de forma automática.'
from public.agreements a where a.codigo = 'CAM-40-89';

-- =====================================================
-- 6. CONCEPTOS DE LIQUIDACIÓN GLOBALES
-- =====================================================

insert into public.payroll_concepts (
  company_id, codigo, nombre, tipo,
  impacta_bruto, impacta_aportes, impacta_contribuciones, impacta_neto, impacta_f931,
  editable, is_global, orden
) values
(null, '001', 'Sueldo básico', 'remunerativo', true, true, true, true, true, false, true, 1),
(null, '002', 'Adicional antigüedad', 'remunerativo', true, true, true, true, true, true, true, 2),
(null, '003', 'Presentismo', 'remunerativo', true, true, true, true, true, true, true, 3),
(null, '004', 'Horas extra 50%', 'remunerativo', true, true, true, true, true, true, true, 4),
(null, '005', 'Horas extra 100%', 'remunerativo', true, true, true, true, true, true, true, 5),
(null, '006', 'Feriado trabajado (doble)', 'remunerativo', true, true, true, true, true, true, true, 6),
(null, '007', 'Comisiones', 'remunerativo', true, true, true, true, true, true, true, 7),
(null, '008', 'Premios', 'remunerativo', true, true, true, true, true, true, true, 8),
(null, '009', 'Ajuste manual', 'remunerativo', true, false, false, true, false, true, true, 9),
(null, '010', 'Suma no remunerativa (convenio)', 'no_remunerativo', false, false, false, true, false, true, true, 10),
(null, '011', 'SAC (aguinaldo)', 'remunerativo', true, true, true, true, true, true, true, 11),
(null, '012', 'Vacaciones', 'remunerativo', true, true, true, true, true, true, true, 12),
(null, '013', 'Licencia paga', 'remunerativo', true, true, true, true, true, true, true, 13),
(null, 'D01', 'Descuento inasistencias', 'descuento', false, false, false, true, false, false, true, 20),
(null, 'D02', 'Adelanto de sueldo', 'descuento', false, false, false, true, false, true, true, 21),
(null, 'D03', 'Suspensión', 'descuento', false, false, false, true, false, true, true, 22),
(null, 'AP01', 'Jubilación trabajador (11%)', 'descuento', false, false, false, true, true, false, true, 30),
(null, 'AP02', 'Obra social trabajador (3%)', 'descuento', false, false, false, true, true, false, true, 31),
(null, 'AP03', 'PAMI/INSSJP trabajador (3%)', 'descuento', false, false, false, true, true, false, true, 32),
(null, 'AP04', 'Aporte sindical', 'descuento', false, false, false, true, true, true, true, 33),
(null, 'CP01', 'Jubilación patronal (16%)', 'contribucion_patronal', false, false, true, false, true, false, true, 40),
(null, 'CP02', 'Obra social patronal (6%)', 'contribucion_patronal', false, false, true, false, true, false, true, 41),
(null, 'CP03', 'PAMI patronal (2%)', 'contribucion_patronal', false, false, true, false, true, false, true, 42),
(null, 'CP04', 'Fondo Nac. de Empleo (1.5%)', 'contribucion_patronal', false, false, true, false, true, false, true, 43),
(null, 'CP05', 'ART', 'contribucion_patronal', false, false, true, false, false, true, true, 44);

-- =====================================================
-- NOTA FINAL DE SEEDS
-- =====================================================
-- Todos los datos tienen fuente, fecha de actualización y observaciones.
-- Los valores NULL se cargan explícitamente con requires_manual_review = true.
-- No se inventó ningún dato no presente en la investigación.
-- Los básicos de Construcción son inferencia técnica (valor_hora × 176 hs).
-- Los básicos de Gastronomía son del ejemplo oficial Categoría B.
-- Los básicos de Sanidad son de la placa oficial ATSA para abril 2026.
