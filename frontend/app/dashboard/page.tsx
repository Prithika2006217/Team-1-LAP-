import { TabPlaceholder } from "@/components/tab-placeholder";

export default function DashboardPage() {
  return (
    <TabPlaceholder
      title="Dashboard"
      description="Your learning journey at a glance."
      todo="Build the stat cards (Modules, Tests, Upcoming Assessments, Points), the 'Continue Learning' widget and a Progress Overview donut. Fetch from GET /api/dashboard/stats via SWR with loading skeletons."
    />
  );
}
