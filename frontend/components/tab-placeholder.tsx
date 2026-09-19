import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

// Shared placeholder for tab pages that interns will build out.
// Renders the tab title + a short "what to build here" note so the navigation
// shell is fully clickable in the base app.
export function TabPlaceholder({
  title,
  description,
  todo,
}: {
  title: string;
  description: string;
  todo: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Construction className="h-6 w-6 text-primary" />
          </span>
          <p className="text-base font-semibold text-slate-900">This tab is a base placeholder</p>
          <p className="max-w-md text-sm text-slate-500">{todo}</p>
        </CardContent>
      </Card>
    </div>
  );
}
