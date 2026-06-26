-- CreateEnum
CREATE TYPE "IrritabilityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "InitialAssessment" ADD COLUMN     "compensationClaim" BOOLEAN,
ADD COLUMN     "irritability" "IrritabilityLevel",
ADD COLUMN     "irritabilityNotes" TEXT,
ADD COLUMN     "kinesophobia" BOOLEAN,
ADD COLUMN     "painDayTime" TEXT,
ADD COLUMN     "painMorning" TEXT,
ADD COLUMN     "painNight" TEXT,
ADD COLUMN     "sleepImpact" BOOLEAN,
ADD COLUMN     "sportActivity" TEXT,
ADD COLUMN     "sportLevel" TEXT,
ADD COLUMN     "workPosture" TEXT,
ADD COLUMN     "workRelated" BOOLEAN,
ADD COLUMN     "yellowFlags" TEXT;
