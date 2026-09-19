import { cn } from "@/lib/utils";

// Loading skeleton (shown while the API wakes up / data loads).
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-slate-100", className)} {...props} />;
}

export { Skeleton };
