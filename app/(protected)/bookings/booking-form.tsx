"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_SOURCES } from "@/lib/types";
import type { Booking, Property } from "@/lib/types";
import { createBooking, updateBooking } from "./actions";

const schema = z
  .object({
    property_id: z.string().uuid("Select a property"),
    guest_name: z.string().min(1, "Guest name is required"),
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    gross_amount: z.coerce.number().min(0, "Must be 0 or more"),
    platform_fee: z.coerce.number().min(0, "Must be 0 or more"),
    net_payout: z.coerce.number().min(0, "Must be 0 or more"),
    source: z.enum(["airbnb", "booking_com", "direct"]),
    notes: z.string().optional(),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

export function BookingForm({
  booking,
  properties,
  defaultPropertyId,
  onSuccess,
}: {
  booking?: Booking;
  properties: Property[];
  defaultPropertyId?: string;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_id: booking?.property_id ?? defaultPropertyId ?? properties[0]?.id ?? "",
      guest_name: booking?.guest_name ?? "",
      check_in: booking?.check_in ?? "",
      check_out: booking?.check_out ?? "",
      gross_amount: booking?.gross_amount ?? 0,
      platform_fee: booking?.platform_fee ?? 0,
      net_payout: booking?.net_payout ?? 0,
      source: booking?.source ?? "direct",
      notes: booking?.notes ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = booking
        ? await updateBooking(booking.id, values)
        : await createBooking(values);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(booking ? "Booking updated" : "Booking added");
      onSuccess();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="property_id">Property</Label>
        <Controller
          control={control}
          name="property_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="property_id" className="w-full">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.property_id && (
          <p className="text-sm text-destructive">{errors.property_id.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guest_name">Guest name</Label>
        <Input id="guest_name" {...register("guest_name")} />
        {errors.guest_name && (
          <p className="text-sm text-destructive">{errors.guest_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="check_in">Check-in</Label>
          <Input id="check_in" type="date" {...register("check_in")} />
          {errors.check_in && (
            <p className="text-sm text-destructive">{errors.check_in.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="check_out">Check-out</Label>
          <Input id="check_out" type="date" {...register("check_out")} />
          {errors.check_out && (
            <p className="text-sm text-destructive">{errors.check_out.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gross_amount">Gross</Label>
          <Input
            id="gross_amount"
            type="number"
            step="0.01"
            {...register("gross_amount")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="platform_fee">Platform fee</Label>
          <Input
            id="platform_fee"
            type="number"
            step="0.01"
            {...register("platform_fee")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="net_payout">Net payout</Label>
          <Input
            id="net_payout"
            type="number"
            step="0.01"
            {...register("net_payout")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source">Source</Label>
        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="source" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_SOURCES.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
      </div>

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
