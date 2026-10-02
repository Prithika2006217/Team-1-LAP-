"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LearningOverviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  performanceData: Array<{ week: string; score: number }>;
  overallProgress: number;
}

export function LearningOverviewDialog({
  open,
  onOpenChange,
  performanceData,
  overallProgress,
}: LearningOverviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Learning Overview</DialogTitle>
          <DialogDescription>
            Detailed insights into your learning progress and performance
          </DialogDescription>
        </DialogHeader>

        {/* Overall Progress */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Overall Progress</h4>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${overallProgress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{overallProgress}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Learning</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">0%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Practice</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">0%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Assessments</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">0%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Consistency</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full w-0 bg-primary rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900">Performance Trend</h4>
            <span className="text-sm text-slate-600">Average: <span className="font-bold text-slate-900">0%</span></span>
          </div>
          {performanceData.length === 0 ? (
            <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
              <p className="text-sm text-slate-500">No performance data yet</p>
            </div>
          ) : (
            <div className="h-32 flex items-end gap-2">
              {performanceData.map((data, index) => (
                <div key={data.week} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full rounded-t-sm bg-primary transition-all hover:bg-primary/80"
                    style={{ 
                      height: `${data.score}%`,
                      backgroundColor: data.score >= 80 ? '#22c55e' : data.score >= 70 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                  <span className="text-xs text-slate-500">{data.week}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
