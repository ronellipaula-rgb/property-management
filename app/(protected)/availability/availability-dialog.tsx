"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { upsertAvailability } from "./actions";

export function AvailabilityDialog({
  propertyId,
  month,
  daysInMonth,
  currentValue,
}: {
  propertyId: string;
  month: string;
  daysInMonth: number;
  currentValue: number;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      const result = await upsertAvailability({
        property_id: propertyId,
        month: `${month}-01`,
        available_nights: value,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Availability updated");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Edit available nights">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Available nights this month</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="available_nights">
              Nights the property was actually available to book (out of{" "}
              {daysInMonth})
            </Label>
            <Input
              id="available_nights"
              type="number"
              min={0}
              max={daysInMonth}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>
          <Button onClick={handleSave} disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
