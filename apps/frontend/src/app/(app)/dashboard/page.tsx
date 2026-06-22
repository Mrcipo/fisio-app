"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { getDashboardSummary, DashboardSummary } from "@/lib/patients-api";

const initialSummary: DashboardSummary = {
  patientCount: 0,
  sessionCount: 0,
  activeGoalsCount: 0,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getDashboardSummary();
        if (mounted) {
          setSummary(response.summary);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error al cargar el resumen");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  const statItems = [
    { label: "Pacientes activos", value: summary.patientCount.toString() },
    { label: "Sesiones registradas", value: summary.sessionCount.toString() },
    { label: "Objetivos en curso", value: summary.activeGoalsCount.toString() },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista inicial para seguir pacientes, sesiones y progreso clínico."
        action={
          <Link
            href="/patients"
            className="rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59]"
          >
            Ver pacientes
          </Link>
        }
      />

      {error ? (
        <Card className="mb-4 p-6 border border-red-200 bg-red-50 text-red-800">
          Error al cargar el dashboard: {error}
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {statItems.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm text-[#66746e]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#17211d]">
              {isLoading ? "..." : stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-[#17211d]">Actividad reciente</h2>
        <p className="mt-2 text-sm leading-6 text-[#66746e]">
          {isLoading
            ? "Cargando datos de actividad..."
            : "Este resumen refleja el número de pacientes registrados, las sesiones notificadas y los objetivos clínicos activos de tu cuenta."}
        </p>
      </Card>
    </>
  );
}
