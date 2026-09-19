"use client";

// Practice Arena (Phase 13).
// Filter ribbon + recommended tests grid + explore-by-type grid, with a right
// side-panel of widgets. Tests are fetched via SWR; category filtering is done
// client-side to avoid a refetch per tab (same pattern as Study Space).
import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Clock, FileQuestion, ListChecks, ToggleLeft, Terminal, Code2, Braces } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher } from "@/lib/api";
import type { TestListItem, Difficulty } from "@/lib/practice-types";
import {
  QuickActions,
  TestStreak,
  Leaderboard,
  TrendingTests,
} from "@/components/practice/side-widgets";

const FILTERS = [
  { label: "All Tests", value: "ALL" },
  { label: "Aptitude", value: "APTITUDE" },
  { label: "Coding", value: "CODING" },
  { label: "DSA", value: "DSA" },
  { label: "Domain", value: "DOMAIN" },
  { label: "Company Specific", value: "COMPANY_SPECIFIC" },
];

const TEST_TYPES = [
  { label: "MCQs", desc: "Single correct answer", icon: FileQuestion },
  { label: "Multiple Select", desc: "One or more correct", icon: ListChecks },
  { label: "True / False", desc: "Quick true/false", icon: ToggleLeft },
  { label: "Predict Output", desc: "Predict code output", icon: Terminal },
  { label: "Pseudocode", desc: "Logic in plain English", icon: Braces },
  { label: "Coding Practice", desc: "Solve problems online", icon: Code2 },
];

function difficultyVariant(d: Difficulty): "easy" | "medium" | "hard" {
  return d === "EASY" ? "easy" : d === "HARD" ? "hard" : "medium";
}

export default function PracticeArenaPage() {
  const [active, setActive] = useState("ALL");
  const { data, isLoading } = useSWR<{ tests: TestListItem[] }>("/api/practice/tests", fetcher);

  // Client-side category filter — no network request on tab switch.
  const tests = useMemo(() => {
    const all = data?.tests ?? [];
    return active === "ALL" ? all : all.filter((t) => t.category === active);
  }, [data, active]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Practice Arena</h1>
        <p className="text-sm text-slate-500">
          Sharpen your skills with mocks, practice tests and coding challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="space-y-8">
          {/* Filter ribbon */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActive(f.value)}
                className={
                  "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
                  (active === f.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Recommended tests grid */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Recommended for You</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-xl" />
                ))}

              {!isLoading &&
                tests.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {(t.company ?? t.title).slice(0, 2).toUpperCase()}
                        </span>
                        <Badge variant={difficultyVariant(t.difficulty)}>
                          {t.difficulty[0] + t.difficulty.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{t.title}</h3>
                        <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span>{t.questionCount} Questions</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {t.durationMinutes} mins
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-400">{formatAttempts(t.attempts)}</p>
                      <Button asChild className="mt-auto w-full">
                        <Link href={`/dashboard/practice-arena/${t.id}`}>Start Test</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}

              {!isLoading && tests.length === 0 && (
                <p className="col-span-full py-8 text-center text-sm text-slate-400">
                  No tests in this category yet.
                </p>
              )}
            </div>
          </section>

          {/* Explore by test type */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Explore by Test Type</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEST_TYPES.map((tt) => {
                const Icon = tt.icon;
                return (
                  <Card key={tt.label}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{tt.label}</p>
                        <p className="text-xs text-slate-500">{tt.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right side panel */}
        <aside className="space-y-4">
          <QuickActions />
          <TestStreak />
          <Leaderboard />
          <TrendingTests />
        </aside>
      </div>
    </div>
  );
}

function formatAttempts(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+ Attempts`;
  return `${n} Attempts`;
}
