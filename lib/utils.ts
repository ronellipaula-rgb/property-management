import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatMonthLabel(monthKey: string) {
  // monthKey is "YYYY-MM"
  const [year, month] = monthKey.split("-").map(Number)
  return new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  )
}
