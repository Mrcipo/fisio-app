-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLINICIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "PatientSex" AS ENUM ('FEMALE', 'MALE', 'OTHER', 'NOT_SPECIFIED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'ON_HOLD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RehabPlanPhase" AS ENUM ('ACUTE', 'SUBACUTE', 'STRENGTHENING', 'RETURN_TO_ACTIVITY', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RehabPlanStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalGoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'PAUSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalGoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalDecision" AS ENUM ('MAINTAIN', 'PROGRESS', 'REGRESS', 'REFER');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('PAIN', 'ROM', 'STRENGTH', 'FUNCTION', 'ADHERENCE', 'BALANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "MetricUnit" AS ENUM ('NRS_0_10', 'DEGREES', 'KG', 'REPETITIONS', 'SECONDS', 'PERCENT', 'SCORE');

-- CreateEnum
CREATE TYPE "BodyRegion" AS ENUM ('CERVICAL', 'THORACIC', 'LUMBAR', 'SHOULDER', 'ELBOW', 'WRIST_HAND', 'HIP', 'KNEE', 'ANKLE_FOOT', 'GENERAL', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLINICIAN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "sex" "PatientSex" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "phone" TEXT,
    "email" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitialAssessment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reasonForConsultation" TEXT NOT NULL,
    "onsetDate" TIMESTAMP(3),
    "injuryMechanism" TEXT,
    "medicalDiagnosis" TEXT,
    "currentPain" INTEGER,
    "maxPain" INTEGER,
    "minPain" INTEGER,
    "painLocation" TEXT,
    "painType" TEXT,
    "irradiation" TEXT,
    "aggravatingFactors" TEXT,
    "relievingFactors" TEXT,
    "neurologicalSymptoms" TEXT,
    "previousSurgeries" TEXT,
    "medications" TEXT,
    "relevantHistory" TEXT,
    "redFlags" TEXT,
    "patientGoals" TEXT,
    "limitedActivities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InitialAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectiveAssessment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "bodyRegion" "BodyRegion" NOT NULL,
    "postureObservation" TEXT,
    "rangeOfMotion" TEXT,
    "strength" TEXT,
    "functionalTests" TEXT,
    "specialTests" TEXT,
    "palpationFindings" TEXT,
    "movementQuality" TEXT,
    "balance" TEXT,
    "gait" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectiveAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RehabPlan" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "phase" "RehabPlanPhase" NOT NULL,
    "frequencyPerWeek" INTEGER,
    "status" "RehabPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RehabPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalGoal" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" "ClinicalGoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" "ClinicalGoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bodyRegion" "BodyRegion",
    "objective" TEXT,
    "defaultSets" INTEGER,
    "defaultReps" INTEGER,
    "defaultDuration" INTEGER,
    "defaultLoad" TEXT,
    "precautions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "painBefore" INTEGER,
    "painAfter" INTEGER,
    "subjectiveReport" TEXT,
    "clinicalNotes" TEXT,
    "responseToTreatment" TEXT,
    "clinicalDecision" "ClinicalDecision",
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "duration" INTEGER,
    "load" TEXT,
    "rpe" INTEGER,
    "symptoms" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressMetric" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionId" TEXT,
    "metricType" "MetricType" NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "unit" "MetricUnit" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_lastName_firstName_idx" ON "Patient"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Patient_deletedAt_idx" ON "Patient"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InitialAssessment_patientId_key" ON "InitialAssessment"("patientId");

-- CreateIndex
CREATE INDEX "ObjectiveAssessment_patientId_createdAt_idx" ON "ObjectiveAssessment"("patientId", "createdAt");

-- CreateIndex
CREATE INDEX "ObjectiveAssessment_bodyRegion_idx" ON "ObjectiveAssessment"("bodyRegion");

-- CreateIndex
CREATE INDEX "RehabPlan_patientId_status_idx" ON "RehabPlan"("patientId", "status");

-- CreateIndex
CREATE INDEX "RehabPlan_phase_idx" ON "RehabPlan"("phase");

-- CreateIndex
CREATE INDEX "ClinicalGoal_patientId_status_idx" ON "ClinicalGoal"("patientId", "status");

-- CreateIndex
CREATE INDEX "ClinicalGoal_priority_idx" ON "ClinicalGoal"("priority");

-- CreateIndex
CREATE INDEX "Exercise_userId_idx" ON "Exercise"("userId");

-- CreateIndex
CREATE INDEX "Exercise_name_idx" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Exercise_bodyRegion_idx" ON "Exercise"("bodyRegion");

-- CreateIndex
CREATE INDEX "Session_patientId_date_idx" ON "Session"("patientId", "date");

-- CreateIndex
CREATE INDEX "Session_clinicalDecision_idx" ON "Session"("clinicalDecision");

-- CreateIndex
CREATE INDEX "Session_deletedAt_idx" ON "Session"("deletedAt");

-- CreateIndex
CREATE INDEX "SessionExercise_sessionId_idx" ON "SessionExercise"("sessionId");

-- CreateIndex
CREATE INDEX "SessionExercise_exerciseId_idx" ON "SessionExercise"("exerciseId");

-- CreateIndex
CREATE INDEX "ProgressMetric_patientId_metricType_date_idx" ON "ProgressMetric"("patientId", "metricType", "date");

-- CreateIndex
CREATE INDEX "ProgressMetric_sessionId_idx" ON "ProgressMetric"("sessionId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitialAssessment" ADD CONSTRAINT "InitialAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveAssessment" ADD CONSTRAINT "ObjectiveAssessment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RehabPlan" ADD CONSTRAINT "RehabPlan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalGoal" ADD CONSTRAINT "ClinicalGoal_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressMetric" ADD CONSTRAINT "ProgressMetric_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressMetric" ADD CONSTRAINT "ProgressMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
