"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";

type NavbarProps = {
  onMenuToggle: () => void;
};

export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();

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
            onClick={onMenuToggle}
            className="rounded-md p-1.5 text-[#17211d] transition hover:bg-[#f0f5f2] nav:hidden"
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
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/dashboard" className="font-semibold text-[#17211d] nav:hidden">
            Fisio MSK
          </Link>
        </div>

        <div className="hidden text-sm text-[#66746e] nav:block">
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
    </header>
  );
}
