import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Home className="size-4" />
      </div>
      <span className="font-heading text-base font-semibold">
        Property Manager
      </span>
    </div>
  );
}
