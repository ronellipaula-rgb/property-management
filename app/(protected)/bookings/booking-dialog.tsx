"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Booking, Property } from "@/lib/types";
import { BookingForm } from "./booking-form";

export function BookingDialog({
  booking,
  properties,
  defaultPropertyId,
}: {
  booking?: Booking;
  properties: Property[];
  defaultPropertyId?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {booking ? (
          <Button variant="outline" size="icon-sm">
            <Pencil />
          </Button>
        ) : (
          <Button disabled={properties.length === 0}>
            <Plus /> Add booking
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{booking ? "Edit booking" : "Add booking"}</DialogTitle>
        </DialogHeader>
        <BookingForm
          booking={booking}
          properties={properties}
          defaultPropertyId={defaultPropertyId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
