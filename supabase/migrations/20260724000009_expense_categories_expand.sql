-- Expand the fixed expense category list with common recurring rental costs.
-- ADD VALUE only appends to the enum, so existing rows are untouched.
alter type public.expense_category add value if not exists 'condo_fee';
alter type public.expense_category add value if not exists 'internet';
alter type public.expense_category add value if not exists 'hydro';
