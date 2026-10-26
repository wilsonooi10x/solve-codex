-- Run after setup.sql. Only server-side service credentials can read/write workshop controls.
create table if not exists public.solve_workshop (
 id text primary key check (id = 'main'),
 mode text not null default 'workshop' check (mode in ('workshop','os')),
 unlocked integer not null default -1 check (unlocked between -1 and 4),
 title text not null default 'Engineering Thinking Hackathon',
 payment_url text not null default '',
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.solve_workshop enable row level security;
revoke all on public.solve_workshop from anon, authenticated;
grant select, insert, update on public.solve_workshop to service_role;
insert into public.solve_workshop(id) values ('main') on conflict (id) do nothing;
