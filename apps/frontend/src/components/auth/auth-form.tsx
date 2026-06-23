"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { login, register } from "@/lib/api";
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from "@/lib/schemas";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  if (mode === "login") {
    return <LoginForm />;
  }

  return <RegisterForm />;
}

function LoginForm() {
  const router = useRouter();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function submit(values: LoginFormValues) {
    try {
      await login(values);
      router.push("/dashboard");
    } catch (caughtError) {
      setError("root", {
        message: caughtError instanceof Error ? caughtError.message : "Error inesperado",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <FieldError label="Email" error={errors.email?.message}>
        <input
          {...field("email")}
          type="email"
          autoComplete="email"
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          {...field("password")}
          type="password"
          autoComplete="current-password"
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </FieldError>

      {errors.root ? (
        <p className="text-sm font-medium text-red-700">{errors.root.message}</p>
      ) : null}

      <SubmitButton isSubmitting={isSubmitting} label="Ingresar" />
    </form>
  );
}

function RegisterForm() {
  const router = useRouter();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function submit(values: RegisterFormValues) {
    try {
      await register(values);
      router.push("/dashboard");
    } catch (caughtError) {
      setError("root", {
        message: caughtError instanceof Error ? caughtError.message : "Error inesperado",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldError label="Nombre" error={errors.firstName?.message}>
          <input
            {...field("firstName")}
            autoComplete="given-name"
            className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
          />
        </FieldError>
        <FieldError label="Apellido" error={errors.lastName?.message}>
          <input
            {...field("lastName")}
            autoComplete="family-name"
            className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
          />
        </FieldError>
      </div>

      <FieldError label="Email" error={errors.email?.message}>
        <input
          {...field("email")}
          type="email"
          autoComplete="email"
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </FieldError>

      <FieldError label="Contraseña" error={errors.password?.message}>
        <input
          {...field("password")}
          type="password"
          autoComplete="new-password"
          className="rounded-md border border-[#d9e1dc] px-3 py-2 outline-none focus:border-[#0f766e]"
        />
      </FieldError>

      {errors.root ? (
        <p className="text-sm font-medium text-red-700">{errors.root.message}</p>
      ) : null}

      <SubmitButton isSubmitting={isSubmitting} label="Crear cuenta" />
    </form>
  );
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#17211d]">
      {label}
      {children}
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Procesando..." : label}
    </button>
  );
}
