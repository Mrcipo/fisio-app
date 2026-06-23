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
  createRehabPlan,
  deleteRehabPlan,
  listRehabPlans,
  updateRehabPlan,
  type RehabPlan,
  type RehabPlanInput,
  type RehabPlanPhase,
  type RehabPlanStatus,
} from "@/lib/patients-api";

type RehabPlansPanelProps = {
  patientId: string;
};

const PHASE_LABELS: Record<RehabPlanPhase, string> = {
  ACUTE: "Aguda",
  SUBACUTE: "Subaguda",
  STRENGTHENING: "Fortalecimiento",
  RETURN_TO_ACTIVITY: "Retorno a actividad",
  MAINTENANCE: "Mantenimiento",
};

const STATUS_LABELS: Record<RehabPlanStatus, string> = {
  ACTIVE: "Activo",
  COMPLETED: "Completado",
  PAUSED: "Pausado",
  CANCELLED: "Cancelado",
};

const STATUS_NEXT: Record<RehabPlanStatus, RehabPlanStatus> = {
  ACTIVE: "COMPLETED",
  COMPLETED: "PAUSED",
  PAUSED: "CANCELLED",
  CANCELLED: "ACTIVE",
};

const STATUS_COLORS: Record<RehabPlanStatus, string> = {
  ACTIVE: "bg-teal-50 text-teal-700",
  COMPLETED: "bg-green-50 text-green-700",
  PAUSED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const EMPTY_FORM: RehabPlanInput = {
  title: "",
  phase: "ACUTE",
  description: "",
  frequencyPerWeek: undefined,
};

export function RehabPlansPanel({ patientId }: RehabPlansPanelProps) {
  const [plans, setPlans] = useState<RehabPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RehabPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<RehabPlan | null>(null);
  const [formData, setFormData] = useState<RehabPlanInput>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPlans() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await listRehabPlans(patientId);
      setPlans(response.rehabPlans);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
  }, [patientId]);

  function openCreate() {
    setEditingPlan(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  }

  function openEdit(plan: RehabPlan) {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      phase: plan.phase,
      description: plan.description ?? "",
      frequencyPerWeek: plan.frequencyPerWeek ?? undefined,
      status: plan.status,
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: RehabPlanInput = {
        title: formData.title,
        phase: formData.phase,
        ...(formData.description ? { description: formData.description } : {}),
        ...(formData.frequencyPerWeek != null ? { frequencyPerWeek: formData.frequencyPerWeek } : {}),
        ...(formData.status ? { status: formData.status } : {}),
      };

      if (editingPlan) {
        await updateRehabPlan(editingPlan.id, payload);
      } else {
        await createRehabPlan(patientId, payload);
      }

      setIsFormOpen(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusCycle(plan: RehabPlan) {
    try {
      await updateRehabPlan(plan.id, { status: STATUS_NEXT[plan.status] });
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al actualizar estado");
    }
  }

  async function handleDelete() {
    if (!planToDelete) return;

    try {
      await deleteRehabPlan(planToDelete.id);
      setPlanToDelete(null);
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error al eliminar");
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#17211d]">Plan de rehabilitación</h2>
          <p className="mt-1 text-sm text-[#66746e]">
            Planificación por fases con frecuencia semanal y seguimiento de estado.
          </p>
        </div>
        <Button onClick={openCreate}>Nuevo plan</Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {isLoading ? <LoadingState label="Cargando planes..." /> : null}

      {!isLoading && plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#d9e1dc] p-5 text-sm text-[#66746e]">
          Todavía no hay planes de rehabilitación registrados para este paciente.
        </div>
      ) : null}

      {!isLoading && plans.length > 0 ? (
        <div className="grid gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-[#d9e1dc] bg-[#fbfcfb] px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#17211d]">{plan.title}</p>
                  {plan.description ? (
                    <p className="mt-1 text-sm text-[#66746e]">{plan.description}</p>
                  ) : null}
                  {plan.frequencyPerWeek != null ? (
                    <p className="mt-1 text-xs text-[#66746e]">
                      Frecuencia: {plan.frequencyPerWeek}x / semana
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge label={PHASE_LABELS[plan.phase]} color="bg-indigo-50 text-indigo-700" />
                    <button
                      type="button"
                      title="Cambiar estado"
                      onClick={() => void handleStatusCycle(plan)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition hover:opacity-75 ${STATUS_COLORS[plan.status]}`}
                    >
                      {STATUS_LABELS[plan.status]}
                    </button>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" onClick={() => openEdit(plan)}>
                    Editar
                  </Button>
                  <Button variant="danger" onClick={() => setPlanToDelete(plan)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {isFormOpen ? (
        <Modal title={editingPlan ? "Editar plan" : "Nuevo plan"} onClose={() => setIsFormOpen(false)}>
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="plan-title">Título</Label>
              <Input
                id="plan-title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Plan postquirúrgico rodilla"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="plan-description">Descripción</Label>
              <Textarea
                id="plan-description"
                rows={3}
                value={formData.description ?? ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Objetivos generales del plan, precauciones, etc."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="plan-phase">Fase</Label>
                <Select
                  id="plan-phase"
                  value={formData.phase}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phase: e.target.value as RehabPlanPhase }))
                  }
                >
                  <option value="ACUTE">Aguda</option>
                  <option value="SUBACUTE">Subaguda</option>
                  <option value="STRENGTHENING">Fortalecimiento</option>
                  <option value="RETURN_TO_ACTIVITY">Retorno a actividad</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="plan-frequency">Frecuencia semanal</Label>
                <Input
                  id="plan-frequency"
                  type="number"
                  min={1}
                  max={14}
                  value={formData.frequencyPerWeek ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      frequencyPerWeek: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="Ej: 3"
                />
              </div>
            </div>

            {editingPlan ? (
              <div className="grid gap-1.5">
                <Label htmlFor="plan-status">Estado</Label>
                <Select
                  id="plan-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as RehabPlanStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="COMPLETED">Completado</option>
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
                  setEditingPlan(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : editingPlan ? "Guardar cambios" : "Crear plan"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {planToDelete ? (
        <Modal title="Eliminar plan" onClose={() => setPlanToDelete(null)}>
          <p className="text-sm leading-6 text-[#66746e]">
            ¿Eliminás el plan "{planToDelete.title}"? Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPlanToDelete(null)}>
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
