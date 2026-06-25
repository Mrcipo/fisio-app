"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise, Session, SessionInput } from "@/lib/patients-api";

const optionalText = z.string();
const painScale = z
  .string()
  .refine(
    (value) =>
      value.trim() === "" ||
      (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10),
    "Ingresá un valor entre 0 y 10",
  );

const exerciseEntrySchema = z.object({
  exerciseId: z.string().trim().min(1, "Seleccioná un ejercicio"),
  sets: z.string(),
  reps: z.string(),
  duration: z.string(),
  load: optionalText,
  rpe: painScale,
  symptoms: optionalText,
  notes: optionalText,
});

const formSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  painBefore: painScale,
  painAfter: painScale,
  subjectiveReport: optionalText,
  clinicalNotes: optionalText,
  responseToTreatment: optionalText,
  clinicalDecision: z.enum(["", "MAINTAIN", "PROGRESS", "REGRESS", "REFER"]),
  exercises: z.array(exerciseEntrySchema),
});

type FormValues = z.infer<typeof formSchema>;

type SessionsFormProps = {
  session?: Session | null;
  exercisesCatalog: Exercise[];
  onSubmit: (input: SessionInput) => Promise<void>;
  onCancel: () => void;
};

export function SessionsForm({
  session,
  exercisesCatalog,
  onSubmit,
  onCancel,
}: SessionsFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(session),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  useEffect(() => {
    reset(getDefaultValues(session));
  }, [session, reset]);

  async function submit(values: FormValues) {
    const parsed = formSchema.parse(values);
    await onSubmit(cleanSessionInput(parsed));
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Fecha" error={errors.date?.message}>
          <Input type="date" {...register("date")} />
        </Field>
        <Field label="Dolor antes (0-10)" error={errors.painBefore?.message}>
          <Input inputMode="numeric" {...register("painBefore")} />
        </Field>
        <Field label="Dolor después (0-10)" error={errors.painAfter?.message}>
          <Input inputMode="numeric" {...register("painAfter")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Reporte subjetivo" error={errors.subjectiveReport?.message}>
          <Textarea {...register("subjectiveReport")} />
        </Field>
        <Field label="Notas clínicas" error={errors.clinicalNotes?.message}>
          <Textarea {...register("clinicalNotes")} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Respuesta al tratamiento"
          error={errors.responseToTreatment?.message}
        >
          <Textarea {...register("responseToTreatment")} />
        </Field>
        <Field label="Decisión clínica" error={errors.clinicalDecision?.message}>
          <Select {...register("clinicalDecision")}>
            <option value="">Seleccionar</option>
            <option value="MAINTAIN">Mantener</option>
            <option value="PROGRESS">Progresar</option>
            <option value="REGRESS">Regresar</option>
            <option value="REFER">Derivar</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#17211d]">Ejercicios realizados</h3>
            <p className="text-xs text-[#66746e]">
              Registrá lo realizado durante la sesión.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={exercisesCatalog.length === 0}
            onClick={() =>
              append({
                exerciseId: "",
                sets: "",
                reps: "",
                duration: "",
                load: "",
                rpe: "",
                symptoms: "",
                notes: "",
              })
            }
          >
            Agregar ejercicio
          </Button>
        </div>

        {exercisesCatalog.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No hay ejercicios cargados en el catálogo.{" "}
            <Link href="/exercises" className="font-semibold underline">
              Ir a Ejercicios
            </Link>{" "}
            para agregar ejercicios antes de registrarlos en una sesión.
          </div>
        ) : null}

        {fields.length === 0 ? (
          <Card className="border-dashed p-4 text-sm text-[#66746e]">
            Todavía no agregaste ejercicios realizados en esta sesión.
          </Card>
        ) : null}

        {fields.map((field, index) => (
          <Card key={field.id} className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#17211d]">
                Ejercicio {index + 1}
              </h4>
              <Button type="button" variant="ghost" onClick={() => remove(index)}>
                Quitar
              </Button>
            </div>

            <Field
              label="Ejercicio"
              error={errors.exercises?.[index]?.exerciseId?.message}
            >
              <Select {...register(`exercises.${index}.exerciseId`)}>
                <option value="">Seleccionar ejercicio</option>
                {exercisesCatalog.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Series" error={errors.exercises?.[index]?.sets?.message}>
                <Input inputMode="numeric" {...register(`exercises.${index}.sets`)} />
              </Field>
              <Field label="Repeticiones" error={errors.exercises?.[index]?.reps?.message}>
                <Input inputMode="numeric" {...register(`exercises.${index}.reps`)} />
              </Field>
              <Field label="Duración" error={errors.exercises?.[index]?.duration?.message}>
                <Input inputMode="numeric" {...register(`exercises.${index}.duration`)} />
              </Field>
              <Field label="RPE (0-10)" error={errors.exercises?.[index]?.rpe?.message}>
                <Input inputMode="numeric" {...register(`exercises.${index}.rpe`)} />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Carga" error={errors.exercises?.[index]?.load?.message}>
                <Input {...register(`exercises.${index}.load`)} />
              </Field>
              <Field label="Síntomas" error={errors.exercises?.[index]?.symptoms?.message}>
                <Input {...register(`exercises.${index}.symptoms`)} />
              </Field>
            </div>

            <Field label="Notas" error={errors.exercises?.[index]?.notes?.message}>
              <Textarea {...register(`exercises.${index}.notes`)} />
            </Field>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : session ? "Guardar sesión" : "Crear sesión"}
        </Button>
      </div>
    </form>
  );
}

function Field({
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

function getDefaultValues(session?: Session | null): FormValues {
  return {
    date: session?.date ? session.date.slice(0, 10) : "",
    painBefore:
      session?.painBefore === null || session?.painBefore === undefined
        ? ""
        : String(session.painBefore),
    painAfter:
      session?.painAfter === null || session?.painAfter === undefined
        ? ""
        : String(session.painAfter),
    subjectiveReport: session?.subjectiveReport ?? "",
    clinicalNotes: session?.clinicalNotes ?? "",
    responseToTreatment: session?.responseToTreatment ?? "",
    clinicalDecision: session?.clinicalDecision ?? "",
    exercises:
      session?.sessionExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets === null ? "" : String(exercise.sets),
        reps: exercise.reps === null ? "" : String(exercise.reps),
        duration: exercise.duration === null ? "" : String(exercise.duration),
        load: exercise.load ?? "",
        rpe: exercise.rpe === null ? "" : String(exercise.rpe),
        symptoms: exercise.symptoms ?? "",
        notes: exercise.notes ?? "",
      })) ?? [],
  };
}

function emptyToUndefined(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
}

function stringToNumber(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : Number(trimmedValue);
}

function cleanSessionInput(values: FormValues): SessionInput {
  return {
    date: values.date,
    painBefore: stringToNumber(values.painBefore),
    painAfter: stringToNumber(values.painAfter),
    subjectiveReport: emptyToUndefined(values.subjectiveReport),
    clinicalNotes: emptyToUndefined(values.clinicalNotes),
    responseToTreatment: emptyToUndefined(values.responseToTreatment),
    clinicalDecision:
      values.clinicalDecision === ""
        ? undefined
        : values.clinicalDecision,
    exercises: values.exercises
      .filter((exercise) => exercise.exerciseId.trim() !== "")
      .map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: stringToNumber(exercise.sets),
        reps: stringToNumber(exercise.reps),
        duration: stringToNumber(exercise.duration),
        load: emptyToUndefined(exercise.load),
        rpe: stringToNumber(exercise.rpe),
        symptoms: emptyToUndefined(exercise.symptoms),
        notes: emptyToUndefined(exercise.notes),
      })),
  };
}
