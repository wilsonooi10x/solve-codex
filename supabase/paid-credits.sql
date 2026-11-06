-- Run AFTER credits.sql. Sandbox replies are separate from trial allowances.
-- This migration never enables purchases or paid AI automatically.
begin;
create table if not exists public.solve_paid_settings (
 id text primary key check(id='main'), enabled boolean not null default false,
 budget_micros bigint not null default 0 check(budget_micros>=0),
 spent_micros bigint not null default 0 check(spent_micros>=0),
 held_micros bigint not null default 0 check(held_micros>=0), revision bigint not null default 1
);
insert into public.solve_paid_settings(id) values('main') on conflict do nothing;
create table if not exists public.solve_paid_wallets (
 owner_id uuid primary key references auth.users(id), remaining integer not null default 0 check(remaining>=0),
 frozen boolean not null default false
);
create table if not exists public.solve_paid_payment_flags (
 payment_intent text primary key, revoked boolean not null default false
);
create table if not exists public.solve_paid_orders (
 id uuid primary key, owner_id uuid not null references auth.users(id), price_id text not null,
 session_id text unique, payment_intent text unique, state text not null default 'pending' check(state in ('pending','fulfilled','review')),
 created_at timestamptz not null default now(), fulfilled_at timestamptz
);
create index if not exists solve_paid_orders_owner on public.solve_paid_orders(owner_id,created_at);
create table if not exists public.solve_paid_requests (
 id uuid primary key, owner_id uuid not null references auth.users(id), fingerprint text not null,
 state text not null check(state in ('pending','succeeded','failed')), reserved_micros bigint not null check(reserved_micros>0),
 input_rate numeric not null, output_rate numeric not null, cost_micros bigint, result jsonb, failure text,
 created_at timestamptz not null default now(), finished_at timestamptz
);
create index if not exists solve_paid_pending on public.solve_paid_requests(owner_id,state,created_at);
alter table public.solve_paid_payment_flags enable row level security;
alter table public.solve_paid_settings enable row level security;
alter table public.solve_paid_wallets enable row level security;
alter table public.solve_paid_orders enable row level security;
alter table public.solve_paid_requests enable row level security;
revoke all on public.solve_paid_payment_flags,public.solve_paid_settings,public.solve_paid_wallets,public.solve_paid_orders,public.solve_paid_requests from public,anon,authenticated;
grant select,insert,update on public.solve_paid_payment_flags,public.solve_paid_settings,public.solve_paid_wallets,public.solve_paid_orders,public.solve_paid_requests to service_role;

create or replace function public.solve_paid_configure(p_revision bigint,p_enabled boolean,p_budget bigint)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_paid_settings;begin
 select * into s from public.solve_paid_settings where id='main' for update;
 if s.id is null or s.revision<>p_revision then raise exception 'Reload paid controls before saving.';end if;
 if p_budget<s.spent_micros+s.held_micros or p_budget>1000000000 or (p_enabled and p_budget<=0) then raise exception 'Invalid paid testing budget.';end if;
 if p_enabled and not exists(select 1 from public.solve_trial_settings where id='main' and input_rate>0 and output_rate>0) then raise exception 'Verify model prices in trial controls first.';end if;
 update public.solve_paid_settings set enabled=p_enabled,budget_micros=p_budget,revision=revision+1 where id='main' returning * into s;
 return to_jsonb(s);end;$$;

create or replace function public.solve_paid_order(p_user uuid,p_id uuid,p_price text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_paid_settings;o public.solve_paid_orders;begin
 select * into s from public.solve_paid_settings where id='main' for update;
 select * into o from public.solve_paid_orders where id=p_id;
 if o.id is not null then
  if o.owner_id<>p_user or o.price_id<>p_price then raise exception 'Order belongs to a different account or package.';end if;
  return to_jsonb(o);
 end if;
 if not s.enabled or s.budget_micros<=s.spent_micros+s.held_micros then raise exception 'Paid testing is paused or its budget is unavailable.';end if;
 if exists(select 1 from public.solve_paid_wallets where owner_id=p_user and frozen) then raise exception 'Account needs payment review.';end if;
 if (select count(*) from public.solve_paid_orders where owner_id=p_user and created_at>now()-interval '1 hour')>=5 then raise exception 'Please wait before starting another checkout.';end if;
 insert into public.solve_paid_orders(id,owner_id,price_id) values(p_id,p_user,p_price) returning * into o;
 return to_jsonb(o);end;$$;

create or replace function public.solve_paid_attach(p_user uuid,p_id uuid,p_session text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.solve_paid_orders set session_id=p_session where id=p_id and owner_id=p_user and (session_id is null or session_id=p_session);
 if not found then raise exception 'Checkout could not be attached to the order.';end if;return true;end;$$;

create or replace function public.solve_paid_fulfil(p_id uuid,p_user uuid,p_price text,p_session text,p_intent text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.solve_paid_orders;revoked boolean;begin
 if p_intent not like 'pi_%' then raise exception 'Invalid payment intent.';end if;
 insert into public.solve_paid_payment_flags(payment_intent) values(p_intent) on conflict do nothing;
 select f.revoked into revoked from public.solve_paid_payment_flags f where payment_intent=p_intent for update;
 if revoked then raise exception 'Payment has been refunded or disputed.';end if;
 -- Payment facts have been verified server-side with Stripe. The unique order and intent prevent duplicate grants.
 select * into o from public.solve_paid_orders where id=p_id for update;
 if o.id is null or o.owner_id<>p_user or o.price_id<>p_price or o.session_id is distinct from p_session or p_intent not like 'pi_%' then raise exception 'Payment does not match a server-created order.';end if;
 if o.state='fulfilled' then
  if o.payment_intent is distinct from p_intent then raise exception 'Payment intent changed.';end if;
  return jsonb_build_object('credited',false);
 end if;
 if o.state<>'pending' then raise exception 'Payment requires review.';end if;
 insert into public.solve_paid_wallets(owner_id,remaining) values(p_user,100) on conflict(owner_id) do update set remaining=solve_paid_wallets.remaining+100;
 update public.solve_paid_orders set state='fulfilled',payment_intent=p_intent,fulfilled_at=now() where id=p_id;
 return jsonb_build_object('credited',true);end;$$;

create or replace function public.solve_paid_revoke(p_intent text)
returns boolean language plpgsql security definer set search_path=public as $$
declare u uuid;begin
 insert into public.solve_paid_payment_flags(payment_intent,revoked) values(p_intent,true) on conflict(payment_intent) do update set revoked=true;
 select owner_id into u from public.solve_paid_orders where payment_intent=p_intent for update;
 if u is null then return false;end if;
 update public.solve_paid_orders set state='review' where payment_intent=p_intent;
 update public.solve_paid_wallets set frozen=true where owner_id=u;
 return true;end;$$;

create or replace function public.solve_paid_balance(p_user uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_paid_settings;w public.solve_paid_wallets;r public.solve_paid_requests;begin
 select * into s from public.solve_paid_settings where id='main' for update;
 if s.id is null then raise exception 'Paid controls are missing.';end if;
 select * into w from public.solve_paid_wallets where owner_id=p_user for update;
 for r in select * from public.solve_paid_requests where owner_id=p_user and state='pending' and created_at<now()-interval '10 minutes' for update loop
  update public.solve_paid_requests set state='failed',cost_micros=reserved_micros,failure='An interrupted turn was returned. Please retry.',finished_at=now() where id=r.id;
  update public.solve_paid_wallets set remaining=remaining+1 where owner_id=p_user;
  update public.solve_paid_settings set spent_micros=spent_micros+r.reserved_micros,held_micros=held_micros-r.reserved_micros where id='main';
 end loop;
 select * into w from public.solve_paid_wallets where owner_id=p_user;
 select * into s from public.solve_paid_settings where id='main';
 return jsonb_build_object('remaining',coalesce(w.remaining,0),'frozen',coalesce(w.frozen,false),'enabled',s.enabled,'budgetAvailable',s.budget_micros>s.spent_micros+s.held_micros,'pending',(select count(*) from public.solve_paid_requests where owner_id=p_user and state='pending'));
end;$$;

create or replace function public.solve_paid_reserve(p_user uuid,p_email text,p_id uuid,p_fingerprint text,p_input_bound integer,p_output_bound integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_paid_settings;w public.solve_paid_wallets;r public.solve_paid_requests;pricing public.solve_trial_settings;cost bigint;begin
 -- Same model/rates as trials, independent paid testing budget and replies. Never consumes the trial pool.
 select * into pricing from public.solve_trial_settings where id='main' for update;
 perform public.solve_paid_balance(p_user);
 select * into s from public.solve_paid_settings where id='main' for update;
 select * into r from public.solve_paid_requests where id=p_id;
 if r.id is not null then
  if r.owner_id<>p_user or r.fingerprint<>p_fingerprint then return jsonb_build_object('state','conflict','error','This request belongs to a different answer.');end if;
  return jsonb_build_object('state',r.state,'result',r.result,'error',r.failure);
 end if;
 if not s.enabled then return jsonb_build_object('state','blocked','error','Paid reply testing is paused. Your purchased replies remain saved.');end if;
 select * into w from public.solve_paid_wallets where owner_id=p_user for update;
 if w.owner_id is null or w.remaining<=0 then return jsonb_build_object('state','blocked','error','No purchased replies remain. Open Credits to buy a test package or select your trial allowance.');end if;
 if w.frozen then return jsonb_build_object('state','blocked','error','This account needs payment review. Contact 10XSC.');end if;
 if exists(select 1 from public.solve_paid_requests where owner_id=p_user and state='pending') then return jsonb_build_object('state','pending','error','A paid reply is already processing. Please wait.');end if;
 if (select count(*) from public.solve_paid_requests where owner_id=p_user and created_at>now()-interval '1 minute')>=6 then return jsonb_build_object('state','blocked','error','Please wait a minute before sending more paid requests.');end if;
 if p_input_bound<1 or p_input_bound>200000 or p_output_bound<1 or p_output_bound>1800 or length(p_fingerprint)<>64 or pricing.input_rate<=0 or pricing.output_rate<=0 then raise exception 'Invalid request or model price configuration.';end if;
 cost=ceil(p_input_bound*pricing.input_rate+p_output_bound*pricing.output_rate);
 if s.spent_micros+s.held_micros+cost>s.budget_micros then return jsonb_build_object('state','blocked','error','The paid testing budget cannot cover this reply. Your purchased replies remain saved; contact 10XSC.');end if;
 insert into public.solve_paid_requests(id,owner_id,fingerprint,state,reserved_micros,input_rate,output_rate) values(p_id,p_user,p_fingerprint,'pending',cost,pricing.input_rate,pricing.output_rate);
 update public.solve_paid_wallets set remaining=remaining-1 where owner_id=p_user;
 update public.solve_paid_settings set held_micros=held_micros+cost where id='main';
 return jsonb_build_object('state','reserved','reservedMicros',cost,'inputRate',pricing.input_rate,'outputRate',pricing.output_rate);
end;$$;

create or replace function public.solve_paid_finish(p_user uuid,p_id uuid,p_success boolean,p_cost bigint,p_result jsonb,p_error text,p_pause boolean default false)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.solve_paid_settings;r public.solve_paid_requests;cost bigint;begin
 select * into s from public.solve_paid_settings where id='main' for update;
 perform 1 from public.solve_paid_wallets where owner_id=p_user for update;
 select * into r from public.solve_paid_requests where id=p_id for update;
 if r.id is null or r.owner_id<>p_user then raise exception 'Unknown paid request.';end if;
 if r.state<>'pending' then return jsonb_build_object('state',r.state);end if;
 if p_cost<0 or p_cost>r.reserved_micros then raise exception 'Invalid settlement.';end if;
 if p_success and (p_result is null or jsonb_typeof(p_result)<>'object' or octet_length(p_result::text)>100000) then raise exception 'Invalid result.';end if;
 cost=coalesce(p_cost,r.reserved_micros);
 update public.solve_paid_requests set state=case when p_success then 'succeeded' else 'failed' end,cost_micros=cost,result=case when p_success then p_result else null end,failure=case when p_success then null else left(coalesce(p_error,'Failed reply returned.'),1000) end,finished_at=now() where id=p_id;
 update public.solve_paid_wallets set remaining=remaining+case when p_success then 0 else 1 end where owner_id=p_user;
 update public.solve_paid_settings set spent_micros=spent_micros+cost,held_micros=held_micros-r.reserved_micros,enabled=case when p_pause then false else enabled end where id='main';
 return jsonb_build_object('state',case when p_success then 'succeeded' else 'failed' end);end;$$;

revoke all on function public.solve_paid_configure(bigint,boolean,bigint),public.solve_paid_order(uuid,uuid,text),public.solve_paid_attach(uuid,uuid,text),public.solve_paid_fulfil(uuid,uuid,text,text,text),public.solve_paid_revoke(text),public.solve_paid_balance(uuid),public.solve_paid_reserve(uuid,text,uuid,text,integer,integer),public.solve_paid_finish(uuid,uuid,boolean,bigint,jsonb,text,boolean) from public,anon,authenticated;
grant execute on function public.solve_paid_configure(bigint,boolean,bigint),public.solve_paid_order(uuid,uuid,text),public.solve_paid_attach(uuid,uuid,text),public.solve_paid_fulfil(uuid,uuid,text,text,text),public.solve_paid_revoke(text),public.solve_paid_balance(uuid),public.solve_paid_reserve(uuid,text,uuid,text,integer,integer),public.solve_paid_finish(uuid,uuid,boolean,bigint,jsonb,text,boolean) to service_role;
commit;
