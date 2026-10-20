-- Run once in the Supabase SQL Editor for this app's project.
create table if not exists public.solve_records (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (length(id) between 1 and 200),
  kind text not null check (kind in ('problem','business')),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 500000),
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  primary key (owner_id,id)
);
alter table public.solve_records enable row level security;
revoke all on public.solve_records from anon;
revoke all on public.solve_records from authenticated;
grant select, insert, update on public.solve_records to authenticated;
drop policy if exists "Read own SOLVE records" on public.solve_records;
create policy "Read own SOLVE records" on public.solve_records for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Insert own SOLVE records" on public.solve_records;
create policy "Insert own SOLVE records" on public.solve_records for insert to authenticated with check ((select auth.uid()) = owner_id and revision = 1);
drop policy if exists "Update own SOLVE records" on public.solve_records;
create policy "Update own SOLVE records" on public.solve_records for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create or replace function public.solve_revision_guard() returns trigger language plpgsql set search_path = public as $$
begin
 if new.owner_id <> old.owner_id or new.id <> old.id or new.kind <> old.kind then
   raise exception 'Record identity cannot change';
 end if;
 new.revision := old.revision + 1;
 new.updated_at := now();
 return new;
end; $$;
drop trigger if exists solve_revision_guard on public.solve_records;
create trigger solve_revision_guard before update on public.solve_records for each row execute function public.solve_revision_guard();
