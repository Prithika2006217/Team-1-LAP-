import { ArrowUpRight, BookOpen } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { getTopicResource } from "./topic-learning-data";

type TopicResourceLinksProps = {
  topic: string;
};

export function TopicResourceLinks({ topic }: TopicResourceLinksProps) {
  const resource = getTopicResource(topic);

  return (
    <CardContent className="pt-0">
      <p className="text-sm leading-6 text-slate-500">Keep building momentum with resources matched to your current target.</p>
      <div className="mt-4 space-y-2">
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-indigo-50">
          <span className="flex min-w-0 items-center gap-2"><BookOpen className="h-4 w-4 shrink-0" /><span className="truncate">{resource.title}</span></span>
          <ArrowUpRight className="h-4 w-4 shrink-0" />
        </a>
      </div>
    </CardContent>
  );
}