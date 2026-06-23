"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createExercise,
  deleteExercise,
  listExercises,
  updateExercise,
  type BodyRegion,
  type Exercise,
  type ExerciseInput,
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

const EMPTY_FORM: ExerciseInput = {
  name: "",
  description: "",
  bodyRegion: undefined,
  objective: "",
  defaultSets: undefined,
  defaultReps: undefined,
  defaultDuration: undefined,
  defaultLoad: "",
  precautions: "",
};

export function ExercisesClient() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<BodyRegion | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<ExerciseInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadExercises() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listExercises();
      setExercises(response.exercises);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadExercises();
  }, []);

  function openCreate() {
    setEditingExercise(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEdit(exercise: Exercise) {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description ?? "",
      bodyRegion: exercise.bodyRegion ?? undefined,
      objective: exercise.objective ?? "",
      defaultSets: exercise.defaultSets ?? undefined,
      defaultReps: exercise.defaultReps ?? undefined,
      defaultDuration: exercise.defaultDuration ?? undefined,
      defaultLoad: exercise.defaultLoad ?? "",
      precautions: exercise.precautions ?? "",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: ExerciseInput = {
        name: formData.name,
        ...(formData.description ? { description: formData.description } : {}),
        ...(formData.bodyRegion ? { bodyRegion: formData.bodyRegion } : {}),
        ...(formData.objective ? { objective: formData.objective } : {}),
        ...(formData.defaultSets != null ? { defaultSets: formData.defaultSets } : {}),
        ...(formData.defaultReps != null ? { defaultReps: formData.defaultReps } : {}),
        ...(formData.defaultDuration != null ? { defaultDuration: formData.defaultDuration } : {}),
        ...(formData.defaultLoad ? { defaultLoad: formData.defaultLoad } : {}),
        ...(formData.precautions ? { precautions: formData.precautions } : {}),
      };

      if (editingExercise) {
        await updateExercise(editingExercise.id, payload);
      } else {
        await createExercise(payload);
      }

      setIsFormOpen(false);
      setEditingExercise(null);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!exerciseToDelete) return;

    try {
      await deleteExercise(exerciseToDelete.id);
      setExerciseToDelete(null);
      await loadExercises();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al eliminar");
    }
  }

  const visible = filterRegion
    ? exercises.filter((ex) => ex.bodyRegion === filterRegion)
    : exercises;

  return (
    <>
      <PageHeader
        title="Biblioteca de ejercicios"
        description="Ejercicios reutilizables en sesiones clínicas."
        action={<Button onClick={openCreate}>Nuevo ejercicio</Button>}
      />

      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3">
        <Label htmlFor="filter-region" className="shrink-0 text-sm">
          Filtrar por región:
        </Label>
        <Select
          id="filter-region"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value as BodyRegion | "")}
          className="w-52"
        >
          <option value="">Todas las regiones</option>
          {BODY_REGIONS.map((region) => (
            <option key={region} value={region}>
              {BODY_REGION_LABELS[region]}
            </option>
          ))}
        </Select>
        {filterRegion ? (
          <button
            type="button"
            onClick={() => setFilterRegion("")}
            className="text-sm text-[#0f766e] hover:underline"
          >
            Limpiar filtro
          </button>
        ) : null}
      </div>

      {isLoading ? <LoadingState label="Cargando ejercicios..." /> : null}

      {!isLoading && visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9e1dc] p-8 text-center text-sm text-[#66746e]">
          {filterRegion
            ? `No hay ejercicios para la región "${BODY_REGION_LABELS[filterRegion]}".`
            : "Todavía no hay ejercicios en la biblioteca. Creá el primero."}
        </div>
      ) : null}

      {!isLoading && visible.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((exercise) => (
            <Card key={exercise.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-[#17211d]">{exercise.name}</p>
                  {exercise.bodyRegion ? (
                    <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {BODY_REGION_LABELS[exercise.bodyRegion]}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => openEdit(exercise)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setExerciseToDelete(exercise)}>
                    Eliminar
                  </Button>
                </div>
              </div>

              {exercise.objective ? (
                <p className="text-sm text-[#66746e]">
                  <span className="font-medium text-[#17211d]">Objetivo:</span> {exercise.objective}
                </p>
              ) : null}

              {exercise.description ? (
                <p className="text-sm text-[#66746e]">{exercise.description}</p>
              ) : null}

              {exercise.defaultSets || exercise.defaultReps || exercise.defaultDuration ? (
                <p className="text-xs text-[#66746e]">
                  {[
                    exercise.defaultSets ? `${exercise.defaultSets} series` : null,
                    exercise.defaultReps ? `${exercise.defaultReps} reps` : null,
                    exercise.defaultDuration ? `${exercise.defaultDuration} seg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}

              {exercise.precautions ? (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <span className="font-semibold">Precauciones:</span> {exercise.precautions}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {isFormOpen ? (
        <Modal
          title={editingExercise ? "Editar ejercicio" : "Nuevo ejercicio"}
          onClose={() => setIsFormOpen(false)}
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ex-name">Nombre</Label>
              <Input
                id="ex-name"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Sentadilla isométrica contra pared"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="ex-region">Región corporal</Label>
                <Select
                  id="ex-region"
                  value={formData.bodyRegion ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bodyRegion: (e.target.value as BodyRegion) || undefined,
                    }))
                  }
                >
                  <option value="">Sin especificar</option>
                  {BODY_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {BODY_REGION_LABELS[region]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="ex-load">Carga por defecto</Label>
                <Input
                  id="ex-load"
                  value={formData.defaultLoad ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, defaultLoad: e.target.value }))}
                  placeholder="Ej: Peso corporal"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ex-objective">Objetivo</Label>
              <Input
                id="ex-objective"
                value={formData.objective ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                placeholder="Ej: Activación de glúteo medio"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="ex-sets">Series</Label>
                <Input
                  id="ex-sets"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.defaultSets ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultSets: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="3"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ex-reps">Repeticiones</Label>
                <Input
                  id="ex-reps"
                  type="number"
                  min={1}
                  max={500}
                  value={formData.defaultReps ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultReps: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="12"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ex-duration">Duración (seg)</Label>
                <Input
                  id="ex-duration"
                  type="number"
                  min={1}
                  value={formData.defaultDuration ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultDuration: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ex-description">Descripción / ejecución</Label>
              <Textarea
                id="ex-description"
                rows={3}
                value={formData.description ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de la técnica de ejecución..."
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="ex-precautions">Precauciones</Label>
              <Textarea
                id="ex-precautions"
                rows={2}
                value={formData.precautions ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, precautions: e.target.value }))}
                placeholder="Contraindicaciones, cuidados especiales..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingExercise(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Guardando..."
                  : editingExercise
                    ? "Guardar cambios"
                    : "Crear ejercicio"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {exerciseToDelete ? (
        <Modal title="Eliminar ejercicio" onClose={() => setExerciseToDelete(null)}>
          <p className="text-sm leading-6 text-[#66746e]">
            ¿Eliminás "{exerciseToDelete.name}"? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setExerciseToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-8">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-[#17211d]">{title}</h2>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}
