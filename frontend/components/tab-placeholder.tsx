import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Construction } from "lucide-react";

// Shared placeholder for tab pages that interns will build out.
// Renders a breadcrumb + header + a short "what to build here" empty state so
// every sidebar route is a fully-rendered shell in the base app.
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-slate-400">
        <span>Dashboard</span>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600">{title}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
            <Construction className="h-8 w-8 text-primary" />
          </span>
          <p className="text-base font-semibold text-slate-900">This tab is a base placeholder</p>
          <p className="max-w-md text-sm text-slate-500">{todo}</p>
        </CardContent>
      </Card>
    </div>
  );
}
