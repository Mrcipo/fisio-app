import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("grid gap-2 text-sm font-medium text-[#17211d]", className)}
      {...props}
    />
  );
}
