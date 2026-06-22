"use client";

import { useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-lg border border-[#d9e1dc] bg-[#fbfcfb]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-[#17211d]">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-[#66746e]">{description}</p>
          ) : null}
        </div>
        <span className="text-xs font-semibold uppercase text-[#0f766e]">
          {isOpen ? "Ocultar" : "Mostrar"}
        </span>
      </button>
      {isOpen ? <div className="border-t border-[#d9e1dc] px-4 py-4">{children}</div> : null}
    </section>
  );
}
