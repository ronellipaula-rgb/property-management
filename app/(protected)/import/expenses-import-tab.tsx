"use client";

import { useState } from "react";
import { expenseSchema, type ExpenseInput } from "@/lib/schemas";
import type { Property } from "@/lib/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CsvImporter } from "./csv-importer";
import { bulkImportExpenses } from "./actions";

const HEADERS = [
  "date",
  "category (utilities/cleaning/maintenance/supplies/insurance/tax)",
  "amount",
  "vendor",
  "recurring (yes/no)",
  "is_capital (yes/no)",
  "notes",
];

function parseBool(value: string | undefined) {
  return /^(true|yes|1)$/i.test((value ?? "").trim());
}

export function ExpensesImportTab({ properties }: { properties: Property[] }) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Property</Label>
        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <CsvImporter<ExpenseInput>
        expectedHeaders={HEADERS}
        disabled={!propertyId}
        disabledMessage="Add a property first."
        parseRow={(raw) => {
          const parsed = expenseSchema.safeParse({
            property_id: propertyId,
            date: raw.date,
            category: (raw.category || "").trim().toLowerCase(),
            amount: raw.amount || "0",
            vendor: raw.vendor,
            recurring: parseBool(raw.recurring),
            is_capital: parseBool(raw.is_capital),
            notes: raw.notes,
          });
          if (!parsed.success) {
            return { error: parsed.error.issues[0]?.message ?? "Invalid row" };
          }
          return { data: parsed.data };
        }}
        onImport={(rows) => bulkImportExpenses(rows)}
        previewColumns={["Date", "Category", "Amount", "Vendor"]}
        previewRow={(row) => [
          row.date,
          row.category,
          String(row.amount),
          row.vendor || "—",
        ]}
      />
    </div>
  );
}
