import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[#d9e1dc] bg-white p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
