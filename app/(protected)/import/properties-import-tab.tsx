"use client";

import { propertySchema, type PropertyInput } from "@/lib/schemas";
import { CsvImporter } from "./csv-importer";
import { bulkImportProperties } from "./actions";

const HEADERS = ["name", "address", "currency"];

export function PropertiesImportTab() {
  return (
    <CsvImporter<PropertyInput>
      expectedHeaders={HEADERS}
      parseRow={(raw) => {
        const parsed = propertySchema.safeParse({
          name: raw.name,
          address: raw.address,
          currency: raw.currency || "CAD",
        });
        if (!parsed.success) {
          return { error: parsed.error.issues[0]?.message ?? "Invalid row" };
        }
        return { data: parsed.data };
      }}
      onImport={(rows) => bulkImportProperties(rows)}
      previewColumns={["Name", "Address", "Currency"]}
      previewRow={(row) => [row.name, row.address || "—", row.currency]}
    />
  );
}
