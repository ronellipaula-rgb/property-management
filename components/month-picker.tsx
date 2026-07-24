"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthLabel } from "@/lib/utils";

function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function MonthPicker({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(monthKey: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", monthKey);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft />
      </Button>
      <span className="w-32 text-center text-sm font-medium">
        {formatMonthLabel(month)}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goTo(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
