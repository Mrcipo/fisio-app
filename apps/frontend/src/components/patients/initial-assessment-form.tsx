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
import { Select } from "@/components/ui/select";
import type {
  InitialAssessment,
  InitialAssessmentInput,
  IrritabilityLevel,
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
  painMorning: optionalText,
  painDayTime: optionalText,
  painNight: optionalText,
  irritability: z.string(),
  irritabilityNotes: optionalText,
  yellowFlags: optionalText,
  kinesophobia: z.boolean(),
  workRelated: z.boolean(),
  compensationClaim: z.boolean(),
  sportActivity: optionalText,
  sportLevel: optionalText,
  workPosture: optionalText,
  sleepImpact: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

type InitialAssessmentFormProps = {
  initialAssessment?: InitialAssessment | null;
  onSubmit: (input: InitialAssessmentInput) => Promise<void>;
};

const IRRITABILITY_TOOLTIP =
  "Alta: el dolor se provoca fácilmente y tarda en calmarse. " +
  "Media: se provoca con esfuerzo moderado. " +
  "Baja: difícil de provocar y se calma rápido.";

export function InitialAssessmentForm({
  initialAssessment,
  onSubmit,
}: InitialAssessmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
        title="Comportamiento del dolor en 24 horas"
        description="El patrón circadiano define el tipo de patología y la agresividad del tratamiento."
      >
        <div className="grid gap-4">
          <Field label="Al levantarse" error={errors.painMorning?.message}>
            <Textarea
              {...register("painMorning")}
              placeholder="¿Cómo está el dolor al despertar? ¿Mejora o empeora al moverse?"
            />
          </Field>
          <Field label="Durante el día" error={errors.painDayTime?.message}>
            <Textarea
              {...register("painDayTime")}
              placeholder="¿Empeora con la actividad sostenida? ¿Mejora o empeora hacia la tarde?"
            />
          </Field>
          <Field
            label="Por la noche / ¿Despierta al paciente?"
            error={errors.painNight?.message}
          >
            <Textarea
              {...register("painNight")}
              placeholder="¿El dolor interrumpe el sueño? ¿En qué posición? ¿A qué hora?"
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Irritabilidad del cuadro"
        description="Determina la intensidad segura de exploración y tratamiento desde la primera sesión."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium leading-none">Nivel de irritabilidad</span>
              <span
                title={IRRITABILITY_TOOLTIP}
                className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-muted text-xs text-muted-foreground"
              >
                ?
              </span>
            </div>
            <Select {...register("irritability")}>
              <option value="">Seleccionar irritabilidad…</option>
              <option value="LOW">Baja — difícil de provocar, se calma rápido</option>
              <option value="MEDIUM">Media — se provoca con esfuerzo moderado</option>
              <option value="HIGH">Alta — se provoca fácilmente, tarda en calmarse</option>
            </Select>
          </div>
          <Field label="Justificación / observaciones" error={errors.irritabilityNotes?.message}>
            <Textarea
              {...register("irritabilityNotes")}
              placeholder="¿Qué movimientos o actividades demuestran la irritabilidad del cuadro?"
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Factores psicosociales (Yellow Flags)"
        description="Los factores psicosociales predicen cronicidad mejor que los hallazgos estructurales."
      >
        <div className="grid gap-4">
          <div className="grid gap-3">
            <CheckboxField
              id="kinesophobia"
              label="Kinesiofobia — miedo al movimiento o a re-lesionarse"
              checked={watch("kinesophobia")}
              onChange={(v) => setValue("kinesophobia", v)}
            />
            <CheckboxField
              id="workRelated"
              label="Relacionado con el trabajo (lesión laboral o estrés ocupacional)"
              checked={watch("workRelated")}
              onChange={(v) => setValue("workRelated", v)}
            />
            <CheckboxField
              id="compensationClaim"
              label="Reclamo indemnizatorio activo (ART, seguro, litigio)"
              checked={watch("compensationClaim")}
              onChange={(v) => setValue("compensationClaim", v)}
            />
          </div>
          <Field
            label="Observaciones psicosociales"
            error={errors.yellowFlags?.message}
          >
            <Textarea
              {...register("yellowFlags")}
              placeholder="Catastrofización, estado emocional, red de apoyo, situación laboral, etc."
            />
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
        title="Actividad y demanda funcional"
        description="Deporte, trabajo y sueño — determinan los objetivos terapéuticos."
      >
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Deporte o actividad física" error={errors.sportActivity?.message}>
              <Input
                {...register("sportActivity")}
                placeholder="Fútbol, running, natación…"
              />
            </Field>
            <Field label="Nivel de actividad" error={errors.sportLevel?.message}>
              <Input
                {...register("sportLevel")}
                placeholder="Recreativo, amateur, competitivo, élite"
              />
            </Field>
          </div>
          <Field label="Demanda postural laboral" error={errors.workPosture?.message}>
            <Input
              {...register("workPosture")}
              placeholder="Trabajo de escritorio, de pie, carga manual, conducción…"
            />
          </Field>
          <CheckboxField
            id="sleepImpact"
            label="El dolor afecta la calidad del sueño"
            checked={watch("sleepImpact")}
            onChange={(v) => setValue("sleepImpact", v)}
          />
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

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-primary"
      />
      {label}
    </label>
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
    painMorning: initialAssessment?.painMorning ?? "",
    painDayTime: initialAssessment?.painDayTime ?? "",
    painNight: initialAssessment?.painNight ?? "",
    irritability: initialAssessment?.irritability ?? "",

    irritabilityNotes: initialAssessment?.irritabilityNotes ?? "",
    yellowFlags: initialAssessment?.yellowFlags ?? "",
    kinesophobia: initialAssessment?.kinesophobia ?? false,
    workRelated: initialAssessment?.workRelated ?? false,
    compensationClaim: initialAssessment?.compensationClaim ?? false,
    sportActivity: initialAssessment?.sportActivity ?? "",
    sportLevel: initialAssessment?.sportLevel ?? "",
    workPosture: initialAssessment?.workPosture ?? "",
    sleepImpact: initialAssessment?.sleepImpact ?? false,
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
    painMorning: emptyToUndefined(values.painMorning),
    painDayTime: emptyToUndefined(values.painDayTime),
    painNight: emptyToUndefined(values.painNight),
    irritability:
      values.irritability !== "" ? (values.irritability as IrritabilityLevel) : undefined,
    irritabilityNotes: emptyToUndefined(values.irritabilityNotes),
    yellowFlags: emptyToUndefined(values.yellowFlags),
    kinesophobia: values.kinesophobia || undefined,
    workRelated: values.workRelated || undefined,
    compensationClaim: values.compensationClaim || undefined,
    sportActivity: emptyToUndefined(values.sportActivity),
    sportLevel: emptyToUndefined(values.sportLevel),
    workPosture: emptyToUndefined(values.workPosture),
    sleepImpact: values.sleepImpact || undefined,
  };
}
