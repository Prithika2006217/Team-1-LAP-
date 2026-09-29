"use client";

import { ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TakeTestProps = { topic: string };

export function TakeTest({ topic }: TakeTestProps) {
  function openTest() {
    window.open(`/dashboard/study-space/test?topic=${encodeURIComponent(topic)}`, "_blank");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <ClipboardCheck className="h-5 w-5" />
          <CardTitle>Topic assessment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-6 text-slate-500">Check your understanding of {topic} with a quick 20-question assessment.</p>
        <Button type="button" className="mt-4" onClick={openTest}>
          <ClipboardCheck className="h-4 w-4" />
          Take Test
        </Button>
      </CardContent>
    </Card>
  );
}