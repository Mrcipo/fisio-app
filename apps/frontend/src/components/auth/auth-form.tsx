"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        await login({
          email: String(formData.get("email")),
          password: String(formData.get("password")),
        });
      } else {
        await register({
          firstName: String(formData.get("firstName")),
          lastName: String(formData.get("lastName")),
          email: String(formData.get("email")),
          password: String(formData.get("password")),
        });
      }

      router.push("/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {mode === "register" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#17211d]">
            Nombre
            <input
              name="firstName"
              required
              className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#17211d]">
            Apellido
            <input
              name="lastName"
              required
              className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
            />
          </label>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-[#17211d]">
        Email
        <input
          name="email"
          type="email"
          required
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#17211d]">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </label>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
      </button>
    </form>
  );
}
