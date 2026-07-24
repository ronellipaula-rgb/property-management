# Property Manager

An app where I track bookings and expenses for my rental property,
so I can see profit per month.

## Decisions
- Properties: one for now, but built so I can add more later
- Home screen: financial dashboard (income vs expenses this month)
- Bookings: entered manually
- Expense categories: fixed list — utilities, cleaning, maintenance,
  supplies, insurance, tax
- Currency: CAD only

## Data
properties: name, address, currency
bookings: property, guest name, check-in, check-out, gross amount,
  platform fee, net payout, source (Airbnb / Booking.com / direct), notes
expenses: property, date, category, amount, vendor, recurring (yes/no), notes
profiles: my login

## Users
Only me. Login with email + password.

## Screens
1. Dashboard — this month's income, expenses, profit; occupancy rate
2. Bookings — list + calendar view, add/edit a booking
3. Expenses — list filtered by month and category, add/edit an expense
4. Reports — profit by month, expenses by category
