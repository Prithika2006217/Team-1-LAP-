import { TabPlaceholder } from "@/components/tab-placeholder";

export default function AssessmentCenterPage() {
  return (
    <TabPlaceholder
      title="Assessment Center"
      description="Take proctored assessments and track your performance."
      todo="Build Live / Upcoming / Completed tabs, assessment cards and the exam-taking flow (sections, question palette, code editor, proctoring). Live exam state auto-saves to Redis every ~10s."
    />
  );
}
