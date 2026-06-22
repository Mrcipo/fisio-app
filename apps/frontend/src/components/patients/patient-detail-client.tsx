"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { InitialAssessmentForm } from "@/components/patients/initial-assessment-form";
import { PatientForm } from "@/components/patients/patient-form";
import { SessionsPanel } from "@/components/patients/sessions-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createInitialAssessment,
  getPatient,
  getInitialAssessment,
  openPatientReport,
  updateInitialAssessment,
  updatePatient,
  type InitialAssessment,
  type Patient,
  type PatientInput,
} from "@/lib/patients-api";

type PatientDetailClientProps = {
  patientId: string;
};

const sections = ["Plan de rehabilitación", "Progreso clínico"];

export function PatientDetailClient({ patientId }: PatientDetailClientProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialAssessment, setInitialAssessment] = useState<InitialAssessment | null>(null);
  const [initialAssessmentError, setInitialAssessmentError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  async function loadPatient() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getPatient(patientId);
      setPatient(response.patient);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    void loadPatient();
  }, [hasMounted, patientId]);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    async function loadAssessment() {
      try {
        const response = await getInitialAssessment(patientId);
        setInitialAssessment(response.initialAssessment);
        setInitialAssessmentError(null);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "No se pudo cargar la anamnesis";

        if (message === "Initial assessment not found") {
          setInitialAssessment(null);
          setInitialAssessmentError(null);
          return;
        }

        setInitialAssessmentError(message);
      }
    }

    void loadAssessment();
  }, [hasMounted, patientId]);

  if (!hasMounted) {
    return <LoadingState label="Cargando paciente..." />;
  }

  async function handleSubmit(input: PatientInput) {
    await updatePatient(patientId, input);
    setIsEditing(false);
    await loadPatient();
  }

  async function handleInitialAssessmentSubmit(input: {
    reasonForConsultation: string;
    onsetDate?: string;
    injuryMechanism?: string;
    medicalDiagnosis?: string;
    currentPain?: number;
    maxPain?: number;
    minPain?: number;
    painLocation?: string;
    painType?: string;
    irradiation?: string;
    aggravatingFactors?: string;
    relievingFactors?: string;
    neurologicalSymptoms?: string;
    previousSurgeries?: string;
    medications?: string;
    relevantHistory?: string;
    redFlags?: string;
    patientGoals?: string;
    limitedActivities?: string;
  }) {
    const response = initialAssessment
      ? await updateInitialAssessment(patientId, input)
      : await createInitialAssessment(patientId, input);

    setInitialAssessment(response.initialAssessment);
    setInitialAssessmentError(null);
  }

  async function handleOpenReport() {
    setIsGeneratingReport(true);

    try {
      await openPatientReport(patientId);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo generar el informe",
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Cargando paciente..." />;
  }

  if (error || !patient) {
    return (
      <EmptyState
        title="No se pudo cargar el paciente"
        description={error ?? "Intentá nuevamente en unos minutos."}
        action={
          <Link href="/patients" className="text-sm font-semibold text-[#0f766e]">
            Volver a pacientes
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title={`${patient.firstName} ${patient.lastName}`}
        description="Datos básicos y módulos clínicos del paciente."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/patients/${patientId}/progress`}>
              <Button variant="outline">Ver evolución</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => void handleOpenReport()}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? "Generando..." : "Generar informe"}
            </Button>
            <Button onClick={() => setIsEditing(true)}>Editar datos</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4">
          <Card>
            <h2 className="text-lg font-semibold text-[#17211d]">Datos básicos</h2>
            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <Info label="Documento" value={patient.documentNumber} />
              <Info label="Fecha de nacimiento" value={formatDate(patient.dateOfBirth)} />
              <Info label="Sexo" value={formatSex(patient.sex)} />
              <Info label="Teléfono" value={patient.phone} />
              <Info label="Email" value={patient.email} />
              <Info label="Ocupación" value={patient.occupation} />
              <Info label="Dirección" value={patient.address} />
              <Info label="Notas" value={patient.notes} />
            </dl>
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#17211d]">Anamnesis inicial</h2>
              <p className="mt-2 text-sm leading-6 text-[#66746e]">
                Registro clínico inicial del motivo de consulta, dolor, antecedentes y metas
                funcionales.
              </p>
            </div>

            {initialAssessmentError ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {initialAssessmentError}
              </div>
            ) : null}

            <InitialAssessmentForm
              initialAssessment={initialAssessment}
              onSubmit={handleInitialAssessmentSubmit}
            />
          </Card>

          <SessionsPanel patientId={patientId} />

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#17211d]">Evaluación objetiva</h2>
                <p className="mt-2 text-sm leading-6 text-[#66746e]">
                  Postura, movilidad, fuerza, tests clínicos y palpación.
                </p>
              </div>
              <Link href={`/patients/${patientId}/objective-assessment`}>
                <Button variant="outline">Ver evaluaciones</Button>
              </Link>
            </div>
          </Card>

          {sections.map((section) => (
            <Card key={section}>
              <h2 className="text-lg font-semibold text-[#17211d]">{section}</h2>
              <p className="mt-2 text-sm leading-6 text-[#66746e]">
                Este bloque queda preparado para conectar el módulo clínico correspondiente.
              </p>
            </Card>
          ))}
        </div>

        <Card className="h-fit">
          <h2 className="text-lg font-semibold text-[#17211d]">Resumen</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Info label="Creado" value={formatDate(patient.createdAt)} />
            <Info label="Última edición" value={formatDate(patient.updatedAt)} />
          </div>
        </Card>
      </div>

      {isEditing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[#17211d]">Editar paciente</h2>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cerrar
              </Button>
            </div>
            <PatientForm
              patient={patient}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
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
      <dt className="font-medium text-[#66746e]">{label}</dt>
      <dd className="mt-1 text-[#17211d]">{value || "-"}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}

function formatSex(value: Patient["sex"]) {
  const labels = {
    FEMALE: "Femenino",
    MALE: "Masculino",
    OTHER: "Otro",
    NOT_SPECIFIED: "No especificado",
  };

  return labels[value];
}
