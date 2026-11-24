begin;
alter table public.companies add column if not exists payment_status text not null default 'pending' check (payment_status in ('pending','paid','overdue'));
alter table public.companies add column if not exists paid_at timestamptz;
drop policy if exists company_admin_insert on public.companies;
create policy company_admin_insert on public.companies for insert to authenticated with check (public.is_admin());
drop policy if exists company_admin_update on public.companies;
create policy company_admin_update on public.companies for update to authenticated using (public.is_admin()) with check (public.is_admin());
grant select,insert,update on public.companies to authenticated;
commit;
