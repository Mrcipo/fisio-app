"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";

export function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#d9e1dc] bg-white/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard" className="font-semibold text-[#17211d] lg:hidden">
          Fisio MSK
        </Link>
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
    </header>
  );
}
