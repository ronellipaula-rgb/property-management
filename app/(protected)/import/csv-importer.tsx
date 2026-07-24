"use client";

import { useState } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ParsedRow<T> {
  rowNumber: number;
  data?: T;
  error?: string;
}

export function CsvImporter<T>({
  expectedHeaders,
  parseRow,
  onImport,
  previewColumns,
  previewRow,
  disabled,
  disabledMessage,
}: {
  expectedHeaders: string[];
  parseRow: (raw: Record<string, string>) => { data?: T; error?: string };
  onImport: (rows: T[]) => Promise<{ error?: string; inserted?: number }>;
  previewColumns: string[];
  previewRow: (row: T) => string[];
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  function handleFile(file: File) {
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((raw, i) => {
          const rowNumber = i + 2; // account for header row, 1-indexed
          const { data, error } = parseRow(raw);
          return { rowNumber, data, error };
        });
        setRows(parsed);
      },
    });
  }

  const validRows = rows.filter((r): r is ParsedRow<T> & { data: T } => !!r.data);
  const errorRows = rows.filter((r) => r.error);

  async function handleImport() {
    setImporting(true);
    const result = await onImport(validRows.map((r) => r.data));
    setImporting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Imported ${result.inserted ?? validRows.length} rows`);
    setRows([]);
    setFileName(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Expected columns:{" "}
        <code className="rounded bg-muted px-1 py-0.5">
          {expectedHeaders.join(", ")}
        </code>
      </p>
      <input
        type="file"
        accept=".csv"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm disabled:opacity-50"
      />
      {disabled && disabledMessage && (
        <p className="text-sm text-muted-foreground">{disabledMessage}</p>
      )}

      {rows.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm">
              {fileName} — <span className="text-success">{validRows.length} ready</span>
              {errorRows.length > 0 && (
                <span className="text-destructive"> · {errorRows.length} skipped</span>
              )}
            </p>
            {errorRows.length > 0 && (
              <ul className="flex flex-col gap-0.5 text-xs text-destructive">
                {errorRows.slice(0, 5).map((r) => (
                  <li key={r.rowNumber}>
                    Row {r.rowNumber}: {r.error}
                  </li>
                ))}
                {errorRows.length > 5 && <li>…and {errorRows.length - 5} more</li>}
              </ul>
            )}
            {validRows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewColumns.map((c) => (
                        <TableHead key={c}>{c}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validRows.slice(0, 20).map((row) => (
                      <TableRow key={row.rowNumber}>
                        {previewRow(row.data).map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {validRows.length > 20 && (
                  <p className="border-t px-4 py-2 text-xs text-muted-foreground">
                    +{validRows.length - 20} more rows not shown
                  </p>
                )}
              </div>
            )}
            <Button
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="w-fit"
            >
              {importing
                ? "Importing..."
                : `Import ${validRows.length} row${validRows.length === 1 ? "" : "s"}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
