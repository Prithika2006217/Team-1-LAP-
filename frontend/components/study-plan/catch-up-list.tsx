import { CalendarDays, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CatchUpItem = { id: string; title: string; missedDate: string };

export function CatchUpList({ items, onReschedule }: { items: CatchUpItem[]; onReschedule: (id: string, date: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>Catch-Up &amp; Reschedule</CardTitle><p className="text-sm text-slate-500">Move unfinished work back into your plan.</p></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
            <div><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-1 text-xs text-slate-400">Missed {item.missedDate}</p></div>
            <label className="flex items-center gap-2"><span className="sr-only">Move {item.title} to a new date</span><input type="date" onChange={(event) => onReschedule(item.id, event.target.value)} className="h-9 rounded-lg border border-slate-200 px-2 text-xs text-slate-600" /><ChevronRight className="h-4 w-4 text-slate-300" /></label>
          </div>
        ))}
        {!items.length && <p className="text-sm text-slate-500">You are caught up.</p>}
      </CardContent>
    </Card>
  );
}
