import { TabPlaceholder } from "@/components/tab-placeholder";

export default function StudySpacePage() {
  return (
    <TabPlaceholder
      title="Study Space"
      description="Access structured learning materials, videos, notes and more."
      todo="Build category Tabs (All Modules, Programming, Data Structures, Aptitude) and a responsive grid of course cards, each with a Progress bar. Fetch GET /api/study/modules via SWR; filter categories client-side."
    />
  );
}
