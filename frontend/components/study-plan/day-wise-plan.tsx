"use client";

import {
  CheckCircle2,
  Circle,
  Clock3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlanDay } from "./types";

type DayWisePlanProps = {
  planDays: PlanDay[];
  onToggleDay: (date: string) => void;
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
}

export function DayWisePlan({
  planDays,
  onToggleDay,
}: DayWisePlanProps) {
  const [expandedDate, setExpandedDate] = useState<string | null>(
    null
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <Card>
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Build Plan
        </p>

        <CardTitle className="mt-1">
          Your next 7 days
        </CardTitle>

        <p className="text-sm text-slate-500">
          Follow these tasks each day to move toward your target.
        </p>
      </CardHeader>

      <CardContent>
        {planDays.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center">
            <p className="text-sm font-medium text-slate-700">
              No study plan yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Set a target to generate your day-by-day plan.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {planDays.map((day, index) => {
              const isToday = day.date === todayString;
              const isExpanded = expandedDate === day.date;

              return (
                <div
                  key={day.date}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    day.completed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : isToday
                        ? "border-primary/30 bg-indigo-50/50"
                        : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 p-3">
                    <button
                      type="button"
                      onClick={() => onToggleDay(day.date)}
                      className="shrink-0"
                      aria-label={
                        day.completed
                          ? `Mark ${formatDate(day.date)} incomplete`
                          : `Mark ${formatDate(day.date)} complete`
                      }
                    >
                      <span
                        className={
                          day.completed
                            ? "text-emerald-600"
                            : isToday
                              ? "text-primary"
                              : "text-slate-300"
                        }
                      >
                        {day.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedDate(
                          isExpanded ? null : day.date
                        )
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-500 shadow-sm">
                        {index + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {formatDate(day.date)}

                          {isToday && (
                            <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              TODAY
                            </span>
                          )}
                        </span>

                        <span
                          className={`mt-0.5 block truncate font-semibold ${
                            day.completed
                              ? "text-emerald-700 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {day.topic}
                        </span>
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-white px-4 py-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Clock3 className="h-3.5 w-3.5" />
                        Today&apos;s tasks
                      </div>

                      <div className="space-y-2">
                        {day.tasks.map((task, taskIndex) => (
                          <div
                            key={`${day.date}-${taskIndex}`}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleDay(day.date)}
                        className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          day.completed
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-indigo-50 text-primary hover:bg-indigo-100"
                        }`}
                      >
                        {day.completed
                          ? "Mark as incomplete"
                          : "Mark day as complete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}