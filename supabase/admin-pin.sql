-- One-time persistent PIN attempt limit. Run in Supabase SQL Editor.
begin;
create table if not exists public.solve_admin_pin_attempts (
 bucket text primary key, attempts integer not null default 0,
 window_started timestamptz not null default now()
);
alter table public.solve_admin_pin_attempts enable row level security;
revoke all on public.solve_admin_pin_attempts from public,anon,authenticated;
create or replace function public.solve_admin_pin_attempt(p_bucket text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare g public.solve_admin_pin_attempts;b public.solve_admin_pin_attempts;begin
 if p_bucket!~'^[0-9a-f]{64}$' then raise exception 'Invalid attempt bucket';end if;
 insert into public.solve_admin_pin_attempts(bucket) values('_global') on conflict do nothing;
 select * into g from public.solve_admin_pin_attempts where bucket='_global' for update;
 if g.window_started<=now()-interval '15 minutes' then update public.solve_admin_pin_attempts set attempts=0,window_started=now() where bucket='_global' returning * into g;end if;
 if g.attempts>=100 then return jsonb_build_object('allowed',false,'retryAfterSeconds',greatest(1,ceil(extract(epoch from g.window_started+interval '15 minutes'-now()))));end if;
 insert into public.solve_admin_pin_attempts(bucket) values(p_bucket) on conflict do nothing;
 select * into b from public.solve_admin_pin_attempts where bucket=p_bucket for update;
 if b.window_started<=now()-interval '15 minutes' then update public.solve_admin_pin_attempts set attempts=0,window_started=now() where bucket=p_bucket returning * into b;end if;
 if b.attempts>=5 then return jsonb_build_object('allowed',false,'retryAfterSeconds',greatest(1,ceil(extract(epoch from b.window_started+interval '15 minutes'-now()))));end if;
 update public.solve_admin_pin_attempts set attempts=attempts+1 where bucket in ('_global',p_bucket);
 return jsonb_build_object('allowed',true);
end;$$;
revoke all on function public.solve_admin_pin_attempt(text) from public,anon,authenticated;
grant execute on function public.solve_admin_pin_attempt(text) to service_role;
commit;
