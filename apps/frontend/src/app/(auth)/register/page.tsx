import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Fisio MSK
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[#17211d]">Crear cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-[#66746e]">
          Prepará tu espacio de trabajo clínico para registrar pacientes y evolución.
        </p>
        <div className="mt-6">
          <AuthForm mode="register" />
        </div>
        <p className="mt-5 text-sm text-[#66746e]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-[#0f766e]">
            Ingresá
          </Link>
        </p>
      </Card>
    </main>
  );
}
