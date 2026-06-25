"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Pacientes" },
  { href: "/exercises", label: "Ejercicios" },
];

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-[#d9e1dc] bg-[#17211d] px-5 py-6 text-white transition-transform",
        "nav:relative nav:translate-x-0 nav:min-h-screen",
        isOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <Link href="/dashboard" className="block" onClick={onClose}>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
          Fisio MSK
        </p>
        <p className="mt-2 text-lg font-semibold">Clínica</p>
      </Link>

      <nav className="mt-10 grid gap-2">
        {navigation.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={
                isActive
                  ? "rounded-md bg-white/15 px-3 py-2 text-sm font-medium text-white"
                  : "rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
