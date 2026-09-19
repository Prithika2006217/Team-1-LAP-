import { TabPlaceholder } from "@/components/tab-placeholder";

export default function MyProgressPage() {
  return (
    <TabPlaceholder
      title="My Progress"
      description="Detailed skill progression over time."
      todo="Build skill-wise progression charts, learning vs practice vs assessment trends and streak history. Aggregate from submissions and module progress at the DB level."
    />
  );
}
