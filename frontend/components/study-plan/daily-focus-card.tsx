import { ArrowUpRight, CalendarClock, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DailyFocusCardProps = {
  completed: boolean;
  onComplete: () => void;
  onReschedule: () => void;
};

export function DailyFocusCard({ completed, onComplete, onReschedule }: DailyFocusCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Today&apos;s priority</p>
          <CardTitle className="mt-2">Master graph traversal</CardTitle>
        </div>
        <span className="rounded-full bg-primary/10 p-2 text-primary"><PlayCircle className="h-5 w-5" /></span>
      </CardHeader>
      <CardContent>
        <p className="max-w-xl text-sm leading-6 text-slate-500">Complete the BFS and DFS module, then solve the two checkpoint problems to lock in the pattern.</p>
        <a href="/dashboard/study-space" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Open learning material <ArrowUpRight className="h-4 w-4" />
        </a>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
          <Button type="button" onClick={onComplete} disabled={completed}>
            <CheckCircle2 className="h-4 w-4" />
            {completed ? "Completed" : "Mark as Done"}
          </Button>
          <Button type="button" variant="outline" onClick={onReschedule}>
            <CalendarClock className="h-4 w-4" />
            Reschedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
