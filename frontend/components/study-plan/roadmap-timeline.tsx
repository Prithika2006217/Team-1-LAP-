import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Milestone } from "./types";

export function RoadmapTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <Card>
      <CardHeader><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Build Plan</p><CardTitle className="mt-1">Your roadmap to readiness</CardTitle></CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-4 md:gap-0">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex gap-3 md:block md:pr-5">
              {index < milestones.length - 1 && <span className="absolute left-3 top-7 h-[calc(100%+1.5rem)] w-px bg-slate-200 md:left-6 md:top-6 md:h-px md:w-[calc(100%-1.5rem)]" />}
              <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${milestone.complete ? "border-emerald-500 bg-emerald-500 text-white" : milestone.active ? "border-primary bg-primary text-white ring-4 ring-primary/10" : "border-slate-200 bg-white text-slate-300"}`}>
                {milestone.complete ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5 fill-current" />}
              </span>
              <div className="md:mt-4"><p className={`text-sm font-semibold ${milestone.active ? "text-primary" : "text-slate-800"}`}>{milestone.title}</p><p className="mt-1 text-xs leading-5 text-slate-400">Prerequisite: {milestone.prerequisite}</p></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
