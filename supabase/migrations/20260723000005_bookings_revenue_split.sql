-- Revenue split: owner's share, co-host/manager commission, and platform fee are
-- tracked separately. Gross is derived (owner_share + commission + platform_fee) in
-- application code rather than stored, so it can never drift out of sync.
alter table public.bookings rename column net_payout to owner_share;
alter table public.bookings add column commission numeric(10, 2) not null default 0;
alter table public.bookings drop column gross_amount;
