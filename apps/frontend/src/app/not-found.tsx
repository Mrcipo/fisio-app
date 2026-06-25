import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f8f5] px-4 text-center">
      <p className="text-6xl font-bold text-[#17211d]">404</p>
      <h1 className="text-2xl font-semibold text-[#17211d]">Página no encontrada</h1>
      <p className="max-w-sm text-sm text-[#66746e]">
        La página que buscás no existe o fue movida. Revisá la URL o volvé al dashboard.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-md bg-[#17211d] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#0f766e]"
      >
        Ir al dashboard
      </Link>
    </div>
  );
}
