import { Clock3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudyTask } from "./types";

const priorityVariant = { High: "hard", Medium: "medium", Low: "easy" } as const;

export function PrioritizationPanel({ tasks }: { tasks: StudyTask[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary"><Sparkles className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Smart queue</span></div>
        <CardTitle className="mt-1">Smart Prioritization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{task.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{task.minutes} min</p></div>
            <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
