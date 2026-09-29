import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MilestoneBanner({ onNextTarget }: { onNextTarget: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="rounded-full bg-white p-2 text-emerald-600"><PartyPopper className="h-5 w-5" /></span><p className="font-semibold text-emerald-900">Milestone completed! Ready to set your next target?</p></div><Button type="button" variant="outline" onClick={onNextTarget}>Set Next Target</Button></div>
  );
}
