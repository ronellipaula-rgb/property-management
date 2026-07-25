"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { ExpenseCategoryIcon } from "@/lib/expense-icons";

const ALL = "all";

export function CategoryFilter({ category }: { category?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={category ?? ALL} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All categories</SelectItem>
        {EXPENSE_CATEGORIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <span className="flex items-center gap-2">
              <ExpenseCategoryIcon category={c.value} className="size-4 text-primary" />
              {c.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
