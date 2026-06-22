import { ObjectiveAssessmentClient } from "@/components/patients/objective-assessment-client";

type ObjectiveAssessmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ObjectiveAssessmentPage({
  params,
}: ObjectiveAssessmentPageProps) {
  const { id } = await params;

  return <ObjectiveAssessmentClient patientId={id} />;
}
