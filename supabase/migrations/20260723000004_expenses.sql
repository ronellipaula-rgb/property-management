create type public.expense_category as enum (
  'utilities',
  'cleaning',
  'maintenance',
  'supplies',
  'insurance',
  'tax'
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  date date not null,
  category public.expense_category not null,
  amount numeric(10, 2) not null,
  vendor text,
  recurring boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_owner_id_idx on public.expenses (owner_id);
create index expenses_property_id_idx on public.expenses (property_id);
create index expenses_date_idx on public.expenses (date);

alter table public.expenses enable row level security;

create policy "Owners manage own expenses"
  on public.expenses for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create trigger set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();
