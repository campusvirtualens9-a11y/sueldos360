-- =====================================================
-- SUELDOS 360 — Schema inicial
-- Simulador educativo de liquidación de sueldos
-- =====================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- =====================================================
-- PERFILES DE USUARIO
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- EMPRESAS (máx 2 por usuario)
-- =====================================================
create table if not exists public.companies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  cuit text not null,
  razon_social text not null,
  nombre_fantasia text,
  actividad_principal text,
  condicion_mipyme boolean default false not null,
  domicilio_fiscal text,
  localidad text,
  provincia text default 'Misiones' not null,
  telefono text,
  email text,
  art_simulada text default 'Provincia ART (simulada)',
  obra_social_principal text,
  fecha_inicio_actividad date,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_cuit_per_user unique(user_id, cuit)
);

-- =====================================================
-- EMPLEADOS (máx 10 por empresa)
-- =====================================================
create type employee_status as enum ('activo', 'baja', 'suspendido');
create type jornada_tipo as enum ('completa', 'parcial', 'por_horas');
create type modalidad_tipo as enum ('mensualizado', 'jornalizado', 'quincenal');

create table if not exists public.employees (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  cuil text not null,
  dni text not null,
  apellido text not null,
  nombre text not null,
  fecha_nacimiento date,
  domicilio text,
  telefono text,
  email text,
  estado_civil text,
  cargas_de_familia integer default 0,
  fecha_ingreso date not null,
  fecha_baja date,
  puesto text,
  categoria text,
  agreement_id uuid,
  agreement_category_id uuid,
  jornada jornada_tipo default 'completa' not null,
  modalidad modalidad_tipo default 'mensualizado' not null,
  sueldo_basico numeric(15,2) default 0 not null,
  banco_pago text,
  obra_social text,
  sindicato text,
  status employee_status default 'activo' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- DOCUMENTACIÓN DEL LEGAJO
-- =====================================================
create table if not exists public.employee_files (
  id uuid default uuid_generate_v4() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null unique,
  dni_copia boolean default false,
  cuil_constancia boolean default false,
  alta_temprana boolean default false,
  contrato_designacion boolean default false,
  constancia_domicilio boolean default false,
  ficha_datos_personales boolean default false,
  notas text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- CONVENIOS COLECTIVOS (maestros globales)
-- =====================================================
create type liquidacion_tipo as enum ('mensual', 'jornal', 'hora', 'quincenal');

create table if not exists public.agreements (
  id uuid default uuid_generate_v4() primary key,
  codigo text not null unique,
  nombre text not null,
  numero_cct text not null,
  rubro text not null,
  actividad text,
  jornada_estandar_horas numeric(5,2) default 200,
  tipo_liquidacion liquidacion_tipo default 'mensual',
  antiguedad_porcentaje numeric(5,2),
  presentismo_porcentaje numeric(5,2),
  aporte_sindical_porcentaje numeric(5,2),
  aporte_solidario_porcentaje numeric(5,2),
  region_aplica text default 'nacional',
  fecha_actualizacion date,
  observaciones_educativas text,
  requires_manual_review boolean default false not null,
  is_global boolean default true not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- CATEGORÍAS POR CONVENIO
-- =====================================================
create table if not exists public.agreement_categories (
  id uuid default uuid_generate_v4() primary key,
  agreement_id uuid references public.agreements(id) on delete cascade not null,
  codigo text not null,
  nombre text not null,
  sueldo_basico numeric(15,2),
  horas_referencia numeric(6,2),
  valor_hora numeric(10,4),
  zona text,
  subescala text,
  clase_establecimiento text,
  observaciones text,
  requires_manual_review boolean default false not null,
  educational_note text,
  created_at timestamptz default now() not null,
  constraint unique_code_per_agreement unique(agreement_id, codigo)
);

-- =====================================================
-- ESCALAS POR VIGENCIA
-- =====================================================
create table if not exists public.agreement_scales (
  id uuid default uuid_generate_v4() primary key,
  agreement_id uuid references public.agreements(id) on delete cascade not null,
  category_id uuid references public.agreement_categories(id) on delete cascade,
  vigencia_desde date not null,
  vigencia_hasta date,
  sueldo_basico numeric(15,2),
  valor_hora numeric(10,4),
  zona text,
  fuente_url text,
  requires_manual_review boolean default false not null,
  notas text,
  created_at timestamptz default now() not null
);

-- =====================================================
-- ADICIONALES DEL CONVENIO
-- =====================================================
create type adicional_tipo as enum ('porcentaje', 'fijo', 'formula');

create table if not exists public.agreement_additionals (
  id uuid default uuid_generate_v4() primary key,
  agreement_id uuid references public.agreements(id) on delete cascade not null,
  nombre text not null,
  tipo adicional_tipo default 'porcentaje',
  valor numeric(10,4),
  formula text,
  base_calculo text,
  is_remunerativo boolean default true,
  observaciones text,
  requires_manual_review boolean default false not null,
  created_at timestamptz default now() not null
);

-- =====================================================
-- SUMAS NO REMUNERATIVAS
-- =====================================================
create table if not exists public.agreement_non_remunerative_items (
  id uuid default uuid_generate_v4() primary key,
  agreement_id uuid references public.agreements(id) on delete cascade not null,
  category_id uuid references public.agreement_categories(id) on delete set null,
  concepto text not null,
  monto numeric(15,2),
  vigencia_desde date,
  vigencia_hasta date,
  zona text,
  requires_manual_review boolean default false not null,
  notas text,
  created_at timestamptz default now() not null
);

-- =====================================================
-- FUENTES DOCUMENTALES
-- =====================================================
create table if not exists public.agreement_sources (
  id uuid default uuid_generate_v4() primary key,
  agreement_id uuid references public.agreements(id) on delete cascade not null,
  tipo text not null,
  nombre text not null,
  url text,
  fecha_consulta date default current_date,
  observaciones text,
  created_at timestamptz default now() not null
);

-- =====================================================
-- PARÁMETROS MAESTROS (por empresa)
-- =====================================================
create table if not exists public.legal_parameters (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  codigo text not null,
  nombre text not null,
  valor numeric(10,4) not null,
  descripcion text,
  categoria text not null,
  editable boolean default true not null,
  fuente text,
  requires_manual_review boolean default false not null,
  updated_at timestamptz default now() not null,
  constraint unique_param_per_company unique(company_id, codigo)
);

-- =====================================================
-- CONCEPTOS DE LIQUIDACIÓN
-- =====================================================
create type concepto_tipo as enum ('remunerativo', 'no_remunerativo', 'descuento', 'contribucion_patronal');

create table if not exists public.payroll_concepts (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  tipo concepto_tipo not null,
  impacta_bruto boolean default true,
  impacta_aportes boolean default false,
  impacta_contribuciones boolean default false,
  impacta_neto boolean default true,
  impacta_f931 boolean default false,
  editable boolean default true,
  is_global boolean default false,
  orden integer default 0,
  created_at timestamptz default now() not null
);

-- =====================================================
-- NOVEDADES DEL MES
-- =====================================================
create type novelty_status as enum ('sin_novedades', 'con_novedades', 'pendiente');

create table if not exists public.monthly_novelties (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  periodo text not null,
  dias_trabajados integer default 30 not null,
  inasistencias_justificadas integer default 0,
  inasistencias_injustificadas integer default 0,
  llegadas_tarde integer default 0,
  horas_extra_50 numeric(6,2) default 0,
  horas_extra_100 numeric(6,2) default 0,
  feriados_trabajados integer default 0,
  comisiones numeric(15,2) default 0,
  premios numeric(15,2) default 0,
  adelantos numeric(15,2) default 0,
  licencias_pagas_dias integer default 0,
  licencias_sin_goce_dias integer default 0,
  suspensiones_dias integer default 0,
  vacaciones_dias integer default 0,
  sac_periodo boolean default false,
  ajuste_manual numeric(15,2) default 0,
  observaciones text,
  status novelty_status default 'pendiente',
  confirmed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_novelty_per_employee_period unique(employee_id, periodo)
);

-- =====================================================
-- LIQUIDACIONES (payroll runs)
-- =====================================================
create type payroll_run_type as enum ('mensual','quincenal','jornal','sac','vacaciones','liquidacion_final','ajuste');
create type payroll_run_status as enum ('borrador','calculada','observada','cerrada','rectificada');

create table if not exists public.payroll_runs (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  periodo text not null,
  tipo payroll_run_type default 'mensual' not null,
  status payroll_run_status default 'borrador' not null,
  total_bruto numeric(15,2) default 0,
  total_descuentos numeric(15,2) default 0,
  total_neto numeric(15,2) default 0,
  total_aportes_trabajador numeric(15,2) default 0,
  total_contribuciones_patronales numeric(15,2) default 0,
  total_costo_laboral numeric(15,2) default 0,
  fecha_pago date,
  observaciones text,
  closed_at timestamptz,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- RESULTADOS POR EMPLEADO
-- =====================================================
create table if not exists public.payroll_results (
  id uuid default uuid_generate_v4() primary key,
  payroll_run_id uuid references public.payroll_runs(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  agreement_id uuid references public.agreements(id),
  category_id uuid references public.agreement_categories(id),
  dias_trabajados integer default 30,
  sueldo_basico numeric(15,2) default 0,
  total_remunerativo numeric(15,2) default 0,
  total_no_remunerativo numeric(15,2) default 0,
  total_descuentos numeric(15,2) default 0,
  sueldo_bruto numeric(15,2) default 0,
  sueldo_neto numeric(15,2) default 0,
  total_aportes numeric(15,2) default 0,
  total_contribuciones numeric(15,2) default 0,
  costo_laboral numeric(15,2) default 0,
  observaciones text,
  created_at timestamptz default now() not null
);

-- =====================================================
-- ÍTEMS DE LIQUIDACIÓN
-- =====================================================
create table if not exists public.payroll_result_items (
  id uuid default uuid_generate_v4() primary key,
  payroll_result_id uuid references public.payroll_results(id) on delete cascade not null,
  concept_id uuid references public.payroll_concepts(id),
  concept_codigo text not null,
  concept_nombre text not null,
  concept_tipo concepto_tipo not null,
  cantidad numeric(10,4),
  valor_unitario numeric(15,4),
  importe numeric(15,2) not null,
  is_remunerativo boolean default true,
  orden integer default 0,
  created_at timestamptz default now() not null
);

-- =====================================================
-- RECIBOS DE SUELDO
-- =====================================================
create table if not exists public.payslips (
  id uuid default uuid_generate_v4() primary key,
  payroll_result_id uuid references public.payroll_results(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade not null,
  employee_id uuid references public.employees(id) on delete cascade not null,
  periodo text not null,
  fecha_pago date,
  emitido boolean default false,
  emitido_at timestamptz,
  pdf_url text,
  created_at timestamptz default now() not null
);

-- =====================================================
-- LIBRO DE SUELDOS Y JORNALES
-- =====================================================
create table if not exists public.salary_books (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  payroll_run_id uuid references public.payroll_runs(id) on delete cascade not null,
  periodo text not null,
  exportado boolean default false,
  exportado_at timestamptz,
  created_at timestamptz default now() not null
);

-- =====================================================
-- F.931 SIMULADO
-- =====================================================
create type f931_status as enum ('borrador','presentado','rectificativo','pagado');

create table if not exists public.f931_reports (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade not null,
  periodo text not null,
  payroll_run_ids uuid[] default '{}',
  cuit_empresa text not null,
  razon_social text not null,
  cantidad_empleados integer default 0,
  total_remuneraciones numeric(15,2) default 0,
  total_aportes_jubilatorios numeric(15,2) default 0,
  total_obra_social numeric(15,2) default 0,
  total_pami numeric(15,2) default 0,
  total_otros_aportes numeric(15,2) default 0,
  total_contribuciones_patronales numeric(15,2) default 0,
  art_monto numeric(15,2) default 0,
  total_general numeric(15,2) default 0,
  status f931_status default 'borrador' not null,
  presentado_at timestamptz,
  pagado_at timestamptz,
  observaciones text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- LOGROS / GAMIFICACIÓN
-- =====================================================
create table if not exists public.achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_id uuid references public.companies(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  descripcion text not null,
  icono text default '🏆',
  unlocked_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  constraint unique_achievement_per_user unique(user_id, codigo)
);

-- =====================================================
-- AUDIT LOG
-- =====================================================
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz default now() not null
);

-- =====================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- =====================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers updated_at
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_companies_updated_at before update on public.companies for each row execute procedure public.handle_updated_at();
create trigger set_employees_updated_at before update on public.employees for each row execute procedure public.handle_updated_at();
create trigger set_employee_files_updated_at before update on public.employee_files for each row execute procedure public.handle_updated_at();
create trigger set_novelties_updated_at before update on public.monthly_novelties for each row execute procedure public.handle_updated_at();
create trigger set_payroll_runs_updated_at before update on public.payroll_runs for each row execute procedure public.handle_updated_at();
create trigger set_f931_updated_at before update on public.f931_reports for each row execute procedure public.handle_updated_at();

-- =====================================================
-- FUNCIÓN: crear perfil al registrarse
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- FUNCIÓN: validar límite de empresas (2 por usuario)
-- =====================================================
create or replace function public.check_company_limit()
returns trigger as $$
begin
  if (select count(*) from public.companies where user_id = new.user_id) >= 2 then
    raise exception 'Límite alcanzado: un usuario no puede tener más de 2 empresas (simulador educativo).';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_company_limit
  before insert on public.companies
  for each row execute procedure public.check_company_limit();

-- =====================================================
-- FUNCIÓN: validar límite de empleados (10 por empresa)
-- =====================================================
create or replace function public.check_employee_limit()
returns trigger as $$
begin
  if (select count(*) from public.employees where company_id = new.company_id and status != 'baja') >= 10 then
    raise exception 'Límite alcanzado: una empresa no puede tener más de 10 empleados activos (simulador educativo).';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_employee_limit
  before insert on public.employees
  for each row execute procedure public.check_employee_limit();

-- Índices para rendimiento
create index if not exists idx_companies_user_id on public.companies(user_id);
create index if not exists idx_employees_company_id on public.employees(company_id);
create index if not exists idx_novelties_company_period on public.monthly_novelties(company_id, periodo);
create index if not exists idx_payroll_runs_company_period on public.payroll_runs(company_id, periodo);
create index if not exists idx_payroll_results_run on public.payroll_results(payroll_run_id);
create index if not exists idx_f931_company_period on public.f931_reports(company_id, periodo);
