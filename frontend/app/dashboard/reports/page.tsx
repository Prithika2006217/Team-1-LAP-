import { TabPlaceholder } from "@/components/tab-placeholder";

export default function ReportsPage() {
  return (
    <TabPlaceholder
      title="Reports & Analytics"
      description="Track performance, engagement and growth across the platform."
      todo="Build performance trends, user distribution, top colleges and geographic breakdowns. Role-scope the data (Student vs TPO vs Admin) using DB-level aggregates."
    />
  );
}
