import {
  Building2,
  Droplets,
  Landmark,
  Package,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ExpenseCategory } from "@/lib/types";

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  condo_fee: Building2,
  hydro: Droplets,
  internet: Wifi,
  utilities: Zap,
  cleaning: Sparkles,
  maintenance: Wrench,
  supplies: Package,
  insurance: ShieldCheck,
  tax: Landmark,
};

export function ExpenseCategoryIcon({
  category,
  className,
}: {
  category: ExpenseCategory;
  className?: string;
}) {
  const Icon = EXPENSE_CATEGORY_ICONS[category];
  return <Icon className={className ?? "size-4"} aria-hidden="true" />;
}
