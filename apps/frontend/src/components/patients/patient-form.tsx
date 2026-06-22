"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Patient, PatientInput, PatientSex } from "@/lib/patients-api";

const patientFormSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  documentNumber: z.string(),
  dateOfBirth: z.string(),
  sex: z.enum(["FEMALE", "MALE", "OTHER", "NOT_SPECIFIED"]),
  phone: z.string(),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, {
      message: "Email inválido",
    }),
  occupation: z.string(),
  address: z.string(),
  notes: z.string(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

type PatientFormProps = {
  patient?: Patient | null;
  onSubmit: (input: PatientInput) => Promise<void>;
  onCancel: () => void;
};

function formatDateForInput(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentNumber: "",
      dateOfBirth: "",
      sex: "NOT_SPECIFIED",
      phone: "",
      email: "",
      occupation: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    reset({
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      documentNumber: patient?.documentNumber ?? "",
      dateOfBirth: formatDateForInput(patient?.dateOfBirth),
      sex: patient?.sex ?? "NOT_SPECIFIED",
      phone: patient?.phone ?? "",
      email: patient?.email ?? "",
      occupation: patient?.occupation ?? "",
      address: patient?.address ?? "",
      notes: patient?.notes ?? "",
    });
  }, [patient, reset]);

  async function submit(values: PatientFormValues) {
    const parsed = patientFormSchema.parse(values);

    await onSubmit(cleanPatientInput(parsed));
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <FieldError label="Nombre" error={errors.firstName?.message}>
          <Input {...register("firstName")} autoComplete="given-name" />
        </FieldError>
        <FieldError label="Apellido" error={errors.lastName?.message}>
          <Input {...register("lastName")} autoComplete="family-name" />
        </FieldError>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FieldError label="Documento" error={errors.documentNumber?.message}>
          <Input {...register("documentNumber")} />
        </FieldError>
        <FieldError label="Fecha de nacimiento" error={errors.dateOfBirth?.message}>
          <Input type="date" {...register("dateOfBirth")} />
        </FieldError>
        <FieldError label="Sexo" error={errors.sex?.message}>
          <Select {...register("sex")}>
            <option value="NOT_SPECIFIED">No especificado</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
            <option value="OTHER">Otro</option>
          </Select>
        </FieldError>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldError label="Teléfono" error={errors.phone?.message}>
          <Input {...register("phone")} autoComplete="tel" />
        </FieldError>
        <FieldError label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email")} autoComplete="email" />
        </FieldError>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FieldError label="Ocupación" error={errors.occupation?.message}>
          <Input {...register("occupation")} />
        </FieldError>
        <FieldError label="Dirección" error={errors.address?.message}>
          <Input {...register("address")} />
        </FieldError>
      </div>

      <FieldError label="Notas" error={errors.notes?.message}>
        <Textarea {...register("notes")} />
      </FieldError>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : patient ? "Guardar cambios" : "Crear paciente"}
        </Button>
      </div>
    </form>
  );
}

function emptyToUndefined(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? undefined : trimmedValue;
}

function cleanPatientInput(values: PatientFormValues): PatientInput {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    documentNumber: emptyToUndefined(values.documentNumber),
    dateOfBirth: emptyToUndefined(values.dateOfBirth),
    sex: values.sex as PatientSex,
    phone: emptyToUndefined(values.phone),
    email: emptyToUndefined(values.email),
    occupation: emptyToUndefined(values.occupation),
    address: emptyToUndefined(values.address),
    notes: emptyToUndefined(values.notes),
  };
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
    <Label>
      {label}
      {children}
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </Label>
  );
}
