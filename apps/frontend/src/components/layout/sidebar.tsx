import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Pacientes" },
  { href: "/exercises", label: "Ejercicios" },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-[#d9e1dc] bg-[#17211d] px-5 py-6 text-white lg:block">
      <Link href="/dashboard" className="block">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
          Fisio MSK
        </p>
        <p className="mt-2 text-lg font-semibold">Clínica</p>
      </Link>

      <nav className="mt-10 grid gap-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
