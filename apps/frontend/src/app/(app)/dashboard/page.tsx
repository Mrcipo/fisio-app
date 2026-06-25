"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { getDashboardSummary, listPatients, DashboardSummary, Patient } from "@/lib/patients-api";

const initialSummary: DashboardSummary = {
  patientCount: 0,
  sessionCount: 0,
  activeGoalsCount: 0,
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [summaryRes, patientsRes] = await Promise.all([
          getDashboardSummary(),
          listPatients(1, 5),
        ]);
        if (mounted) {
          setSummary(summaryRes.summary);
          setRecentPatients(patientsRes.patients);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error al cargar el dashboard");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

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

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#17211d]">Pacientes recientes</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-[#66746e]">Cargando...</p>
          ) : recentPatients.length === 0 ? (
            <p className="mt-3 text-sm text-[#66746e]">No hay pacientes registrados aún.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#e8efec]">
              {recentPatients.map((patient) => (
                <li key={patient.id} className="py-2">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-sm font-medium text-[#0f766e] hover:underline"
                  >
                    {patient.firstName} {patient.lastName}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[#17211d]">Accesos rápidos</h2>
          <div className="mt-4 flex flex-col gap-3">
            <Link
              href="/patients?new=true"
              className="inline-flex items-center justify-center rounded-md bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59]"
            >
              Nuevo paciente
            </Link>
            <Link
              href="/exercises"
              className="inline-flex items-center justify-center rounded-md border border-[#0f766e] px-4 py-2 text-sm font-semibold text-[#0f766e] hover:bg-[#f0faf8]"
            >
              Ver ejercicios
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
