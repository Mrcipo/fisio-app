"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/lib/api";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Pacientes" },
  { href: "/exercises", label: "Ejercicios" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#d9e1dc] bg-white/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-[#17211d] transition hover:bg-[#f0f5f2] lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
          <Link href="/dashboard" className="font-semibold text-[#17211d] lg:hidden">
            Fisio MSK
          </Link>
        </div>

        <div className="hidden text-sm text-[#66746e] lg:block">
          Seguimiento clínico musculoesquelético
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-[#d9e1dc] px-3 py-2 text-sm font-medium text-[#17211d] transition hover:border-[#0f766e] hover:text-[#0f766e]"
        >
          Cerrar sesión
        </button>
      </div>

      {menuOpen && (
        <nav className="mt-3 grid gap-1 border-t border-[#d9e1dc] pt-3 lg:hidden">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "rounded-md bg-[#17211d] px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-[#17211d] transition hover:bg-[#f0f5f2]"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
