create table public.availability (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  month date not null,
  available_nights int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, month)
);

create index availability_property_id_idx on public.availability (property_id);

alter table public.availability enable row level security;

create policy "Owners manage own availability"
  on public.availability for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create trigger set_updated_at
  before update on public.availability
  for each row execute function public.set_updated_at();
