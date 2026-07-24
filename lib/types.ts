export type BookingSource = "airbnb" | "booking_com" | "direct";

export type ExpenseCategory =
  | "utilities"
  | "cleaning"
  | "maintenance"
  | "supplies"
  | "insurance"
  | "tax";

export const BOOKING_SOURCES: { value: BookingSource; label: string }[] = [
  { value: "airbnb", label: "Airbnb" },
  { value: "booking_com", label: "Booking.com" },
  { value: "direct", label: "Direct" },
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
  source: BookingSource;
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
