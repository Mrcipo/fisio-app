import { ProgressDashboardClient } from "@/components/patients/progress-dashboard-client";

type PatientProgressPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PatientProgressPage({ params }: PatientProgressPageProps) {
  const { id } = await params;

  return <ProgressDashboardClient patientId={id} />;
}
