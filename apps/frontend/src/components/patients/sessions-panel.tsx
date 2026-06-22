"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { SessionsForm } from "@/components/patients/sessions-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createSession,
  deleteSession,
  getSession,
  listExercises,
  listSessions,
  updateSession,
  type Exercise,
  type Session,
  type SessionInput,
} from "@/lib/patients-api";

type SessionsPanelProps = {
  patientId: string;
};

export function SessionsPanel({ patientId }: SessionsPanelProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);

  async function loadSessions() {
    setIsLoading(true);
    setError(null);

    try {
      const [sessionsResponse, exercisesResponse] = await Promise.all([
        listSessions(patientId),
        listExercises(),
      ]);

      setSessions(sessionsResponse.sessions);
      setExercises(exercisesResponse.exercises);

      if (selectedSession) {
        const freshSession = sessionsResponse.sessions.find((item) => item.id === selectedSession.id);
        setSelectedSession(freshSession ?? null);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSessions();
  }, [patientId]);

  async function openSessionDetail(sessionId: string) {
    try {
      const response = await getSession(sessionId);
      setSelectedSession(response.session);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar la sesión");
    }
  }

  async function handleSubmit(input: SessionInput) {
    if (editingSession) {
      await updateSession(editingSession.id, input);
    } else {
      await createSession(patientId, input);
    }

    setIsFormOpen(false);
    setEditingSession(null);
    await loadSessions();
  }

  async function handleDelete() {
    if (!sessionToDelete) {
      return;
    }

    await deleteSession(sessionToDelete.id);

    if (selectedSession?.id === sessionToDelete.id) {
      setSelectedSession(null);
    }

    setSessionToDelete(null);
    await loadSessions();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#17211d]">Sesiones</h2>
            <p className="mt-1 text-sm text-[#66746e]">
              Seguimiento cronológico de dolor, respuesta clínica y ejercicios realizados.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingSession(null);
              setIsFormOpen(true);
            }}
          >
            Nueva sesión
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {isLoading ? <LoadingState label="Cargando sesiones..." /> : null}

        {!isLoading && sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d9e1dc] p-5 text-sm text-[#66746e]">
            Todavía no hay sesiones registradas para este paciente.
          </div>
        ) : null}

        {!isLoading && sessions.length > 0 ? (
          <div className="grid gap-3">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => void openSessionDetail(session.id)}
                className="rounded-lg border border-[#d9e1dc] bg-[#fbfcfb] px-4 py-4 text-left transition hover:border-[#0f766e]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#17211d]">
                      {formatDate(session.date)}
                    </p>
                    <p className="mt-1 text-sm text-[#66746e]">
                      {session.subjectiveReport || "Sin reporte subjetivo"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Tag label={`Dolor antes: ${formatNumber(session.painBefore)}`} />
                    <Tag label={`Dolor después: ${formatNumber(session.painAfter)}`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="h-fit">
        <h2 className="text-lg font-semibold text-[#17211d]">Detalle de sesión</h2>
        {selectedSession ? (
          <div className="mt-4 grid gap-4 text-sm">
            <Info label="Fecha" value={formatDate(selectedSession.date)} />
            <Info label="Dolor antes" value={formatNumber(selectedSession.painBefore)} />
            <Info label="Dolor después" value={formatNumber(selectedSession.painAfter)} />
            <Info label="Reporte subjetivo" value={selectedSession.subjectiveReport} />
            <Info label="Notas clínicas" value={selectedSession.clinicalNotes} />
            <Info
              label="Respuesta al tratamiento"
              value={selectedSession.responseToTreatment}
            />
            <Info
              label="Decisión clínica"
              value={formatClinicalDecision(selectedSession.clinicalDecision)}
            />

            <div>
              <p className="font-medium text-[#66746e]">Ejercicios realizados</p>
              <div className="mt-2 grid gap-2">
                {selectedSession.sessionExercises.length > 0 ? (
                  selectedSession.sessionExercises.map((exercise, index) => {
                    const exerciseDefinition = exercises.find(
                      (item) => item.id === exercise.exerciseId,
                    );

                    return (
                      <div
                        key={exercise.id}
                        className="rounded-md border border-[#d9e1dc] bg-[#fbfcfb] p-3"
                      >
                        <p className="font-semibold text-[#17211d]">
                          {exerciseDefinition?.name ?? `Ejercicio ${index + 1}`}
                        </p>
                        <p className="mt-1 text-[#66746e]">
                          Series: {formatNumber(exercise.sets)} | Reps: {formatNumber(exercise.reps)}{" "}
                          | Duración: {formatNumber(exercise.duration)} | RPE:{" "}
                          {formatNumber(exercise.rpe)}
                        </p>
                        {exercise.load || exercise.symptoms || exercise.notes ? (
                          <p className="mt-1 text-[#66746e]">
                            {exercise.load ? `Carga: ${exercise.load}. ` : ""}
                            {exercise.symptoms ? `Síntomas: ${exercise.symptoms}. ` : ""}
                            {exercise.notes ? `Notas: ${exercise.notes}.` : ""}
                          </p>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[#66746e]">No se registraron ejercicios realizados.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingSession(selectedSession);
                  setIsFormOpen(true);
                }}
              >
                Editar
              </Button>
              <Button variant="danger" onClick={() => setSessionToDelete(selectedSession)}>
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#66746e]">
            Seleccioná una sesión para ver su detalle clínico.
          </p>
        )}
      </Card>

      {isFormOpen ? (
        <Modal title={editingSession ? "Editar sesión" : "Nueva sesión"}>
          <SessionsForm
            session={editingSession}
            exercisesCatalog={exercises}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingSession(null);
            }}
          />
        </Modal>
      ) : null}

      {sessionToDelete ? (
        <Modal title="Eliminar sesión">
          <p className="text-sm leading-6 text-[#66746e]">
            Esta acción eliminará la sesión del {formatDate(sessionToDelete.date)}.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSessionToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
      <Card className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">
        <h2 className="mb-5 text-xl font-semibold text-[#17211d]">{title}</h2>
        {children}
      </Card>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0f766e]">
      {label}
    </span>
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
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}

function formatNumber(value?: number | null) {
  return value === null || value === undefined ? "-" : String(value);
}

function formatClinicalDecision(
  value?: "MAINTAIN" | "PROGRESS" | "REGRESS" | "REFER" | null,
) {
  const labels = {
    MAINTAIN: "Mantener",
    PROGRESS: "Progresar",
    REGRESS: "Regresar",
    REFER: "Derivar",
  };

  return value ? labels[value] : "-";
}
