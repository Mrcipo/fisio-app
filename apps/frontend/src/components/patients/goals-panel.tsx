"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
  type ClinicalGoal,
  type ClinicalGoalInput,
  type ClinicalGoalPriority,
  type ClinicalGoalStatus,
} from "@/lib/patients-api";

type GoalsPanelProps = {
  patientId: string;
};

const STATUS_LABELS: Record<ClinicalGoalStatus, string> = {
  ACTIVE: "Activo",
  ACHIEVED: "Logrado",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
};

const STATUS_NEXT: Record<ClinicalGoalStatus, ClinicalGoalStatus> = {
  ACTIVE: "ACHIEVED",
  ACHIEVED: "PAUSED",
  PAUSED: "CANCELLED",
  CANCELLED: "ACTIVE",
};

const STATUS_COLORS: Record<ClinicalGoalStatus, string> = {
  ACTIVE: "bg-teal-50 text-teal-700",
  ACHIEVED: "bg-green-50 text-green-700",
  PAUSED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const PRIORITY_LABELS: Record<ClinicalGoalPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

const PRIORITY_COLORS: Record<ClinicalGoalPriority, string> = {
  HIGH: "bg-red-50 text-red-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

const EMPTY_FORM: ClinicalGoalInput = {
  description: "",
  priority: "MEDIUM",
  targetDate: "",
};

export function GoalsPanel({ patientId }: GoalsPanelProps) {
  const [goals, setGoals] = useState<ClinicalGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ClinicalGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<ClinicalGoal | null>(null);
  const [formData, setFormData] = useState<ClinicalGoalInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadGoals() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listGoals(patientId);
      setGoals(response.goals);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadGoals();
  }, [patientId]);

  function openCreate() {
    setEditingGoal(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEdit(goal: ClinicalGoal) {
    setEditingGoal(goal);
    setFormData({
      description: goal.description,
      priority: goal.priority,
      status: goal.status,
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: ClinicalGoalInput = {
        description: formData.description,
        priority: formData.priority,
        ...(formData.status ? { status: formData.status } : {}),
        ...(formData.targetDate ? { targetDate: formData.targetDate } : {}),
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, payload);
      } else {
        await createGoal(patientId, payload);
      }

      setIsFormOpen(false);
      setEditingGoal(null);
      await loadGoals();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusCycle(goal: ClinicalGoal) {
    try {
      await updateGoal(goal.id, { status: STATUS_NEXT[goal.status] });
      await loadGoals();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al actualizar estado");
    }
  }

  async function handleDelete() {
    if (!goalToDelete) return;

    try {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
      await loadGoals();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al eliminar");
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#17211d]">Objetivos de rehabilitación</h2>
          <p className="mt-1 text-sm text-[#66746e]">
            Metas clínicas priorizadas con seguimiento de estado.
          </p>
        </div>
        <Button onClick={openCreate}>Nuevo objetivo</Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {isLoading ? <LoadingState label="Cargando objetivos..." /> : null}

      {!isLoading && goals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9e1dc] p-5 text-sm text-[#66746e]">
          Todavía no hay objetivos registrados para este paciente.
        </div>
      ) : null}

      {!isLoading && goals.length > 0 ? (
        <div className="grid gap-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-lg border border-[#d9e1dc] bg-[#fbfcfb] px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#17211d]">{goal.description}</p>
                  {goal.targetDate ? (
                    <p className="mt-1 text-xs text-[#66746e]">
                      Fecha objetivo: {formatDate(goal.targetDate)}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge label={PRIORITY_LABELS[goal.priority]} color={PRIORITY_COLORS[goal.priority]} />
                    <button
                      type="button"
                      title="Cambiar estado"
                      onClick={() => void handleStatusCycle(goal)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-75 ${STATUS_COLORS[goal.status]}`}
                    >
                      {STATUS_LABELS[goal.status]}
                    </button>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => openEdit(goal)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setGoalToDelete(goal)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isFormOpen ? (
        <Modal title={editingGoal ? "Editar objetivo" : "Nuevo objetivo"} onClose={() => setIsFormOpen(false)}>
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="goal-description">Descripción</Label>
              <Textarea
                id="goal-description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Ej: Recuperar flexión de rodilla > 120°"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="goal-priority">Prioridad</Label>
                <Select
                  id="goal-priority"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as ClinicalGoalPriority,
                    }))
                  }
                >
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Media</option>
                  <option value="LOW">Baja</option>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="goal-target-date">Fecha objetivo</Label>
                <Input
                  id="goal-target-date"
                  type="date"
                  value={formData.targetDate ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, targetDate: e.target.value }))
                  }
                />
              </div>
            </div>

            {editingGoal ? (
              <div className="grid gap-1.5">
                <Label htmlFor="goal-status">Estado</Label>
                <Select
                  id="goal-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as ClinicalGoalStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="ACHIEVED">Logrado</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="CANCELLED">Cancelado</option>
                </Select>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingGoal(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editingGoal ? "Guardar cambios" : "Crear objetivo"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {goalToDelete ? (
        <Modal title="Eliminar objetivo" onClose={() => setGoalToDelete(null)}>
          <p className="text-sm leading-6 text-[#66746e]">
            ¿Eliminás el objetivo "{goalToDelete.description}"? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setGoalToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </div>
        </Modal>
      ) : null}
    </Card>
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
      <Card className="max-h-[90vh] w-full max-w-xl overflow-y-auto">
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

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>{label}</span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}
