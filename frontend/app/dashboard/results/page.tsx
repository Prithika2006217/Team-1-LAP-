import { TabPlaceholder } from "@/components/tab-placeholder";

export default function ResultsPage() {
  return (
    <TabPlaceholder
      title="Results"
      description="Your scorecards and assessment analytics."
      todo="Build scorecards from TestSubmission records — score, percentile, correct/incorrect breakdown and per-section analytics. Fetch a results API interns will add on the backend."
    />
  );
}
