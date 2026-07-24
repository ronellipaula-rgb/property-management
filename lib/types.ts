export type ExpenseCategory =
  | "utilities"
  | "cleaning"
  | "maintenance"
  | "supplies"
  | "insurance"
  | "tax";

// A booking's source is free text (so custom platforms are possible), but the
// form offers these as one-click presets, with "Other" revealing a text field.
export const BOOKING_SOURCE_PRESETS = [
  "Airbnb",
  "Booking.com",
  "VRBO",
  "Expedia",
  "TripAdvisor",
  "Direct",
] as const;

export const CURRENCIES: { value: string; label: string }[] = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "CAD", label: "CAD — Canadian Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "BRL", label: "BRL — Brazilian Real" },
  { value: "MXN", label: "MXN — Mexican Peso" },
  { value: "ARS", label: "ARS — Argentine Peso" },
  { value: "CLP", label: "CLP — Chilean Peso" },
  { value: "COP", label: "COP — Colombian Peso" },
  { value: "AUD", label: "AUD — Australian Dollar" },
  { value: "NZD", label: "NZD — New Zealand Dollar" },
  { value: "JPY", label: "JPY — Japanese Yen" },
  { value: "CNY", label: "CNY — Chinese Yuan" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "CHF", label: "CHF — Swiss Franc" },
  { value: "ZAR", label: "ZAR — South African Rand" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "HKD", label: "HKD — Hong Kong Dollar" },
  { value: "SEK", label: "SEK — Swedish Krona" },
  { value: "NOK", label: "NOK — Norwegian Krone" },
  { value: "DKK", label: "DKK — Danish Krone" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "utilities", label: "Utilities" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
  { value: "supplies", label: "Supplies" },
  { value: "insurance", label: "Insurance" },
  { value: "tax", label: "Tax" },
];

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  owner_id: string;
  property_id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  owner_share: number;
  commission: number;
  platform_fee: number;
  source: string;
  payment_received: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  owner_id: string;
  property_id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  vendor: string | null;
  recurring: boolean;
  is_capital: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  owner_id: string;
  property_id: string;
  month: string;
  available_nights: number;
  created_at: string;
  updated_at: string;
}
