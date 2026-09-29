import { BookOpenCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RevisionItem = { id: string; topic: string; due: string };

export function RevisionQueue({ items, onRevise }: { items: RevisionItem[]; onRevise: (id: string) => void }) {
  return (
    <Card>
      <CardHeader><CardTitle>Revision Loop</CardTitle><p className="text-sm text-slate-500">Topics due for a quick confidence refresh.</p></CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"><div className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-indigo-50 p-2 text-primary"><BookOpenCheck className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-slate-800">{item.topic}</p><p className="mt-1 text-xs text-slate-400">Due {item.due}</p></div></div><Button type="button" size="sm" variant="outline" onClick={() => onRevise(item.id)}><Check className="h-3.5 w-3.5" />Revise Now</Button></div>
        ))}
      </CardContent>
    </Card>
  );
}
