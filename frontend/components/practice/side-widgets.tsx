"use client";

import useSWR from "swr";
import { Bookmark, Target, Sparkles, TrendingUp, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, getCurrentUserId } from "@/lib/api";
import type { LeaderboardEntry, StreakDay } from "@/lib/practice-types";

// --- Quick Actions -----------------------------------------------------------
export function QuickActions() {
  const actions = [
    { label: "My Practice Tests", icon: Target },
    { label: "Bookmarks", icon: Bookmark, count: 12 },
    { label: "Weak Areas", icon: Sparkles, count: 5 },
    { label: "Custom Test", icon: TrendingUp },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                {a.label}
              </span>
              {a.count !== undefined && <span className="text-xs text-slate-400">{a.count}</span>}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

// --- Test Streak (7-day) -----------------------------------------------------
export function TestStreak() {
  const userId = getCurrentUserId();
  const { data } = useSWR<{ streak: boolean[]; days: StreakDay[] }>(
    userId ? `/api/practice/streak/${userId}` : null,
    fetcher
  );
  const days: StreakDay[] =
    data?.days ??
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => ({
      label,
      date: "",
      completed: false,
    }));
  const activeCount = days.filter((d) => d.completed).length;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Test Streak</CardTitle>
        <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
          <Flame className="h-4 w-4" /> {activeCount} Days
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold " +
                  (d.completed ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400")
                }
              >
                {d.completed ? "✓" : ""}
              </span>
              <span className="text-[10px] text-slate-400">{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- Leaderboard -------------------------------------------------------------
export function Leaderboard() {
  const { data, isLoading } = useSWR<{ leaderboard: LeaderboardEntry[] }>(
    "/api/practice/leaderboard",
    fetcher
  );
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        {data?.leaderboard.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <span className="w-5 text-sm">{medals[u.rank - 1] ?? u.rank}</span>
            <div className="h-7 w-7 rounded-full bg-primary/10" />
            <span className="flex-1 truncate text-sm text-slate-700">{u.name}</span>
            <span className="text-sm font-semibold text-slate-900">{u.points}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Trending Tests ----------------------------------------------------------
export function TrendingTests() {
  const { data } = useSWR<{ tests: { id: string; title: string; attempts: number }[] }>(
    "/api/practice/tests",
    fetcher
  );
  const trending = (data?.tests ?? []).slice(0, 3);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trending Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trending.map((t) => (
          <div key={t.id} className="flex items-center justify-between">
            <span className="truncate text-sm text-slate-700">{t.title}</span>
            <span className="text-xs text-slate-400">{formatAttempts(t.attempts)}</span>
          </div>
        ))}
        {trending.length === 0 && <p className="text-sm text-slate-400">No tests yet.</p>}
      </CardContent>
    </Card>
  );
}

function formatAttempts(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+ attempts`;
  return `${n} attempts`;
}
