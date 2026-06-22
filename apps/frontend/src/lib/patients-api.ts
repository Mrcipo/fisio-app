import { apiClient, fetchHtml } from "./api";

export type PatientSex = "FEMALE" | "MALE" | "OTHER" | "NOT_SPECIFIED";

export type Patient = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  dateOfBirth: string | null;
  sex: PatientSex;
  phone: string | null;
  email: string | null;
  occupation: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PatientInput = {
  firstName: string;
  lastName: string;
  documentNumber?: string;
  dateOfBirth?: string;
  sex?: PatientSex;
  phone?: string;
  email?: string;
  occupation?: string;
  address?: string;
  notes?: string;
};

export type InitialAssessment = {
  id: string;
  patientId: string;
  reasonForConsultation: string;
  onsetDate: string | null;
  injuryMechanism: string | null;
  medicalDiagnosis: string | null;
  currentPain: number | null;
  maxPain: number | null;
  minPain: number | null;
  painLocation: string | null;
  painType: string | null;
  irradiation: string | null;
  aggravatingFactors: string | null;
  relievingFactors: string | null;
  neurologicalSymptoms: string | null;
  previousSurgeries: string | null;
  medications: string | null;
  relevantHistory: string | null;
  redFlags: string | null;
  patientGoals: string | null;
  limitedActivities: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InitialAssessmentInput = {
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
};

export type ClinicalDecision = "MAINTAIN" | "PROGRESS" | "REGRESS" | "REFER";

export type BodyRegion =
  | "CERVICAL"
  | "THORACIC"
  | "LUMBAR"
  | "SHOULDER"
  | "ELBOW"
  | "WRIST_HAND"
  | "HIP"
  | "KNEE"
  | "ANKLE_FOOT"
  | "GENERAL"
  | "OTHER";

export type ObjectiveAssessment = {
  id: string;
  patientId: string;
  bodyRegion: BodyRegion;
  postureObservation: string | null;
  rangeOfMotion: string | null;
  strength: string | null;
  functionalTests: string | null;
  specialTests: string | null;
  palpationFindings: string | null;
  movementQuality: string | null;
  balance: string | null;
  gait: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ObjectiveAssessmentInput = {
  bodyRegion: BodyRegion;
  postureObservation?: string;
  rangeOfMotion?: string;
  strength?: string;
  functionalTests?: string;
  specialTests?: string;
  palpationFindings?: string;
  movementQuality?: string;
  balance?: string;
  gait?: string;
  notes?: string;
};

export type Exercise = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  bodyRegion: BodyRegion | null;
  objective: string | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultDuration: number | null;
  defaultLoad: string | null;
  precautions: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionExercise = {
  id: string;
  sessionId: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
  duration: number | null;
  load: string | null;
  rpe: number | null;
  symptoms: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  patientId: string;
  date: string;
  painBefore: number | null;
  painAfter: number | null;
  subjectiveReport: string | null;
  clinicalNotes: string | null;
  responseToTreatment: string | null;
  clinicalDecision: ClinicalDecision | null;
  createdAt: string;
  updatedAt: string;
  sessionExercises: SessionExercise[];
};

export type SessionExerciseInput = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  duration?: number;
  load?: string;
  rpe?: number;
  symptoms?: string;
  notes?: string;
};

export type SessionInput = {
  date: string;
  painBefore?: number;
  painAfter?: number;
  subjectiveReport?: string;
  clinicalNotes?: string;
  responseToTreatment?: string;
  clinicalDecision?: ClinicalDecision;
  exercises?: SessionExerciseInput[];
};

export type ProgressMetricType =
  | "PAIN"
  | "ROM"
  | "STRENGTH"
  | "FUNCTION"
  | "ADHERENCE"
  | "BALANCE"
  | "OTHER";

export type ProgressSummaryPoint = {
  id: string;
  name: string;
  value: string;
  unit: string;
  date: string;
  sessionId: string | null;
};

export type ProgressSummary = Record<ProgressMetricType, ProgressSummaryPoint[]>;

export type DashboardSummary = {
  patientCount: number;
  sessionCount: number;
  activeGoalsCount: number;
};

export async function listPatients() {
  return apiClient<{ patients: Patient[] }>("/patients");
}

export async function getDashboardSummary() {
  return apiClient<{ summary: DashboardSummary }>("/patients/summary");
}

export async function getPatient(id: string) {
  return apiClient<{ patient: Patient }>(`/patients/${id}`);
}

export async function createPatient(input: PatientInput) {
  return apiClient<{ patient: Patient }>("/patients", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePatient(id: string, input: Partial<PatientInput>) {
  return apiClient<{ patient: Patient }>(`/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deletePatient(id: string) {
  return apiClient<void>(`/patients/${id}`, {
    method: "DELETE",
  });
}

export async function getInitialAssessment(patientId: string) {
  return apiClient<{ initialAssessment: InitialAssessment }>(
    `/patients/${patientId}/initial-assessment`,
  );
}

export async function createInitialAssessment(
  patientId: string,
  input: InitialAssessmentInput,
) {
  return apiClient<{ initialAssessment: InitialAssessment }>(
    `/patients/${patientId}/initial-assessment`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateInitialAssessment(
  patientId: string,
  input: Partial<InitialAssessmentInput>,
) {
  return apiClient<{ initialAssessment: InitialAssessment }>(
    `/patients/${patientId}/initial-assessment`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function listExercises() {
  return apiClient<{ exercises: Exercise[] }>("/exercises");
}

export async function listSessions(patientId: string) {
  return apiClient<{ sessions: Session[] }>(`/patients/${patientId}/sessions`);
}

export async function getSession(id: string) {
  return apiClient<{ session: Session }>(`/sessions/${id}`);
}

export async function createSession(patientId: string, input: SessionInput) {
  return apiClient<{ session: Session }>(`/patients/${patientId}/sessions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSession(id: string, input: Partial<SessionInput>) {
  return apiClient<{ session: Session }>(`/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteSession(id: string) {
  return apiClient<void>(`/sessions/${id}`, {
    method: "DELETE",
  });
}

export async function getProgressSummary(patientId: string) {
  return apiClient<{ progressSummary: ProgressSummary }>(
    `/patients/${patientId}/progress-summary`,
  );
}

export async function openPatientReport(patientId: string) {
  const reportHtml = await fetchHtml(`/patients/${patientId}/report`);
  const reportWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!reportWindow) {
    throw new Error("No se pudo abrir la nueva pestaña del informe");
  }

  reportWindow.document.open();
  reportWindow.document.write(reportHtml);
  reportWindow.document.close();
}

export async function listObjectiveAssessments(patientId: string) {
  return apiClient<{ objectiveAssessments: ObjectiveAssessment[] }>(
    `/patients/${patientId}/objective-assessments`,
  );
}

export async function createObjectiveAssessment(
  patientId: string,
  input: ObjectiveAssessmentInput,
) {
  return apiClient<{ objectiveAssessment: ObjectiveAssessment }>(
    `/patients/${patientId}/objective-assessments`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updateObjectiveAssessment(
  id: string,
  input: Partial<ObjectiveAssessmentInput>,
) {
  return apiClient<{ objectiveAssessment: ObjectiveAssessment }>(
    `/objective-assessments/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
