"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Property } from "@/lib/types";
import { previewICalImport, importICalBookings } from "./import-ical-action";

export function ImportICalDialog({ properties }: { properties: Property[] }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    newCount: number;
    duplicateCount: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);

  async function handlePreview() {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    if (!selectedPropertyId) {
      toast.error("Please select a property");
      return;
    }

    setLoading(true);
    try {
      const result = await previewICalImport(url, selectedPropertyId);
      setPreview({
        newCount: result.newCount,
        duplicateCount: result.duplicateCount,
      });
      toast.success(
        `Found ${result.newCount} new and ${result.duplicateCount} duplicate events`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to preview iCal"
      );
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const result = await importICalBookings(url, selectedPropertyId, true);
      if (result.success) {
        toast.success(
          `Imported ${result.createdCount} bookings (${result.duplicateCount} duplicates skipped)`
        );
        setOpen(false);
        setUrl("");
        setSelectedPropertyId("");
        setPreview(null);
        window.location.reload();
      } else {
        toast.error(result.error || "Import failed");
      }
    } catch {
      toast.error("Failed to import bookings");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="size-4" />
          Import calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import iCal calendar</DialogTitle>
          <DialogDescription>
            Paste a calendar URL (iCal format) to import bookings
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="property-select">Property</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger id="property-select">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((prop) => (
                  <SelectItem key={prop.id} value={prop.id}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ical-url">Calendar URL</Label>
            <Input
              id="ical-url"
              placeholder="https://calendar.example.com/calendar.ics"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading || importing}
            />
            <p className="text-xs text-muted-foreground">
              Supports Google Calendar, Outlook, Apple Calendar, and other iCal
              sources
            </p>
          </div>

          {preview && (
            <Card>
              <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    New bookings
                  </span>
                  <Badge variant="outline">{preview.newCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duplicates (skipped)
                  </span>
                  <Badge variant="secondary">{preview.duplicateCount}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={loading || importing || !url.trim() || !selectedPropertyId}
              className="flex-1"
            >
              {loading ? "Checking..." : "Preview"}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!preview || importing}
              className="flex-1"
            >
              {importing ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
