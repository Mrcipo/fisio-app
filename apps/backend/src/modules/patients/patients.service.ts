import { Prisma } from "@prisma/client";
import { HttpError } from "../../lib/http-error";
import { type PaginationQuery } from "../../lib/pagination";
import { prisma } from "../../lib/prisma";
import type { CreatePatientInput, UpdatePatientInput } from "./patients.schemas";

export async function findPatientForUser(patientId: string, userId: string) {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId, deletedAt: null },
  });

  if (!patient) {
    throw new HttpError(404, "Patient not found");
  }

  return patient;
}

export async function createPatient(userId: string, input: CreatePatientInput) {
  return prisma.patient.create({
    data: {
      ...input,
      userId,
    },
  });
}

export async function listPatients(
  userId: string,
  pagination: PaginationQuery,
  search?: string,
) {
  const { page, limit } = pagination;
  const searchTerm = search?.trim();
  const where = {
    userId,
    deletedAt: null,
    ...(searchTerm
      ? {
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" as const } },
            { lastName: { contains: searchTerm, mode: "insensitive" as const } },
            { documentNumber: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [patients, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return { patients, total, page, limit };
}

export async function getPatientById(userId: string, patientId: string) {
  return findPatientForUser(patientId, userId);
}

export async function updatePatient(
  userId: string,
  patientId: string,
  input: UpdatePatientInput,
) {
  await findPatientForUser(patientId, userId);

  return prisma.patient.update({
    where: { id: patientId },
    data: input,
  });
}

export async function deletePatient(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  await prisma.patient.update({
    where: { id: patientId },
    data: { deletedAt: new Date() },
  });
}

export type DashboardSummary = {
  patientCount: number;
  sessionCount: number;
  activeGoalsCount: number;
};

export async function getDashboardSummary(userId: string) {
  const [patientCount, sessionCount, activeGoalsCount] = await prisma.$transaction([
    prisma.patient.count({
      where: { userId, deletedAt: null },
    }),
    prisma.session.count({
      where: { patient: { userId, deletedAt: null }, deletedAt: null },
    }),
    prisma.clinicalGoal.count({
      where: {
        patient: { userId, deletedAt: null },
        status: {
          notIn: ["ACHIEVED", "CANCELLED"],
        },
      },
    }),
  ]);

  return {
    patientCount,
    sessionCount,
    activeGoalsCount,
  } satisfies DashboardSummary;
}

export async function getPatientReport(userId: string, patientId: string) {
  await findPatientForUser(patientId, userId);

  const patientReportInclude = {
    initialAssessment: true,
    objectiveAssessments: {
      orderBy: { createdAt: "desc" },
    },
    clinicalGoals: {
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "asc" }],
    },
    rehabPlans: {
      orderBy: { createdAt: "desc" },
    },
    sessions: {
      orderBy: { date: "asc" },
      include: {
        sessionExercises: {
          include: {
            exercise: true,
          },
        },
      },
    },
    progressMetrics: {
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    },
    user: true,
  } satisfies Prisma.PatientInclude;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: patientReportInclude,
  });

  if (!patient) {
    throw new HttpError(404, "Patient not found");
  }

  return buildPatientReportHtml(patient);
}

type PatientReportData = Prisma.PatientGetPayload<{
  include: {
    initialAssessment: true;
    objectiveAssessments: true;
    clinicalGoals: true;
    rehabPlans: true;
    sessions: {
      include: {
        sessionExercises: {
          include: {
            exercise: true;
          };
        };
      };
    };
    progressMetrics: true;
    user: true;
  };
}>;

function buildPatientReportHtml(patient: PatientReportData) {
  const initialAssessment = patient.initialAssessment;
  const latestObjectiveAssessment = patient.objectiveAssessments[0];
  const latestRehabPlan = patient.rehabPlans[0];

  const painEvolutionItems = patient.sessions
    .filter((session) => session.painBefore !== null || session.painAfter !== null)
    .map(
      (session) =>
        `<tr>
          <td>${escapeHtml(formatDate(session.date))}</td>
          <td>${escapeHtml(formatNullableNumber(session.painBefore))}</td>
          <td>${escapeHtml(formatNullableNumber(session.painAfter))}</td>
        </tr>`,
    )
    .join("");

  const progressMetricsItems = patient.progressMetrics
    .map(
      (metric) =>
        `<tr>
          <td>${escapeHtml(metric.metricType)}</td>
          <td>${escapeHtml(metric.name)}</td>
          <td>${escapeHtml(metric.value.toString())}</td>
          <td>${escapeHtml(metric.unit)}</td>
          <td>${escapeHtml(formatDate(metric.date))}</td>
        </tr>`,
    )
    .join("");

  const sessionsItems = patient.sessions
    .map((session) => {
      const exercises = session.sessionExercises
        .map(
          (sessionExercise) =>
            `<li>${escapeHtml(sessionExercise.exercise.name)}${
              sessionExercise.sets ? ` | series: ${escapeHtml(String(sessionExercise.sets))}` : ""
            }${
              sessionExercise.reps ? ` | reps: ${escapeHtml(String(sessionExercise.reps))}` : ""
            }${
              sessionExercise.duration
                ? ` | duracion: ${escapeHtml(String(sessionExercise.duration))}`
                : ""
            }</li>`,
        )
        .join("");

      return `<section class="session-block">
        <h3>Sesion ${escapeHtml(formatDate(session.date))}</h3>
        <p><strong>Reporte subjetivo:</strong> ${escapeHtml(session.subjectiveReport ?? "-")}</p>
        <p><strong>Notas clinicas:</strong> ${escapeHtml(session.clinicalNotes ?? "-")}</p>
        <p><strong>Respuesta al tratamiento:</strong> ${escapeHtml(session.responseToTreatment ?? "-")}</p>
        <p><strong>Decision clinica:</strong> ${escapeHtml(session.clinicalDecision ?? "-")}</p>
        ${
          exercises
            ? `<div><strong>Ejercicios realizados:</strong><ul>${exercises}</ul></div>`
            : "<p><strong>Ejercicios realizados:</strong> -</p>"
        }
      </section>`;
    })
    .join("");

  const goalsItems = patient.clinicalGoals
    .map(
      (goal) =>
        `<li>${escapeHtml(goal.description)} | prioridad: ${escapeHtml(
          goal.priority,
        )} | estado: ${escapeHtml(goal.status)}${
          goal.targetDate ? ` | fecha objetivo: ${escapeHtml(formatDate(goal.targetDate))}` : ""
        }</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Informe del paciente</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #17211d;
          margin: 32px;
          line-height: 1.5;
        }
        h1, h2, h3 {
          margin-bottom: 8px;
        }
        h2 {
          margin-top: 28px;
          border-bottom: 1px solid #d9e1dc;
          padding-bottom: 6px;
        }
        p, li {
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th, td {
          border: 1px solid #d9e1dc;
          padding: 8px;
          text-align: left;
          font-size: 13px;
        }
        th {
          background: #f6f8f5;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 24px;
        }
        .session-block {
          border: 1px solid #d9e1dc;
          padding: 12px;
          margin-top: 12px;
        }
        @media print {
          body {
            margin: 18mm;
          }
        }
      </style>
    </head>
    <body>
      <h1>Informe clinico del paciente</h1>
      <p>Profesional: ${escapeHtml(patient.user.firstName)} ${escapeHtml(patient.user.lastName)}</p>

      <h2>1. Datos del paciente</h2>
      <div class="meta-grid">
        <p><strong>Nombre:</strong> ${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</p>
        <p><strong>Documento:</strong> ${escapeHtml(patient.documentNumber ?? "-")}</p>
        <p><strong>Fecha de nacimiento:</strong> ${escapeHtml(formatDate(patient.dateOfBirth))}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(patient.phone ?? "-")}</p>
        <p><strong>Email:</strong> ${escapeHtml(patient.email ?? "-")}</p>
        <p><strong>Ocupacion:</strong> ${escapeHtml(patient.occupation ?? "-")}</p>
      </div>

      <h2>2. Motivo de consulta</h2>
      <p>${escapeHtml(initialAssessment?.reasonForConsultation ?? "-")}</p>

      <h2>3. Resumen de anamnesis</h2>
      <p><strong>Inicio:</strong> ${escapeHtml(formatDate(initialAssessment?.onsetDate))}</p>
      <p><strong>Mecanismo de lesion:</strong> ${escapeHtml(initialAssessment?.injuryMechanism ?? "-")}</p>
      <p><strong>Diagnostico medico:</strong> ${escapeHtml(initialAssessment?.medicalDiagnosis ?? "-")}</p>
      <p><strong>Dolor actual / maximo / minimo:</strong> ${escapeHtml(
        [initialAssessment?.currentPain, initialAssessment?.maxPain, initialAssessment?.minPain]
          .map(formatNullableNumber)
          .join(" / "),
      )}</p>
      <p><strong>Localizacion y tipo de dolor:</strong> ${escapeHtml(
        [initialAssessment?.painLocation, initialAssessment?.painType].filter(Boolean).join(" - ") ||
          "-",
      )}</p>
      <p><strong>Factores agravantes:</strong> ${escapeHtml(initialAssessment?.aggravatingFactors ?? "-")}</p>
      <p><strong>Factores aliviantes:</strong> ${escapeHtml(initialAssessment?.relievingFactors ?? "-")}</p>
      <p><strong>Antecedentes relevantes:</strong> ${escapeHtml(initialAssessment?.relevantHistory ?? "-")}</p>
      <p><strong>Banderas rojas:</strong> ${escapeHtml(initialAssessment?.redFlags ?? "-")}</p>

      <h2>4. Hallazgos objetivos</h2>
      <p><strong>Region corporal:</strong> ${escapeHtml(latestObjectiveAssessment?.bodyRegion ?? "-")}</p>
      <p><strong>Postura:</strong> ${escapeHtml(latestObjectiveAssessment?.postureObservation ?? "-")}</p>
      <p><strong>Rango de movimiento:</strong> ${escapeHtml(latestObjectiveAssessment?.rangeOfMotion ?? "-")}</p>
      <p><strong>Fuerza:</strong> ${escapeHtml(latestObjectiveAssessment?.strength ?? "-")}</p>
      <p><strong>Tests funcionales:</strong> ${escapeHtml(latestObjectiveAssessment?.functionalTests ?? "-")}</p>
      <p><strong>Tests especiales:</strong> ${escapeHtml(latestObjectiveAssessment?.specialTests ?? "-")}</p>

      <h2>5. Objetivos de rehabilitacion</h2>
      ${
        goalsItems
          ? `<ul>${goalsItems}</ul>`
          : "<p>No hay objetivos de rehabilitacion registrados.</p>"
      }
      <p><strong>Plan actual:</strong> ${escapeHtml(latestRehabPlan?.title ?? "-")}</p>
      <p><strong>Descripcion del plan:</strong> ${escapeHtml(latestRehabPlan?.description ?? "-")}</p>

      <h2>6. Sesiones realizadas</h2>
      ${
        sessionsItems
          ? sessionsItems
          : "<p>No hay sesiones registradas para este paciente.</p>"
      }

      <h2>7. Evolucion del dolor</h2>
      ${
        painEvolutionItems
          ? `<table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Dolor antes</th>
                  <th>Dolor despues</th>
                </tr>
              </thead>
              <tbody>${painEvolutionItems}</tbody>
            </table>`
          : "<p>No hay datos de dolor por sesion.</p>"
      }

      <h2>8. Metricas de progreso</h2>
      ${
        progressMetricsItems
          ? `<table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Valor</th>
                  <th>Unidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>${progressMetricsItems}</tbody>
            </table>`
          : "<p>No hay metricas de progreso registradas.</p>"
      }

      <h2>9. Observaciones finales</h2>
      <p>${escapeHtml(patient.notes ?? initialAssessment?.patientGoals ?? "Sin observaciones finales registradas.")}</p>
    </body>
  </html>`;
}

function formatDate(value?: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR").format(new Date(value));
}

function formatNullableNumber(value?: number | null) {
  return value === null || value === undefined ? "-" : String(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
