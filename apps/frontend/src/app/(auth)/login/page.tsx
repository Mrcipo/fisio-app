import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Fisio MSK
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[#17211d]">Ingresar</h1>
        <p className="mt-2 text-sm leading-6 text-[#66746e]">
          Accedé al seguimiento clínico de tus pacientes.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
        <p className="mt-5 text-sm text-[#66746e]">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-semibold text-[#0f766e]">
            Registrate
          </Link>
        </p>
      </Card>
    </main>
  );
}
