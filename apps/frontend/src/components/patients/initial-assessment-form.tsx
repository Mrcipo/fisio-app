"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  InitialAssessment,
  InitialAssessmentInput,
} from "@/lib/patients-api";

const optionalText = z.string();
const optionalPain = z
  .string()
  .refine(
    (value) =>
      value.trim() === "" ||
      (Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 10),
    "Ingresá un valor entre 0 y 10",
  );

const formSchema = z.object({
  reasonForConsultation: z.string().trim().min(1, "El motivo de consulta es obligatorio"),
  onsetDate: z.string(),
  injuryMechanism: optionalText,
  medicalDiagnosis: optionalText,
  currentPain: optionalPain,
  maxPain: optionalPain,
  minPain: optionalPain,
  painLocation: optionalText,
  painType: optionalText,
  irradiation: optionalText,
  aggravatingFactors: optionalText,
  relievingFactors: optionalText,
  neurologicalSymptoms: optionalText,
  previousSurgeries: optionalText,
  medications: optionalText,
  relevantHistory: optionalText,
  redFlags: optionalText,
  patientGoals: optionalText,
  limitedActivities: optionalText,
});

type FormValues = z.infer<typeof formSchema>;

type InitialAssessmentFormProps = {
  initialAssessment?: InitialAssessment | null;
  onSubmit: (input: InitialAssessmentInput) => Promise<void>;
};

export function InitialAssessmentForm({
  initialAssessment,
  onSubmit,
}: InitialAssessmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(initialAssessment),
  });

  useEffect(() => {
    reset(getDefaultValues(initialAssessment));
  }, [initialAssessment, reset]);

  async function submit(values: FormValues) {
    const parsed = formSchema.parse(values);
    await onSubmit(cleanInput(parsed));
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <CollapsibleSection
        title="Motivo principal"
        description="Información general del problema actual y tiempo de evolución."
        defaultOpen
      >
        <div className="grid gap-4">
          <Field label="Motivo de consulta" error={errors.reasonForConsultation?.message}>
            <Textarea {...register("reasonForConsultation")} />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Fecha de inicio" error={errors.onsetDate?.message}>
              <Input type="date" {...register("onsetDate")} />
            </Field>
            <Field label="Mecanismo de lesión" error={errors.injuryMechanism?.message}>
              <Input {...register("injuryMechanism")} />
            </Field>
          </div>
          <Field label="Diagnóstico médico" error={errors.medicalDiagnosis?.message}>
            <Input {...register("medicalDiagnosis")} />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Dolor y síntomas"
        description="Intensidad, características y distribución del dolor."
        defaultOpen
      >
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Dolor actual (0-10)" error={errors.currentPain?.message}>
              <Input inputMode="numeric" {...register("currentPain")} />
            </Field>
            <Field label="Dolor máximo (0-10)" error={errors.maxPain?.message}>
              <Input inputMode="numeric" {...register("maxPain")} />
            </Field>
            <Field label="Dolor mínimo (0-10)" error={errors.minPain?.message}>
              <Input inputMode="numeric" {...register("minPain")} />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Localización del dolor" error={errors.painLocation?.message}>
              <Input {...register("painLocation")} />
            </Field>
            <Field label="Tipo de dolor" error={errors.painType?.message}>
              <Input {...register("painType")} />
            </Field>
          </div>
          <Field label="Irradiación" error={errors.irradiation?.message}>
            <Input {...register("irradiation")} />
          </Field>
          <Field
            label="Síntomas neurológicos"
            error={errors.neurologicalSymptoms?.message}
          >
            <Textarea {...register("neurologicalSymptoms")} />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Factores y antecedentes"
        description="Elementos que agravan o alivian, historial y seguridad clínica."
      >
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Factores agravantes" error={errors.aggravatingFactors?.message}>
              <Textarea {...register("aggravatingFactors")} />
            </Field>
            <Field label="Factores aliviantes" error={errors.relievingFactors?.message}>
              <Textarea {...register("relievingFactors")} />
            </Field>
          </div>
          <Field label="Cirugías previas" error={errors.previousSurgeries?.message}>
            <Textarea {...register("previousSurgeries")} />
          </Field>
          <Field label="Medicación" error={errors.medications?.message}>
            <Textarea {...register("medications")} />
          </Field>
          <Field label="Antecedentes relevantes" error={errors.relevantHistory?.message}>
            <Textarea {...register("relevantHistory")} />
          </Field>
          <Field label="Banderas rojas" error={errors.redFlags?.message}>
            <Textarea {...register("redFlags")} />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Objetivos y limitaciones"
        description="Qué espera recuperar el paciente y cómo impacta el problema hoy."
      >
        <div className="grid gap-4">
          <Field label="Objetivos del paciente" error={errors.patientGoals?.message}>
            <Textarea {...register("patientGoals")} />
          </Field>
          <Field label="Actividades limitadas" error={errors.limitedActivities?.message}>
            <Textarea {...register("limitedActivities")} />
          </Field>
        </div>
      </CollapsibleSection>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : initialAssessment
              ? "Guardar anamnesis"
              : "Crear anamnesis inicial"}
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

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getDefaultValues(initialAssessment?: InitialAssessment | null): FormValues {
  return {
    reasonForConsultation: initialAssessment?.reasonForConsultation ?? "",
    onsetDate: formatDate(initialAssessment?.onsetDate),
    injuryMechanism: initialAssessment?.injuryMechanism ?? "",
    medicalDiagnosis: initialAssessment?.medicalDiagnosis ?? "",
    currentPain:
      initialAssessment?.currentPain === null || initialAssessment?.currentPain === undefined
        ? ""
        : String(initialAssessment.currentPain),
    maxPain:
      initialAssessment?.maxPain === null || initialAssessment?.maxPain === undefined
        ? ""
        : String(initialAssessment.maxPain),
    minPain:
      initialAssessment?.minPain === null || initialAssessment?.minPain === undefined
        ? ""
        : String(initialAssessment.minPain),
    painLocation: initialAssessment?.painLocation ?? "",
    painType: initialAssessment?.painType ?? "",
    irradiation: initialAssessment?.irradiation ?? "",
    aggravatingFactors: initialAssessment?.aggravatingFactors ?? "",
    relievingFactors: initialAssessment?.relievingFactors ?? "",
    neurologicalSymptoms: initialAssessment?.neurologicalSymptoms ?? "",
    previousSurgeries: initialAssessment?.previousSurgeries ?? "",
    medications: initialAssessment?.medications ?? "",
    relevantHistory: initialAssessment?.relevantHistory ?? "",
    redFlags: initialAssessment?.redFlags ?? "",
    patientGoals: initialAssessment?.patientGoals ?? "",
    limitedActivities: initialAssessment?.limitedActivities ?? "",
  };
}

function emptyToUndefined(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
}

function stringToPain(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? undefined : Number(trimmedValue);
}

function cleanInput(values: FormValues): InitialAssessmentInput {
  return {
    reasonForConsultation: values.reasonForConsultation.trim(),
    onsetDate: emptyToUndefined(values.onsetDate),
    injuryMechanism: emptyToUndefined(values.injuryMechanism),
    medicalDiagnosis: emptyToUndefined(values.medicalDiagnosis),
    currentPain: stringToPain(values.currentPain),
    maxPain: stringToPain(values.maxPain),
    minPain: stringToPain(values.minPain),
    painLocation: emptyToUndefined(values.painLocation),
    painType: emptyToUndefined(values.painType),
    irradiation: emptyToUndefined(values.irradiation),
    aggravatingFactors: emptyToUndefined(values.aggravatingFactors),
    relievingFactors: emptyToUndefined(values.relievingFactors),
    neurologicalSymptoms: emptyToUndefined(values.neurologicalSymptoms),
    previousSurgeries: emptyToUndefined(values.previousSurgeries),
    medications: emptyToUndefined(values.medications),
    relevantHistory: emptyToUndefined(values.relevantHistory),
    redFlags: emptyToUndefined(values.redFlags),
    patientGoals: emptyToUndefined(values.patientGoals),
    limitedActivities: emptyToUndefined(values.limitedActivities),
  };
}
