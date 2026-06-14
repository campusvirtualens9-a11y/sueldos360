# Mejoras al cálculo de liquidaciones — Sueldos 360

**Fecha:** 2026-06-13  
**Migración:** `006_word_doc_reference_update.sql`

---

## Documentos analizados

| Documento | Tipo | Uso |
|---|---|---|
| `base_referencia_sueldos_cct.xlsx` | Excel (plantilla estructural) | Parámetros de cálculo, estructura de adicionales, vacaciones LCT, conceptos F.931 |
| `Sueldos básicos vigentes de cinco CCT clave en Argentina.docx` | Word (investigación) | Sueldos básicos verificados por CCT, jornales UOCRA, fórmulas de conversión, viáticos Camioneros, antigüedad Sanidad |

### Hojas del Excel utilizadas
- `Parametros_Calculo` — porcentajes de aportes, presentismo, antigüedad, sindical por CCT
- `CCT_Escalas` — estructura de categorías (sin valores: plantilla vacía)
- `Vacaciones_LCT` — tabla de días por antigüedad (ya estaba correcta)
- `Conceptos_F931` — mapeo de conceptos a F.931 (referencia)
- `Convenios` — alcance, modalidad y horas base por CCT

### Datos del Word utilizados
- Tabla resumen de básicos verificados por CCT
- Escalas detalladas Comercio (junio 2026, FAECYS)
- Jornales UOCRA Zona A (mayo 2026, acuerdo CAMARCO)
- Categorías Gastronomía subescala B (junio 2026, UTHGRA CABA)
- Categorías Sanidad (abril 2026, FATSA/ATSA)
- Planilla Camioneros (junio 2026, FedCam)
- Viáticos y adicionales Camioneros (comida, viático especial, pernoctada)
- Fórmulas de conversión jornal → hora → mensual por convenio

---

## Convenios incorporados o mejorados

### 1. Comercio CCT 130/75
- **Estado:** Verificado ✓ (junio 2026)
- **Fuente:** FAECYS Circular escalas salariales abril-julio 2026
- **Categorías actualizadas:**
  | Código | Nombre | Básico junio 2026 |
  |---|---|---|
  | COM-MA-A | Maestranza A | $1.113.585,00 |
  | COM-MA-B | Maestranza B | $1.116.794,00 (nuevo) |
  | COM-MA-C | Maestranza C | $1.128.038,00 (nuevo) |
  | COM-AD-A | Administrativos A | $1.125.631,00 |
  | COM-AD-B | Administrativos B | $1.130.454,00 (nuevo) |
  | COM-VEN-A | Vendedores A | $1.129.646,00 |
  | COM-CAJ-A | Cajeros A | $1.129.646,00 |
  | COM-AUX-A | Auxiliar Especializado A | $1.139.287,00 |
- **Sin cambios en parámetros:** presentismo 8,33%, antigüedad 1%/año, sindical 2%

### 2. Construcción CCT 76/75
- **Estado:** Revisión manual ⚠️ (mayo 2026 — sin escala junio 2026 localizada)
- **Fuente:** Acuerdo UOCRA/CAMARCO 2026-04-30
- **CORRECCIÓN CRÍTICA:** El seed anterior usaba el jornal diario como valor_hora (error ×8). Ahora: `valor_hora = jornal / 8`; `sueldo_basico_ref = jornal × 25`
- **Categorías actualizadas (Zona A, mayo 2026):**
  | Código | Nombre | Jornal/día | Mensual ref. | Valor hora |
  |---|---|---|---|---|
  | CON-AYU-A | Ayudante | $4.452 | $111.300 | $556,50 |
  | CON-MED-A | Medio Oficial | $4.837 | $120.925 | $604,63 |
  | CON-OFI-A | Oficial | $5.235 | $130.875 | $654,38 |
  | CON-OE-A | Oficial Especializado | $6.119 | $152.975 | $764,88 |
  | CON-SER-A | Sereno | — | $808.877 | $4.044,39 |
- **SNR junio 2026 Zona A (confirmados):** OE +$63.300 / Oficial +$58.300 / Medio Oficial +$53.400 / Ayudante +$50.300
- **Sin cambios en parámetros:** presentismo 20%, aporte sindical actualizado a 2,5%

### 3. Gastronomía CCT 389/04
- **Estado:** Revisión manual ⚠️ (escala UTHGRA CABA — verificar interior/otras subescalas)
- **Fuente:** UTHGRA CABA tercer tramo 2025-2026 (2026-04-07)
- **Categorías nuevas (subescala B, junio 2026):**
  | Código | Nombre | Básico |
  |---|---|---|
  | GAS-P6-B | Punto 6 — Cat. B (jefes de cocina, maître) | $1.384.689,00 |
  | GAS-P7-B | Punto 7 — Cat. B (chef ejecutivo, jefe recepción) | $1.538.297,00 |
- **Parámetros corregidos:** aporte sindical UTHGRA 2% → **2,5%**
- **Adicional nuevo:** Plus CABA 15% (requiere revisión — solo para establecimientos CABA)

### 4. Sanidad CCT 122/75
- **Estado:** Revisión manual ⚠️ (abril 2026 — pendiente revisión post-mayo 2026)
- **Fuente:** FATSA/ATSA Acuerdo marzo 2026 (2026-03-30)
- **CORRECCIÓN CRÍTICA:** `antigüedad_porcentaje` 1% → **2% por año** (art. 10 CCT 122/75 texto completo)
- **CORRECCIÓN:** SAN-A1 valor $1.327.187,59 → **$1.372.187,59** (según Word doc)
- **Categorías nuevas:**
  | Código | Nombre | Básico abril 2026 |
  |---|---|---|
  | SAN-ENF-P | Enfermero/a de piso / consultorios externos | $1.160.387,33 |
  | SAN-MUC-P | Mucama de piso / consultorios / geriátricos | $981.730,08 |
  | SAN-ADM-3 | Administrativo/a de tercera | $1.034.595,93 |
  | SAN-CAD | Cadete | $922.472,96 |

### 5. Camioneros CCT 40/89
- **Estado:** Verificado ✓ (junio 2026)
- **Fuente:** FedCam Planilla de sueldos junio 2026 (publicada 2026-06-05)
- **CORRECCIÓN:** `jornada_estandar_horas` 200 → **192** (FedCam: mensual / 24 días / 8 hs = mensual / 192)
- **Categorías verificadas / actualizadas:**
  | Código | Nombre | Básico junio 2026 |
  |---|---|---|
  | CAM-PEO-BL | Peones generales (ya existía) | $928.919,73 ✓ |
  | CAM-OPS | Operador de servicios (corregido) | $1.082.223,10 |
  | CAM-CHO1 | Conductor de primera categoría (nuevo) | $1.017.089,13 |
  | CAM-ADM1 | Personal administrativo primera (nuevo) | $1.012.138,40 |
  | CAM-OFT | Oficial completo de taller (nuevo) | $1.074.073,30 |
- **Viáticos NR junio 2026 (nuevos en DB):**
  - Comida: $15.563,09
  - Viático especial: $7.809,53
  - Pernoctada: $18.126,68
  - Viático larga distancia: $81,37/km (editable, no en NR items)
  - Permanencia fuera de residencia: $54.924,39 (editable)
- **Aporte sindical:** 3% (según Excel)

---

## Fórmulas ajustadas

| Fórmula | Antes | Después |
|---|---|---|
| Valor hora jornalizado | `sueldo_basico / horas_mensuales` | `sueldo_basico / (25 × 8) = sueldo_basico / 200` |
| Horas extra jornalizado | Usaba `horas_mensuales (176)` | Usa divisor 200 para valor hora base |
| Feriados jornalizado | `sueldo_basico / dias_base (30)` | `sueldo_basico / divisor (25)` = jornal correcto |
| Inasistencias jornalizado | `sueldo_basico / dias_base (30)` | `sueldo_basico / divisor (25)` = jornal correcto |
| Valor hora Camioneros | `sueldo_basico / 200` | `sueldo_basico / 192` (desde jornada_estandar_horas=192) |
| Suma no remunerativa | Hardcodeado en 0 | Suma desde `agreement_non_remunerative_items` de la DB |
| Sanidad antigüedad | 1% por año | **2% por año** (art. 10 CCT 122/75) |

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `supabase/migrations/006_word_doc_reference_update.sql` | Migración nueva con todos los datos actualizados |
| `src/lib/calculations/payroll.ts` | Corrección valor hora jornalizado, divisor por modalidad, NR items |
| `src/app/dashboard/liquidacion/page.tsx` | Fetch de `agreement_non_remunerative_items` |
| `src/app/dashboard/liquidacion/LiquidacionClient.tsx` | Función `getNrTotal()`, prop `nrItems`, uso en cálculo |

---

## Valores editables y requieren revisión manual

### Verificados ✓ (sin revisión requerida)
- Todos los básicos de Comercio junio 2026
- Peones Camioneros (ya estaba)
- Todas las nuevas categorías Camioneros junio 2026
- Viáticos Camioneros junio 2026
- Parámetros legales generales (jubilación 11%, obra social 3%, PAMI 3%)

### Revisión manual requerida ⚠️
- Todos los básicos de Construcción (mayo 2026, sin junio localizado)
- Todos los básicos de Gastronomía (escala UTHGRA CABA — verificar interior)
- Plus CABA Gastronomía (15%)
- Todos los básicos de Sanidad (abril 2026 — pendiente revisión post-mayo)
- Antigüedad Gastronomía (rango 1%-14% sin tabla anual completa)
- Presentismo Sanidad (8% — porcentaje referencial)
- Presentismo Camioneros (NULL — no encontrado en planilla general)
- Viático larga distancia Camioneros (por km — requiere gestión manual)

---

## Cómo probar una liquidación de ejemplo

### Caso 1 — Comercio, mensualizado
1. Crear empleado → Convenio: Comercio CCT 130/75 → Categoría: Maestranza A
2. Novedades: 30 días trabajados
3. Esperado: básico ≈ $1.113.585 → presentismo ≈ $92.798 → neto ≈ bruto - aportes

### Caso 2 — Construcción, jornalizado
1. Crear empleado → Convenio: Construcción UOCRA → Categoría: Oficial Zona A → Modalidad: Jornalizado
2. Novedades: 25 días trabajados, 4 horas extra 50%
3. Esperado: básico ≈ $130.875 (jornal $5.235 × 25) → HE50% = $5.235/8 × 1.5 × 4 → SNR ≈ $58.300

### Caso 3 — Gastronomía con presentismo
1. Empleado → GAS-P3-B → 0 inasistencias
2. Esperado: presentismo = básico × 10%

### Caso 4 — Sanidad con antigüedad
1. Empleado con 5 años de antigüedad → SAN-ENF-P
2. Esperado: antigüedad = $1.160.387,33 × 2% × 5 = $116.038,73

### Caso 5 — Camioneros con viáticos
1. Empleado → CAM-CHO1 → Modalidad: mensualizado
2. DB tiene viáticos NR activos: comida $15.563 + viático especial $7.809 + pernoctada $18.126
3. Esperado: básico $1.017.089 + NR $41.498 en recibo

---

## Limitaciones pendientes

1. **Construcción** — No hay escala oficial UOCRA junio 2026 en fuentes públicas consultadas
2. **Sanidad** — Sin escala posterior a abril 2026 (revisión comprometida para mayo no localizada)
3. **Gastronomía** — Solo subescala B (CABA); no incluye A, Especial, ni escalas del interior
4. **Camioneros** — Viático por km requiere input manual (no automatizable sin registro de ruta)
5. **Camioneros** — Muchas categorías de ramas especializadas no incluidas
6. **General** — Sin cálculo de retención de Ganancias 4a categoría (excede scope educativo actual)
7. **Migraciones** — Migrations 001-006 deben aplicarse manualmente en Supabase Dashboard → SQL Editor (el proyecto `qjyfdunhzwprusnlqxzr` no es accesible por MCP en esta cuenta)

---

> Todos los valores son de referencia para simulación educativa.  
> Revisar vigencia antes de usar en liquidación real.
