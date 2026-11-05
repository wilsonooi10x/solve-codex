-- Run after setup.sql. Shared trials start DISABLED with zero budget.
begin;
create table if not exists public.solve_trial_settings (
 id text primary key check(id='main'), enabled boolean not null default false,
 eligibility text not null default 'approved' check(eligibility in ('approved','all')),
 event_budget_micros bigint not null default 0 check(event_budget_micros>=0),
 account_budget_micros bigint not null default 0 check(account_budget_micros>=0),
 spent_micros bigint not null default 0 check(spent_micros>=0),
 held_micros bigint not null default 0 check(held_micros>=0),
 input_rate numeric not null default 0 check(input_rate>=0),
 output_rate numeric not null default 0 check(output_rate>=0),
 revision bigint not null default 1
);
insert into public.solve_trial_settings(id) values('main') on conflict do nothing;
create table if not exists public.solve_trial_wallets (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 email text not null, remaining integer not null default 100 check(remaining between 0 and 100),
 spent_micros bigint not null default 0 check(spent_micros>=0),
 held_micros bigint not null default 0 check(held_micros>=0),
 granted_at timestamptz not null default now()
);
create table if not exists public.solve_trial_requests (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
 fingerprint text not null, state text not null check(state in ('pending','succeeded','failed')),
 reserved_micros bigint not null check(reserved_micros>0),
 input_rate numeric not null, output_rate numeric not null,
 cost_micros bigint, result jsonb, failure text,
 created_at timestamptz not null default now(), finished_at timestamptz
);
create index if not exists solve_trial_pending on public.solve_trial_requests(owner_id,state,created_at);
alter table public.solve_trial_settings enable row level security;
alter table public.solve_trial_wallets enable row level security;
alter table public.solve_trial_requests enable row level security;
revoke all on public.solve_trial_settings,public.solve_trial_wallets,public.solve_trial_requests from anon,authenticated;
grant select,insert,update on public.solve_trial_settings,public.solve_trial_wallets,public.solve_trial_requests to service_role;

create or replace function public.solve_trial_configure(p_revision bigint,p_enabled boolean,p_policy text,p_event bigint,p_account bigint,p_input numeric,p_output numeric)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_trial_settings;begin
 select * into s from public.solve_trial_settings where id='main' for update;
 if not found then raise exception 'Trial controls are missing.';end if;
 if s.revision<>p_revision then raise exception 'Controls changed. Refresh before saving.';end if;
 if p_event<s.spent_micros+s.held_micros or p_account<0 or p_policy not in ('approved','all') or p_input<0 or p_output<0 or p_event>1000000000 or p_account>100000000 then raise exception 'Invalid trial budget or policy.';end if;
 if p_enabled and (p_event<=0 or p_account<=0 or p_input<=0 or p_output<=0) then raise exception 'Set positive budgets and verified model prices before enabling trials.';end if;
 update public.solve_trial_settings set enabled=p_enabled,eligibility=p_policy,event_budget_micros=p_event,account_budget_micros=p_account,input_rate=p_input,output_rate=p_output,revision=revision+1 where id='main' returning * into s;
 return to_jsonb(s);end;$$;

create or replace function public.solve_trial_approve(p_users jsonb)
returns integer language plpgsql security definer set search_path=public as $$
declare n integer;begin
 if jsonb_typeof(p_users)<>'array' or jsonb_array_length(p_users)>300 then raise exception 'Approve at most 300 existing accounts at a time.';end if;
 insert into public.solve_trial_wallets(owner_id,email)
 select (u->>'id')::uuid,lower(u->>'email') from jsonb_array_elements(p_users) u
 on conflict(owner_id) do nothing;get diagnostics n=row_count;return n;end;$$;

create or replace function public.solve_trial_approve_emails(p_emails text[])
returns jsonb language plpgsql security definer set search_path=public as $$
declare added integer;matched integer;missing jsonb;begin
 if coalesce(array_length(p_emails,1),0) not between 1 and 300 then raise exception 'Approve between 1 and 300 participant emails.';end if;
 insert into public.solve_trial_wallets(owner_id,email)
 select u.id,lower(u.email) from auth.users u where lower(u.email)=any(p_emails)
 on conflict(owner_id) do nothing;get diagnostics added=row_count;
 select count(*) into matched from auth.users where lower(email)=any(p_emails);
 select coalesce(jsonb_agg(e),'[]'::jsonb) into missing from unnest(p_emails) e where not exists(select 1 from auth.users u where lower(u.email)=e);
 return jsonb_build_object('added',added,'matched',matched,'notFound',missing);
end;$$;

create or replace function public.solve_trial_balance(p_user uuid,p_email text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_trial_settings;w public.solve_trial_wallets;r public.solve_trial_requests;begin
 select * into s from public.solve_trial_settings where id='main' for update;
 if not found then raise exception 'Trial controls are missing.';end if;
 if s.enabled and s.eligibility='all' then insert into public.solve_trial_wallets(owner_id,email) values(p_user,lower(p_email)) on conflict do nothing;end if;
 select * into w from public.solve_trial_wallets where owner_id=p_user for update;
 if w.owner_id is null then return jsonb_build_object('eligible',false,'enabled',s.enabled,'remaining',0,'accountBudgetMicros',s.account_budget_micros);end if;
 -- A crashed function cannot leave a participant turn locked forever. Keep its possible provider cost reserved as spent.
 for r in select * from public.solve_trial_requests where owner_id=p_user and state='pending' and created_at<now()-interval '10 minutes' for update loop
  update public.solve_trial_requests set state='failed',cost_micros=reserved_micros,failure='An interrupted request was released. Your turn was returned; please try again.',finished_at=now() where id=r.id;
  update public.solve_trial_wallets set remaining=remaining+1,held_micros=held_micros-r.reserved_micros where owner_id=p_user;
  update public.solve_trial_settings set spent_micros=spent_micros+r.reserved_micros,held_micros=held_micros-r.reserved_micros where id='main';
 end loop;
 select * into w from public.solve_trial_wallets where owner_id=p_user;select * into s from public.solve_trial_settings where id='main';
 return jsonb_build_object('eligible',true,'enabled',s.enabled,'remaining',w.remaining,'pending',(select count(*) from public.solve_trial_requests where owner_id=p_user and state='pending'),'accountBudgetMicros',s.account_budget_micros,'accountUsedMicros',w.spent_micros,'accountHeldMicros',w.held_micros,'eventAvailable',s.event_budget_micros>s.spent_micros+s.held_micros);
end;$$;

create or replace function public.solve_trial_reserve(p_user uuid,p_email text,p_id uuid,p_fingerprint text,p_input_bound integer,p_output_bound integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_trial_settings;w public.solve_trial_wallets;r public.solve_trial_requests;cost bigint;begin
 perform public.solve_trial_balance(p_user,p_email);
 select * into s from public.solve_trial_settings where id='main' for update;
 if not found then raise exception 'Trial controls are missing.';end if;
 select * into r from public.solve_trial_requests where id=p_id;
 if r.id is not null then
  if r.owner_id<>p_user or r.fingerprint<>p_fingerprint then return jsonb_build_object('state','conflict','error','This request ID belongs to a different answer. Please send again.');end if;
  return jsonb_build_object('state',r.state,'result',r.result,'error',r.failure);
 end if;
 if not s.enabled then return jsonb_build_object('state','blocked','error','10XSC trial usage is paused. Your saved work remains available.');end if;
 select * into w from public.solve_trial_wallets where owner_id=p_user for update;
 if w.owner_id is null then return jsonb_build_object('state','blocked','error','This account is awaiting facilitator trial approval.');end if;
 if w.remaining<=0 then return jsonb_build_object('state','blocked','error','Your 100 trial turns have been used. Personal API connections remain available; paid top-ups are not enabled yet.');end if;
 if exists(select 1 from public.solve_trial_requests where owner_id=p_user and state='pending') then return jsonb_build_object('state','pending','error','Another turn is still processing on this account. Please wait before sending again.');end if;
 if (select count(*) from public.solve_trial_requests where owner_id=p_user and created_at>now()-interval '1 minute')>=6 then return jsonb_build_object('state','blocked','error','Please wait a minute before sending more trial requests.');end if;
 if p_input_bound<1 or p_input_bound>200000 or p_output_bound<1 or p_output_bound>1800 or length(p_fingerprint)<>64 or s.input_rate<=0 or s.output_rate<=0 then raise exception 'Invalid trial request or model price configuration.';end if;
 cost=ceil(p_input_bound*s.input_rate+p_output_bound*s.output_rate);
 if w.spent_micros+w.held_micros+cost>s.account_budget_micros then return jsonb_build_object('state','blocked','error','Your trial cost allowance cannot cover this turn. Try a shorter answer or ask the facilitator.');end if;
 if s.spent_micros+s.held_micros+cost>s.event_budget_micros then return jsonb_build_object('state','blocked','error','The event trial budget is used or reserved by other requests. Please wait or ask the facilitator.');end if;
 insert into public.solve_trial_requests(id,owner_id,fingerprint,state,reserved_micros,input_rate,output_rate) values(p_id,p_user,p_fingerprint,'pending',cost,s.input_rate,s.output_rate);
 update public.solve_trial_wallets set remaining=remaining-1,held_micros=held_micros+cost where owner_id=p_user;
 update public.solve_trial_settings set held_micros=held_micros+cost where id='main';
 return jsonb_build_object('state','reserved','reservedMicros',cost,'inputRate',s.input_rate,'outputRate',s.output_rate);
end;$$;

create or replace function public.solve_trial_finish(p_user uuid,p_id uuid,p_success boolean,p_cost bigint,p_result jsonb,p_error text,p_pause boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_trial_settings;r public.solve_trial_requests;cost bigint;begin
 select * into s from public.solve_trial_settings where id='main' for update;
 if not found then raise exception 'Trial controls are missing.';end if;
 perform 1 from public.solve_trial_wallets where owner_id=p_user for update;
 select * into r from public.solve_trial_requests where id=p_id for update;
 if r.id is null or r.owner_id<>p_user then raise exception 'Unknown trial request.';end if;
 if r.state<>'pending' then return jsonb_build_object('state',r.state);end if;
 if p_cost<0 or p_cost>r.reserved_micros then raise exception 'Invalid settlement amount.';end if;
 if p_success and (p_result is null or jsonb_typeof(p_result)<>'object' or octet_length(p_result::text)>100000) then raise exception 'Invalid trial result.';end if;
 cost=coalesce(p_cost,r.reserved_micros);
 update public.solve_trial_requests set state=case when p_success then 'succeeded' else 'failed' end,cost_micros=cost,result=case when p_success then p_result else null end,failure=case when p_success then null else left(coalesce(p_error,'This turn failed. Your trial turn was returned.'),1000) end,finished_at=now() where id=p_id;
 update public.solve_trial_wallets set remaining=remaining+case when p_success then 0 else 1 end,spent_micros=spent_micros+case when p_success then cost else 0 end,held_micros=held_micros-r.reserved_micros where owner_id=p_user;
 update public.solve_trial_settings set spent_micros=spent_micros+cost,held_micros=held_micros-r.reserved_micros,enabled=case when p_pause then false else enabled end where id='main';
 return jsonb_build_object('state',case when p_success then 'succeeded' else 'failed' end);
end;$$;

revoke all on function public.solve_trial_configure(bigint,boolean,text,bigint,bigint,numeric,numeric),public.solve_trial_approve(jsonb),public.solve_trial_approve_emails(text[]),public.solve_trial_balance(uuid,text),public.solve_trial_reserve(uuid,text,uuid,text,integer,integer),public.solve_trial_finish(uuid,uuid,boolean,bigint,jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.solve_trial_configure(bigint,boolean,text,bigint,bigint,numeric,numeric),public.solve_trial_approve(jsonb),public.solve_trial_approve_emails(text[]),public.solve_trial_balance(uuid,text),public.solve_trial_reserve(uuid,text,uuid,text,integer,integer),public.solve_trial_finish(uuid,uuid,boolean,bigint,jsonb,text,boolean) to service_role;

commit;
