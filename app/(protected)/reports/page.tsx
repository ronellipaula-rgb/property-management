import { createClient } from "@/lib/supabase/server";
import { getMonthRange, lastNMonths } from "@/lib/dates";
import { formatMonthLabel } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import type { Booking, Expense, ExpenseCategory, Property } from "@/lib/types";
import { PropertySelector } from "@/components/property-selector";
import { ReportsCharts } from "./reports-charts";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ property?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<Property[]>();

  if (!properties?.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">
          Add a property to see reports here.
        </p>
      </div>
    );
  }

  const propertyId =
    params.property && properties.some((p) => p.id === params.property)
      ? params.property
      : properties[0].id;
  const property = properties.find((p) => p.id === propertyId)!;

  const months = lastNMonths(12);
  const rangeStart = getMonthRange(months[0]).start;
  const rangeEnd = getMonthRange(months[months.length - 1]).end;

  const [{ data: bookings }, { data: expenses }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("property_id", propertyId)
      .gte("check_in", rangeStart)
      .lte("check_in", rangeEnd)
      .returns<Booking[]>(),
    supabase
      .from("expenses")
      .select("*")
      .eq("property_id", propertyId)
      .gte("date", rangeStart)
      .lte("date", rangeEnd)
      .returns<Expense[]>(),
  ]);

  const incomeByMonth = new Map<string, number>();
  for (const b of bookings ?? []) {
    const key = b.check_in.slice(0, 7);
    incomeByMonth.set(key, (incomeByMonth.get(key) ?? 0) + b.net_payout);
  }

  const expenseByMonth = new Map<string, number>();
  const categoryTotals = new Map<ExpenseCategory, number>();
  for (const e of expenses ?? []) {
    const key = e.date.slice(0, 7);
    expenseByMonth.set(key, (expenseByMonth.get(key) ?? 0) + e.amount);
    categoryTotals.set(e.category, (categoryTotals.get(e.category) ?? 0) + e.amount);
  }

  const profitByMonth = months.map((month) => {
    const income = incomeByMonth.get(month) ?? 0;
    const expense = expenseByMonth.get(month) ?? 0;
    return { month, label: formatMonthLabel(month), profit: income - expense };
  });

  const expensesByCategory = EXPENSE_CATEGORIES.map((c) => ({
    category: c.value,
    label: c.label,
    amount: categoryTotals.get(c.value) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        {properties.length > 1 && (
          <PropertySelector properties={properties} value={propertyId} />
        )}
      </div>
      <ReportsCharts
        profitByMonth={profitByMonth}
        expensesByCategory={expensesByCategory}
        currency={property.currency}
      />
    </div>
  );
}
