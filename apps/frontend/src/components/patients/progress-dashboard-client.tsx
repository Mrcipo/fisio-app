"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPatient,
  getProgressSummary,
  listSessions,
  type ClinicalDecision,
  type Patient,
  type ProgressSummary,
  type Session,
} from "@/lib/patients-api";

type ProgressDashboardClientProps = {
  patientId: string;
};

export function ProgressDashboardClient({ patientId }: ProgressDashboardClientProps) {
  const hasMounted = useMounted();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [patientResponse, sessionsResponse, summaryResponse] = await Promise.all([
          getPatient(patientId),
          listSessions(patientId),
          getProgressSummary(patientId),
        ]);

        setPatient(patientResponse.patient);
        setSessions(sessionsResponse.sessions);
        setProgressSummary(summaryResponse.progressSummary);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [hasMounted, patientId]);

  if (!hasMounted || isLoading) {
    return <LoadingState label="Cargando evolución clínica..." />;
  }

  if (error || !patient || !progressSummary) {
    return (
      <EmptyState
        title="No se pudo cargar la evolución"
        description={error ?? "Intentá nuevamente en unos minutos."}
        action={
          <Link href={`/patients/${patientId}`} className="text-sm font-semibold text-[#0f766e]">
            Volver al paciente
          </Link>
        }
      />
    );
  }

  const painChartData = sessions
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session) => ({
      date: formatDateShort(session.date),
      painBefore: session.painBefore,
      painAfter: session.painAfter,
    }))
    .filter((item) => item.painBefore !== null || item.painAfter !== null);

  const romChartData = mapMetricSeries(progressSummary.ROM);
  const strengthChartData = mapMetricSeries(progressSummary.STRENGTH);
  const adherenceChartData = mapMetricSeries(progressSummary.ADHERENCE);

  const sessionsCount = sessions.length;
  const sortedPainSessions = painChartData.filter((item) => item.painBefore !== null);
  const painInitial =
    sortedPainSessions.length > 0 ? Number(sortedPainSessions[0].painBefore ?? 0) : null;
  const painCurrent =
    sortedPainSessions.length > 0
      ? Number(sortedPainSessions[sortedPainSessions.length - 1].painBefore ?? 0)
      : null;
  const changePercent =
    painInitial && painCurrent !== null
      ? Math.round(((painInitial - painCurrent) / painInitial) * 100)
      : null;
  const latestDecision = getLatestDecision(sessions);

  const hasAnyData =
    painChartData.length > 0 ||
    romChartData.length > 0 ||
    strengthChartData.length > 0 ||
    adherenceChartData.length > 0 ||
    sessionsCount > 0;

  if (!hasAnyData) {
    return (
      <>
        <PageHeader
          title={`Evolución de ${patient.firstName} ${patient.lastName}`}
          description="Resumen clínico y tendencias para seguimiento longitudinal."
          action={
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          }
        />
        <EmptyState
          title="Todavía no hay datos de evolución"
          description="Cuando existan sesiones o métricas registradas, este dashboard mostrará la progresión clínica."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Evolución de ${patient.firstName} ${patient.lastName}`}
        description="Tendencias clínicas para revisar dolor, rendimiento y adherencia en el tiempo."
        action={
          <Link href={`/patients/${patientId}`}>
            <Button variant="outline">Volver al paciente</Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Cantidad de sesiones" value={String(sessionsCount)} />
        <SummaryCard label="Dolor inicial" value={formatMetricNumber(painInitial)} />
        <SummaryCard label="Dolor actual" value={formatMetricNumber(painCurrent)} />
        <SummaryCard
          label="Cambio porcentual"
          value={changePercent === null ? "-" : `${changePercent}%`}
        />
        <SummaryCard label="Última decisión clínica" value={formatDecision(latestDecision)} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Dolor antes y después por sesión"
          description="Comparación del dolor reportado al inicio y al final de cada sesión."
        >
          {painChartData.length > 0 ? (
            <DualLineChart
              data={painChartData}
              lines={[
                { key: "painBefore", name: "Dolor antes", color: "#0f766e" },
                { key: "painAfter", name: "Dolor después", color: "#d97706" },
              ]}
            />
          ) : (
            <EmptyState
              title="Sin datos de dolor por sesión"
              description="No hay registros suficientes para graficar dolor antes/después."
            />
          )}
        </ChartCard>

        <ChartCard
          title="ROM por fecha"
          description="Seguimiento de métricas de rango de movimiento registradas en el tiempo."
        >
          {romChartData.length > 0 ? (
            <SingleLineChart data={romChartData} color="#0f766e" />
          ) : (
            <EmptyState
              title="Sin métricas de ROM"
              description="Todavía no se registraron métricas de rango de movimiento."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Fuerza por fecha"
          description="Evolución de los registros de fuerza disponibles."
        >
          {strengthChartData.length > 0 ? (
            <SingleLineChart data={strengthChartData} color="#b45309" />
          ) : (
            <EmptyState
              title="Sin métricas de fuerza"
              description="Todavía no se registraron métricas de fuerza."
            />
          )}
        </ChartCard>

        <ChartCard
          title="Adherencia"
          description="Tendencia de adherencia cuando existan registros asociados."
        >
          {adherenceChartData.length > 0 ? (
            <SingleLineChart data={adherenceChartData} color="#1d4ed8" />
          ) : (
            <EmptyState
              title="Sin métricas de adherencia"
              description="No hay registros de adherencia disponibles."
            />
          )}
        </ChartCard>
      </div>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-[#66746e]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#17211d]">{value}</p>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-[#17211d]">{title}</h2>
      <p className="mt-1 text-sm text-[#66746e]">{description}</p>
      <div className="mt-5 h-80">{children}</div>
    </Card>
  );
}

function SingleLineChart({
  data,
  color,
}: {
  data: Array<{ date: string; value: number; name: string; unit: string }>;
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 12 }}>
        <CartesianGrid stroke="#e2e8e5" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#66746e" fontSize={12} />
        <YAxis stroke="#66746e" fontSize={12} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          name="Valor"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DualLineChart({
  data,
  lines,
}: {
  data: Array<{ date: string; painBefore: number | null; painAfter: number | null }>;
  lines: Array<{ key: "painBefore" | "painAfter"; name: string; color: string }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 12 }}>
        <CartesianGrid stroke="#e2e8e5" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#66746e" fontSize={12} />
        <YAxis stroke="#66746e" fontSize={12} domain={[0, 10]} />
        <Tooltip />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function mapMetricSeries(points: ProgressSummary["ROM"]) {
  return points
    .map((point) => ({
      date: formatDateShort(point.date),
      value: Number(point.value),
      name: point.name,
      unit: point.unit,
    }))
    .filter((point) => !Number.isNaN(point.value));
}

function getLatestDecision(sessions: Session[]): ClinicalDecision | null {
  if (sessions.length === 0) {
    return null;
  }

  const latestSession = sessions
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return latestSession?.clinicalDecision ?? null;
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatMetricNumber(value: number | null) {
  return value === null ? "-" : String(value);
}

function formatDecision(value: ClinicalDecision | null) {
  const labels: Record<ClinicalDecision, string> = {
    MAINTAIN: "Mantener",
    PROGRESS: "Progresar",
    REGRESS: "Regresar",
    REFER: "Derivar",
  };

  return value ? labels[value] : "-";
}
