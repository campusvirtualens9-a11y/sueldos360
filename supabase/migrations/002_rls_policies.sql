-- =====================================================
-- SUELDOS 360 — Row Level Security
-- =====================================================

-- Activar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.employee_files enable row level security;
alter table public.agreements enable row level security;
alter table public.agreement_categories enable row level security;
alter table public.agreement_scales enable row level security;
alter table public.agreement_additionals enable row level security;
alter table public.agreement_non_remunerative_items enable row level security;
alter table public.agreement_sources enable row level security;
alter table public.legal_parameters enable row level security;
alter table public.payroll_concepts enable row level security;
alter table public.monthly_novelties enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_results enable row level security;
alter table public.payroll_result_items enable row level security;
alter table public.payslips enable row level security;
alter table public.salary_books enable row level security;
alter table public.f931_reports enable row level security;
alter table public.achievements enable row level security;
alter table public.audit_logs enable row level security;

-- =====================================================
-- PROFILES
-- =====================================================
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- =====================================================
-- COMPANIES
-- =====================================================
create policy "Users can view own companies"
  on public.companies for select
  using (auth.uid() = user_id);

create policy "Users can insert own companies"
  on public.companies for insert
  with check (auth.uid() = user_id);

create policy "Users can update own companies"
  on public.companies for update
  using (auth.uid() = user_id);

create policy "Users can delete own companies"
  on public.companies for delete
  using (auth.uid() = user_id);

-- =====================================================
-- EMPLOYEES
-- =====================================================
create policy "Users can view employees of own companies"
  on public.employees for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = employees.company_id and c.user_id = auth.uid()
    )
  );

create policy "Users can insert employees in own companies"
  on public.employees for insert
  with check (
    exists (
      select 1 from public.companies c
      where c.id = employees.company_id and c.user_id = auth.uid()
    )
  );

create policy "Users can update employees in own companies"
  on public.employees for update
  using (
    exists (
      select 1 from public.companies c
      where c.id = employees.company_id and c.user_id = auth.uid()
    )
  );

create policy "Users can delete employees in own companies"
  on public.employees for delete
  using (
    exists (
      select 1 from public.companies c
      where c.id = employees.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- EMPLOYEE FILES
-- =====================================================
create policy "Users can view employee files of own companies"
  on public.employee_files for select
  using (
    exists (
      select 1 from public.employees e
      join public.companies c on c.id = e.company_id
      where e.id = employee_files.employee_id and c.user_id = auth.uid()
    )
  );

create policy "Users can manage employee files of own companies"
  on public.employee_files for all
  using (
    exists (
      select 1 from public.employees e
      join public.companies c on c.id = e.company_id
      where e.id = employee_files.employee_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- AGREEMENTS (convenios maestros — lectura global)
-- =====================================================
create policy "Anyone authenticated can view global agreements"
  on public.agreements for select
  using (auth.role() = 'authenticated' and is_global = true);

create policy "Users can view own agreements"
  on public.agreements for select
  using (auth.uid() = created_by);

create policy "Users can insert own agreements"
  on public.agreements for insert
  with check (auth.uid() = created_by and is_global = false);

create policy "Users can update own agreements"
  on public.agreements for update
  using (auth.uid() = created_by and is_global = false);

-- =====================================================
-- AGREEMENT CATEGORIES
-- =====================================================
create policy "Authenticated can view categories of global agreements"
  on public.agreement_categories for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.agreements a
      where a.id = agreement_categories.agreement_id
    )
  );

create policy "Users can manage categories of own agreements"
  on public.agreement_categories for all
  using (
    exists (
      select 1 from public.agreements a
      where a.id = agreement_categories.agreement_id
      and (a.is_global = true or a.created_by = auth.uid())
    )
  );

-- =====================================================
-- AGREEMENT SCALES
-- =====================================================
create policy "Authenticated can view scales"
  on public.agreement_scales for select
  using (auth.role() = 'authenticated');

-- =====================================================
-- AGREEMENT ADDITIONALS
-- =====================================================
create policy "Authenticated can view additionals"
  on public.agreement_additionals for select
  using (auth.role() = 'authenticated');

-- =====================================================
-- AGREEMENT NON REMUNERATIVE ITEMS
-- =====================================================
create policy "Authenticated can view non remunerative items"
  on public.agreement_non_remunerative_items for select
  using (auth.role() = 'authenticated');

-- =====================================================
-- AGREEMENT SOURCES
-- =====================================================
create policy "Authenticated can view sources"
  on public.agreement_sources for select
  using (auth.role() = 'authenticated');

-- =====================================================
-- LEGAL PARAMETERS
-- =====================================================
create policy "Users can view own company parameters"
  on public.legal_parameters for select
  using (
    exists (
      select 1 from public.companies c
      where c.id = legal_parameters.company_id and c.user_id = auth.uid()
    )
  );

create policy "Users can manage own company parameters"
  on public.legal_parameters for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = legal_parameters.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYROLL CONCEPTS
-- =====================================================
create policy "Authenticated can view global concepts"
  on public.payroll_concepts for select
  using (auth.role() = 'authenticated' and (is_global = true or company_id is null));

create policy "Users can view own company concepts"
  on public.payroll_concepts for select
  using (
    company_id is not null and
    exists (
      select 1 from public.companies c
      where c.id = payroll_concepts.company_id and c.user_id = auth.uid()
    )
  );

create policy "Users can manage own company concepts"
  on public.payroll_concepts for all
  using (
    company_id is not null and
    exists (
      select 1 from public.companies c
      where c.id = payroll_concepts.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- MONTHLY NOVELTIES
-- =====================================================
create policy "Users can manage novelties of own companies"
  on public.monthly_novelties for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = monthly_novelties.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYROLL RUNS
-- =====================================================
create policy "Users can manage payroll runs of own companies"
  on public.payroll_runs for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = payroll_runs.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYROLL RESULTS
-- =====================================================
create policy "Users can view payroll results of own companies"
  on public.payroll_results for all
  using (
    exists (
      select 1 from public.payroll_runs pr
      join public.companies c on c.id = pr.company_id
      where pr.id = payroll_results.payroll_run_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYROLL RESULT ITEMS
-- =====================================================
create policy "Users can view result items of own companies"
  on public.payroll_result_items for all
  using (
    exists (
      select 1 from public.payroll_results pr2
      join public.payroll_runs pr on pr.id = pr2.payroll_run_id
      join public.companies c on c.id = pr.company_id
      where pr2.id = payroll_result_items.payroll_result_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- PAYSLIPS
-- =====================================================
create policy "Users can manage payslips of own companies"
  on public.payslips for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = payslips.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- SALARY BOOKS
-- =====================================================
create policy "Users can manage salary books of own companies"
  on public.salary_books for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = salary_books.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- F931 REPORTS
-- =====================================================
create policy "Users can manage f931 of own companies"
  on public.f931_reports for all
  using (
    exists (
      select 1 from public.companies c
      where c.id = f931_reports.company_id and c.user_id = auth.uid()
    )
  );

-- =====================================================
-- ACHIEVEMENTS
-- =====================================================
create policy "Users can view own achievements"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own achievements"
  on public.achievements for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- AUDIT LOGS
-- =====================================================
create policy "Users can view own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);
