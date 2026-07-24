"use client";

import { useState, useTransition } from "react";
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
import { BOOKING_SOURCE_PRESETS } from "@/lib/types";
import type { Booking, Property } from "@/lib/types";
import { createBooking, updateBooking } from "./actions";

const OTHER = "Other";

const schema = z
  .object({
    property_id: z.string().uuid("Select a property"),
    guest_name: z.string().min(1, "Guest name is required"),
    check_in: z.string().min(1, "Check-in date is required"),
    check_out: z.string().min(1, "Check-out date is required"),
    owner_share: z.coerce.number().min(0, "Must be 0 or more"),
    commission: z.coerce.number().min(0, "Must be 0 or more"),
    platform_fee: z.coerce.number().min(0, "Must be 0 or more"),
    source: z.string().min(1, "Source is required"),
    notes: z.string().optional(),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: "Check-out must be after check-in",
    path: ["check_out"],
  });

type FormValues = z.infer<typeof schema>;
type FormInput = z.input<typeof schema>;

function isPreset(source: string): boolean {
  return (BOOKING_SOURCE_PRESETS as readonly string[]).includes(source);
}

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
  const [sourceMode, setSourceMode] = useState<string>(() => {
    if (!booking) return "Direct";
    return isPreset(booking.source) ? booking.source : OTHER;
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      property_id: booking?.property_id ?? defaultPropertyId ?? properties[0]?.id ?? "",
      guest_name: booking?.guest_name ?? "",
      check_in: booking?.check_in ?? "",
      check_out: booking?.check_out ?? "",
      owner_share: booking?.owner_share ?? 0,
      commission: booking?.commission ?? 0,
      platform_fee: booking?.platform_fee ?? 0,
      source: booking?.source ?? "Direct",
      notes: booking?.notes ?? "",
    },
  });

  function handleSourceModeChange(value: string) {
    setSourceMode(value);
    if (value !== OTHER) {
      setValue("source", value, { shouldValidate: true });
    } else {
      setValue("source", isPreset(booking?.source ?? "") ? "" : (booking?.source ?? ""), {
        shouldValidate: true,
      });
    }
  }

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
          <Label htmlFor="owner_share">Your share</Label>
          <Input
            id="owner_share"
            type="number"
            step="0.01"
            {...register("owner_share")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="commission">Commission</Label>
          <Input
            id="commission"
            type="number"
            step="0.01"
            {...register("commission")}
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
      </div>
      <p className="text-xs text-muted-foreground">
        Gross booking value is your share + commission + platform fee, shown
        automatically wherever it&rsquo;s needed.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source_mode">Source</Label>
        <Select value={sourceMode} onValueChange={handleSourceModeChange}>
          <SelectTrigger id="source_mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOOKING_SOURCE_PRESETS.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
            <SelectItem value={OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
        {sourceMode === OTHER && (
          <Input
            className="mt-2"
            placeholder="Enter the platform or source name"
            {...register("source")}
          />
        )}
        {errors.source && (
          <p className="text-sm text-destructive">{errors.source.message}</p>
        )}
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
