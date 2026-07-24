import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, getMonthRange, overlapNights } from "@/lib/dates";
import { formatCurrency, formatMonthLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertySelector } from "@/components/property-selector";
import type { Booking, Expense, Property } from "@/lib/types";

function MetricCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p
          className={
            tone === "positive"
              ? "text-2xl font-semibold text-emerald-600 dark:text-emerald-400"
              : tone === "negative"
                ? "text-2xl font-semibold text-destructive"
                : "text-2xl font-semibold"
          }
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage({
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Add a property to start seeing your numbers here.
        </p>
      </div>
    );
  }

  const propertyId =
    params.property && properties.some((p) => p.id === params.property)
      ? params.property
      : properties[0].id;
  const property = properties.find((p) => p.id === propertyId)!;

  const month = currentMonthKey();
  const { start, end, daysInMonth } = getMonthRange(month);

  const [{ data: bookings }, { data: expenses }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .eq("property_id", propertyId)
      .lte("check_in", end)
      .gte("check_out", start)
      .returns<Booking[]>(),
    supabase
      .from("expenses")
      .select("*")
      .eq("property_id", propertyId)
      .gte("date", start)
      .lte("date", end)
      .returns<Expense[]>(),
  ]);

  const income = (bookings ?? []).reduce((sum, b) => sum + b.net_payout, 0);
  const expenseTotal = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
  const profit = income - expenseTotal;

  const bookedNights = (bookings ?? []).reduce(
    (sum, b) => sum + overlapNights(b.check_in, b.check_out, start, end),
    0
  );
  const occupancyRate = daysInMonth > 0 ? bookedNights / daysInMonth : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">{formatMonthLabel(month)}</p>
        </div>
        {properties.length > 1 && (
          <PropertySelector properties={properties} value={propertyId} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Income"
          value={formatCurrency(income, property.currency)}
        />
        <MetricCard
          title="Expenses"
          value={formatCurrency(expenseTotal, property.currency)}
        />
        <MetricCard
          title="Profit"
          value={formatCurrency(profit, property.currency)}
          tone={profit >= 0 ? "positive" : "negative"}
        />
        <MetricCard
          title="Occupancy"
          value={`${Math.round(occupancyRate * 100)}%`}
          subtitle={`${bookedNights} of ${daysInMonth} nights`}
        />
      </div>
    </div>
  );
}
