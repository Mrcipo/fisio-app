"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  BodyRegion,
  ObjectiveAssessment,
  ObjectiveAssessmentInput,
} from "@/lib/patients-api";

const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  CERVICAL: "Cervical",
  THORACIC: "Torácica",
  LUMBAR: "Lumbar",
  SHOULDER: "Hombro",
  ELBOW: "Codo",
  WRIST_HAND: "Muñeca / Mano",
  HIP: "Cadera",
  KNEE: "Rodilla",
  ANKLE_FOOT: "Tobillo / Pie",
  GENERAL: "General",
  OTHER: "Otro",
};

const BODY_REGIONS = Object.keys(BODY_REGION_LABELS) as BodyRegion[];

const optionalText = z.string();

const formSchema = z.object({
  bodyRegion: z
    .string()
    .refine(
      (val) => (BODY_REGIONS as readonly string[]).includes(val),
      "Seleccioná una región",
    ),
  postureObservation: optionalText,
  rangeOfMotion: optionalText,
  strength: optionalText,
  functionalTests: optionalText,
  specialTests: optionalText,
  palpationFindings: optionalText,
  movementQuality: optionalText,
  balance: optionalText,
  gait: optionalText,
  notes: optionalText,
});

type FormValues = z.infer<typeof formSchema>;

type ObjectiveAssessmentFormProps = {
  assessment?: ObjectiveAssessment | null;
  onSubmit: (input: ObjectiveAssessmentInput) => Promise<void>;
  onCancel: () => void;
};

export function ObjectiveAssessmentForm({
  assessment,
  onSubmit,
  onCancel,
}: ObjectiveAssessmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(assessment),
  });

  useEffect(() => {
    reset(getDefaultValues(assessment));
  }, [assessment, reset]);

  async function submit(values: FormValues) {
    await onSubmit(cleanInput(values));
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-4">
      <CollapsibleSection
        title="Región e inspección"
        description="Zona evaluada y observación postural general."
        defaultOpen
      >
        <div className="grid gap-4">
          <Field label="Región evaluada" error={errors.bodyRegion?.message}>
            <Select {...register("bodyRegion")}>
              <option value="">Seleccioná una región</option>
              {BODY_REGIONS.map((region) => (
                <option key={region} value={region}>
                  {BODY_REGION_LABELS[region]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Inspección postural" error={errors.postureObservation?.message}>
            <Textarea
              {...register("postureObservation")}
              placeholder="Descripción de la postura, asimetrías, actitudes antálgicas..."
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Movilidad y fuerza"
        description="Rango de movimiento articular y evaluación de fuerza muscular."
        defaultOpen
      >
        <div className="grid gap-4">
          <Field label="Movilidad articular (ROM)" error={errors.rangeOfMotion?.message}>
            <Textarea
              {...register("rangeOfMotion")}
              placeholder="Ej: Flexión cervical 40°, rotación D 60°, rotación I 45°..."
            />
          </Field>
          <Field label="Fuerza muscular" error={errors.strength?.message}>
            <Textarea
              {...register("strength")}
              placeholder="Ej: Flexores cervicales 4/5 bilateral, rotadores 3+/5..."
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Tests clínicos"
        description="Tests funcionales y pruebas especiales realizadas."
      >
        <div className="grid gap-4">
          <Field label="Tests funcionales" error={errors.functionalTests?.message}>
            <Textarea
              {...register("functionalTests")}
              placeholder="Descripción de pruebas funcionales y resultados..."
            />
          </Field>
          <Field label="Tests especiales" error={errors.specialTests?.message}>
            <Textarea
              {...register("specialTests")}
              placeholder="Ej: Test de Spurling: negativo. Test de distracción: positivo..."
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Palpación y calidad de movimiento"
        description="Hallazgos a la palpación y análisis del movimiento."
      >
        <div className="grid gap-4">
          <Field label="Palpación" error={errors.palpationFindings?.message}>
            <Textarea
              {...register("palpationFindings")}
              placeholder="Zonas de dolor, tensión muscular, puntos gatillo, restricciones..."
            />
          </Field>
          <Field label="Calidad de movimiento" error={errors.movementQuality?.message}>
            <Textarea
              {...register("movementQuality")}
              placeholder="Compensaciones, patrones de movimiento, coordinación..."
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Equilibrio y marcha"
        description="Evaluación de balance estático/dinámico y análisis de la marcha."
      >
        <div className="grid gap-4">
          <Field label="Equilibrio" error={errors.balance?.message}>
            <Textarea
              {...register("balance")}
              placeholder="Balance estático, dinámico, test de Romberg, apoyo monopodal..."
            />
          </Field>
          <Field label="Marcha" error={errors.gait?.message}>
            <Textarea
              {...register("gait")}
              placeholder="Patrón de marcha, longitud de paso, cadencia, alteraciones..."
            />
          </Field>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Notas adicionales" description="Observaciones clínicas relevantes.">
        <Field label="Notas" error={errors.notes?.message}>
          <Textarea
            {...register("notes")}
            placeholder="Otras observaciones, hallazgos relevantes, contexto clínico..."
          />
        </Field>
      </CollapsibleSection>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando..."
            : assessment
              ? "Guardar evaluación"
              : "Crear evaluación"}
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

function getDefaultValues(assessment?: ObjectiveAssessment | null): FormValues {
  return {
    bodyRegion: assessment?.bodyRegion ?? "",
    postureObservation: assessment?.postureObservation ?? "",
    rangeOfMotion: assessment?.rangeOfMotion ?? "",
    strength: assessment?.strength ?? "",
    functionalTests: assessment?.functionalTests ?? "",
    specialTests: assessment?.specialTests ?? "",
    palpationFindings: assessment?.palpationFindings ?? "",
    movementQuality: assessment?.movementQuality ?? "",
    balance: assessment?.balance ?? "",
    gait: assessment?.gait ?? "",
    notes: assessment?.notes ?? "",
  };
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function cleanInput(values: FormValues): ObjectiveAssessmentInput {
  return {
    bodyRegion: values.bodyRegion as BodyRegion,
    postureObservation: emptyToUndefined(values.postureObservation),
    rangeOfMotion: emptyToUndefined(values.rangeOfMotion),
    strength: emptyToUndefined(values.strength),
    functionalTests: emptyToUndefined(values.functionalTests),
    specialTests: emptyToUndefined(values.specialTests),
    palpationFindings: emptyToUndefined(values.palpationFindings),
    movementQuality: emptyToUndefined(values.movementQuality),
    balance: emptyToUndefined(values.balance),
    gait: emptyToUndefined(values.gait),
    notes: emptyToUndefined(values.notes),
  };
}
