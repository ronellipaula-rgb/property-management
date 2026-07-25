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

const STATUS_GOOD = "#0ca30c";
const STATUS_CRITICAL = "#d03b3b";
const OCCUPANCY_COLOR = "#4f46e5";

interface ProfitPoint {
  month: string;
  label: string;
  profit: number;
}

interface OccupancyPoint {
  month: string;
  label: string;
  occupancy: number;
}

function ProfitTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { value: number; payload: { label: string } }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{payload[0].payload.label}</p>
      <p className="text-muted-foreground">
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
}

function OccupancyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { label: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{payload[0].payload.label}</p>
      <p className="text-muted-foreground">
        {Math.round(payload[0].value * 100)}%
      </p>
    </div>
  );
}

export function DashboardCharts({
  profitTrend,
  occupancyTrend,
  currency,
}: {
  profitTrend: ProfitPoint[];
  occupancyTrend: OccupancyPoint[];
  currency: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitTrend} margin={{ left: 8, right: 8 }}>
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
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<ProfitTooltip currency={currency} />}
                />
                <Bar dataKey="profit" radius={[4, 4, 4, 4]} maxBarSize={32}>
                  {profitTrend.map((entry) => (
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
          <CardTitle className="text-base">Occupancy trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyTrend} margin={{ left: 8, right: 8 }}>
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
                  tickFormatter={(value) => `${Math.round(value * 100)}%`}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  content={<OccupancyTooltip />}
                />
                <Bar
                  dataKey="occupancy"
                  radius={[4, 4, 4, 4]}
                  maxBarSize={32}
                  fill={OCCUPANCY_COLOR}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
