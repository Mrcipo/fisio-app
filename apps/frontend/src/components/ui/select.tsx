import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "min-h-10 rounded-md border border-[#d9e1dc] bg-white px-3 py-2 text-sm text-[#17211d] outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-teal-100",
        className,
      )}
      {...props}
    />
  );
}
