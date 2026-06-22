"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { ObjectiveAssessmentForm } from "@/components/patients/objective-assessment-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createObjectiveAssessment,
  listObjectiveAssessments,
  updateObjectiveAssessment,
  type ObjectiveAssessment,
  type ObjectiveAssessmentInput,
} from "@/lib/patients-api";

const BODY_REGION_LABELS: Record<string, string> = {
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

type ObjectiveAssessmentClientProps = {
  patientId: string;
};

export function ObjectiveAssessmentClient({ patientId }: ObjectiveAssessmentClientProps) {
  const [assessments, setAssessments] = useState<ObjectiveAssessment[]>([]);
  const [selected, setSelected] = useState<ObjectiveAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<ObjectiveAssessment | null>(null);

  async function loadAssessments() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listObjectiveAssessments(patientId);
      setAssessments(response.objectiveAssessments);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No se pudo cargar",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAssessments();
  }, [patientId]);

  async function handleSubmit(input: ObjectiveAssessmentInput) {
    if (editing) {
      await updateObjectiveAssessment(editing.id, input);
    } else {
      await createObjectiveAssessment(patientId, input);
    }

    setIsFormOpen(false);
    setEditing(null);
    await loadAssessments();
  }

  return (
    <>
      <PageHeader
        title="Evaluación objetiva"
        description="Hallazgos clínicos: postura, movilidad, fuerza, tests y palpación."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/patients/${patientId}`}>
              <Button variant="outline">Volver al paciente</Button>
            </Link>
            <Button
              onClick={() => {
                setEditing(null);
                setIsFormOpen(true);
              }}
            >
              Nueva evaluación
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-[#17211d]">Evaluaciones registradas</h2>

          {isLoading ? <LoadingState label="Cargando evaluaciones..." /> : null}

          {!isLoading && assessments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#d9e1dc] p-5 text-sm text-[#66746e]">
              Todavía no hay evaluaciones objetivas registradas para este paciente.
            </div>
          ) : null}

          {!isLoading && assessments.length > 0 ? (
            <div className="grid gap-3">
              {assessments.map((assessment) => (
                <button
                  key={assessment.id}
                  type="button"
                  onClick={() => setSelected(assessment)}
                  className="rounded-lg border border-[#d9e1dc] bg-[#fbfcfb] px-4 py-4 text-left transition hover:border-[#0f766e]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#17211d]">
                        {BODY_REGION_LABELS[assessment.bodyRegion] ?? assessment.bodyRegion}
                      </p>
                      <p className="mt-1 text-sm text-[#66746e]">
                        {formatDate(assessment.createdAt)}
                      </p>
                    </div>
                    {assessment.postureObservation ? (
                      <p className="hidden max-w-xs truncate text-sm text-[#66746e] md:block">
                        {assessment.postureObservation}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="h-fit">
          <h2 className="text-lg font-semibold text-[#17211d]">Detalle</h2>

          {selected ? (
            <div className="mt-4 grid gap-4 text-sm">
              <Info
                label="Región"
                value={BODY_REGION_LABELS[selected.bodyRegion] ?? selected.bodyRegion}
              />
              <Info label="Fecha" value={formatDate(selected.createdAt)} />
              <Info label="Inspección postural" value={selected.postureObservation} />
              <Info label="Movilidad articular" value={selected.rangeOfMotion} />
              <Info label="Fuerza muscular" value={selected.strength} />
              <Info label="Tests funcionales" value={selected.functionalTests} />
              <Info label="Tests especiales" value={selected.specialTests} />
              <Info label="Palpación" value={selected.palpationFindings} />
              <Info label="Calidad de movimiento" value={selected.movementQuality} />
              <Info label="Equilibrio" value={selected.balance} />
              <Info label="Marcha" value={selected.gait} />
              <Info label="Notas" value={selected.notes} />

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(selected);
                    setIsFormOpen(true);
                  }}
                >
                  Editar
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#66746e]">
              Seleccioná una evaluación para ver su detalle.
            </p>
          )}
        </Card>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <h2 className="mb-5 text-xl font-semibold text-[#17211d]">
              {editing ? "Editar evaluación objetiva" : "Nueva evaluación objetiva"}
            </h2>
            <ObjectiveAssessmentForm
              assessment={editing}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditing(null);
              }}
            />
          </Card>
        </div>
      ) : null}
    </>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="font-medium text-[#66746e]">{label}</p>
      <p className="mt-1 text-[#17211d]">{value || "-"}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}
