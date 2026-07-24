"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/types";

const STATUS_GOOD = "#0ca30c";
const STATUS_CRITICAL = "#d03b3b";

// Fixed order (never re-sorted by value) from the validated categorical palette.
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  utilities: "#2a78d6",
  cleaning: "#008300",
  maintenance: "#e87ba4",
  supplies: "#eda100",
  insurance: "#1baf7a",
  tax: "#eb6834",
};

interface ProfitPoint {
  month: string;
  label: string;
  profit: number;
}

interface CategoryPoint {
  category: ExpenseCategory;
  label: string;
  amount: number;
}

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { label: string } }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{entry.payload.label}</p>
      <p className="text-muted-foreground">{formatCurrency(entry.value, currency)}</p>
    </div>
  );
}

export function ReportsCharts({
  profitByMonth,
  expensesByCategory,
  currency,
}: {
  profitByMonth: ProfitPoint[];
  expensesByCategory: CategoryPoint[];
  currency: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profit by month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitByMonth} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, currency)}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<ChartTooltip currency={currency} />}
                />
                <Bar dataKey="profit" radius={[4, 4, 4, 4]} maxBarSize={40}>
                  {profitByMonth.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.profit >= 0 ? STATUS_GOOD : STATUS_CRITICAL}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory} margin={{ left: 8, right: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, currency)}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<ChartTooltip currency={currency} />}
                />
                <Bar dataKey="amount" radius={[4, 4, 4, 4]} maxBarSize={40}>
                  {expensesByCategory.map((entry) => (
                    <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
