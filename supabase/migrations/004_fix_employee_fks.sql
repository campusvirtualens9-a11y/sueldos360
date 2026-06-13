-- =====================================================
-- Sueldos 360 — Agregar FK explícitas a employees
-- Los campos agreement_id y agreement_category_id
-- quedaron sin referencia en la migración inicial.
-- Esto permite que PostgREST resuelva los joins.
-- =====================================================

alter table public.employees
  add constraint if not exists employees_agreement_id_fkey
    foreign key (agreement_id)
    references public.agreements(id)
    on delete set null,
  add constraint if not exists employees_agreement_category_id_fkey
    foreign key (agreement_category_id)
    references public.agreement_categories(id)
    on delete set null;
