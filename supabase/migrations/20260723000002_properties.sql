-- Shared trigger function to keep `updated_at` current; reused by every table below.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  address text,
  currency text not null default 'CAD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_owner_id_idx on public.properties (owner_id);

alter table public.properties enable row level security;

create policy "Owners manage own properties"
  on public.properties for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create trigger set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();
