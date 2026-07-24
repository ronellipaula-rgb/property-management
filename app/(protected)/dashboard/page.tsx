import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, getMonthRange, lastNMonths } from "@/lib/dates";
import { accrueBookingsByMonth, payoutStatus, resolveAvailableNights } from "@/lib/accrual";
import { cn, formatCurrency, formatMonthLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertySelector } from "@/components/property-selector";
import { AvailabilityDialog } from "../availability/availability-dialog";
import { DashboardCharts } from "./dashboard-charts";
import type { Availability, Booking, Expense, Property } from "@/lib/types";

function MetricCard({
  title,
  value,
  subtitle,
  tone,
  badge,
  action,
}: {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "positive" | "negative";
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              tone === "positive"
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {badge}
          </span>
        )}
        {action}
      </CardHeader>
      <CardContent>
        <p
          className={
            tone === "positive"
              ? "font-heading text-2xl font-semibold text-success"
              : tone === "negative"
                ? "font-heading text-2xl font-semibold text-destructive"
                : "font-heading text-2xl font-semibold"
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

  const [{ data: bookings }, { data: expenses }, { data: availabilityRowRaw }] =
    await Promise.all([
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
      supabase
        .from("availability")
        .select("*")
        .eq("property_id", propertyId)
        .eq("month", `${month}-01`)
        .maybeSingle(),
    ]);
  const availabilityRow = availabilityRowRaw as Availability | null;

  const accrual = accrueBookingsByMonth(bookings ?? []);
  const thisMonth = accrual.get(month) ?? {
    nights: 0,
    ownerShare: 0,
    commission: 0,
    platformFee: 0,
  };

  const income = thisMonth.ownerShare;
  const expenseTotal = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);
  const profit = income - expenseTotal;

  const bookedNights = thisMonth.nights;
  const availableNights = resolveAvailableNights(
    daysInMonth,
    bookedNights,
    availabilityRow?.available_nights
  );
  const occupancyRate = availableNights > 0 ? bookedNights / availableNights : 0;

  const backlog = (bookings ?? [])
    .filter((b) => payoutStatus(b.check_out, month) === "backlog")
    .reduce((sum, b) => sum + b.owner_share, 0);

  const trendMonths = lastNMonths(6);
  const trendStart = getMonthRange(trendMonths[0]).start;

  const [{ data: trendBookings }, { data: trendExpenses }, { data: trendAvailability }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("property_id", propertyId)
        .lte("check_in", end)
        .gte("check_out", trendStart)
        .returns<Booking[]>(),
      supabase
        .from("expenses")
        .select("*")
        .eq("property_id", propertyId)
        .gte("date", trendStart)
        .lte("date", end)
        .returns<Expense[]>(),
      supabase
        .from("availability")
        .select("*")
        .eq("property_id", propertyId)
        .gte("month", trendStart)
        .lte("month", `${month}-01`)
        .returns<Availability[]>(),
    ]);

  const trendAccrual = accrueBookingsByMonth(trendBookings ?? []);
  const trendExpenseByMonth = new Map<string, number>();
  for (const e of trendExpenses ?? []) {
    const key = e.date.slice(0, 7);
    trendExpenseByMonth.set(key, (trendExpenseByMonth.get(key) ?? 0) + e.amount);
  }
  const availabilityByMonth = new Map<string, number>();
  for (const a of trendAvailability ?? []) {
    availabilityByMonth.set(a.month.slice(0, 7), a.available_nights);
  }

  const profitTrend = trendMonths.map((m) => {
    const entry = trendAccrual.get(m);
    const monthIncome = entry?.ownerShare ?? 0;
    const monthExpense = trendExpenseByMonth.get(m) ?? 0;
    return { month: m, label: formatMonthLabel(m), profit: monthIncome - monthExpense };
  });

  const occupancyTrend = trendMonths.map((m) => {
    const monthDaysInMonth = getMonthRange(m).daysInMonth;
    const nights = trendAccrual.get(m)?.nights ?? 0;
    const avail = resolveAvailableNights(
      monthDaysInMonth,
      nights,
      availabilityByMonth.get(m)
    );
    return {
      month: m,
      label: formatMonthLabel(m),
      occupancy: avail > 0 ? nights / avail : 0,
    };
  });

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Income"
          value={formatCurrency(income, property.currency)}
          subtitle="Accrued this month"
        />
        <MetricCard
          title="Expenses"
          value={formatCurrency(expenseTotal, property.currency)}
        />
        <MetricCard
          title="Profit"
          value={formatCurrency(profit, property.currency)}
          tone={profit >= 0 ? "positive" : "negative"}
          badge={profit >= 0 ? "On track" : "Over budget"}
        />
        <MetricCard
          title="Occupancy"
          value={`${Math.round(occupancyRate * 100)}%`}
          subtitle={`${bookedNights} of ${availableNights} nights`}
          action={
            <AvailabilityDialog
              propertyId={propertyId}
              month={month}
              daysInMonth={daysInMonth}
              currentValue={availabilityRow?.available_nights ?? daysInMonth}
            />
          }
        />
        <MetricCard
          title="To receive"
          value={formatCurrency(backlog, property.currency)}
          subtitle="Pays out next month"
        />
      </div>

      <DashboardCharts
        profitTrend={profitTrend}
        occupancyTrend={occupancyTrend}
        currency={property.currency}
      />
    </div>
  );
}
