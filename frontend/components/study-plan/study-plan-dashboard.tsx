"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Flame,
  Globe2,
  Layers3,
  Network,
  Server,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TargetDialog } from "@/components/study-plan/target-dialog";
import { DayWisePlan } from "@/components/study-plan/day-wise-plan";
import type { StudyTarget } from "@/components/study-plan/types";
import { COURSE_CATALOG } from "@/components/study-plan/course-catalog";

/* =========================================================
   INITIAL TARGET
========================================================= */

const initialTarget: StudyTarget = {
  goal: "Crack DSA foundations",
  targetDate: "2026-11-30",
  hoursPerDay: 2,
  planDays: [],
};

/* =========================================================
   HELPERS
========================================================= */

function daysRemaining(targetDate: string) {
  const difference =
    new Date(`${targetDate}T23:59:59`).getTime() - Date.now();

  return Math.max(0, Math.ceil(difference / 86400000));
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  children,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-primary">
            <Icon className="h-5 w-5" />
          </span>

          {children}
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-bold text-slate-950">
          {value}
        </p>

        {detail && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {detail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================================================
   CIRCULAR PROGRESS
========================================================= */

function ProgressCircle({
  progress,
}: {
  progress: number;
}) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative h-12 w-12 shrink-0"
      aria-label={`${progress}% complete`}
    >
      <svg
        className="h-12 w-12 -rotate-90"
        viewBox="0 0 44 44"
      >
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />

        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="var(--primary, #4f46e5)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-700">
        {progress}%
      </span>
    </div>
  );
}

/* =========================================================
   CATEGORY FILTER OPTIONS
========================================================= */

const CATEGORY_OPTIONS = [
  "All",
  "Programming",
  "Core CS",
  "Databases",
  "Web Development",
  "AI & Data",
  "Systems",
  "Architecture",
  "Engineering",
  "DevOps",
  "Security",
  "Cloud",
  "Mathematics",
  "Theory",
  "Development",
];

/* =========================================================
   STUDY PLAN DASHBOARD
========================================================= */

export function StudyPlanDashboard() {
  const [target, setTarget] =
    useState<StudyTarget>(initialTarget);

  const [targetOpen, setTargetOpen] =
    useState(false);

  /*
   * This search is still connected to the TOP
   * navigation search bar through the
   * "study-space-search" event.
   */
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const days = daysRemaining(target.targetDate);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const totalDays = target.planDays.length;

  const completedDays = target.planDays.filter(
    (day) => day.completed
  ).length;

  const progressPercent =
    totalDays > 0
      ? Math.min(
          100,
          Math.round(
            (completedDays / totalDays) * 100
          )
        )
      : 0;

  /* =======================================================
     TOP NAVIGATION SEARCH
  ======================================================= */

  useEffect(() => {
    function handleSearch(event: Event) {
      setSearch(
        (event as CustomEvent<string>).detail
      );
    }

    window.addEventListener(
      "study-space-search",
      handleSearch
    );

    return () => {
      window.removeEventListener(
        "study-space-search",
        handleSearch
      );
    };
  }, []);

  /* =======================================================
     FILTER COURSES
  ======================================================= */

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    const matches = COURSE_CATALOG.filter(
      (course) => {
        const matchesSearch =
          !normalizedSearch ||
          `${course.title} ${course.category}`
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesCategory =
          category === "All" ||
          course.category === category;

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );

    /*
     * Default state:
     * show first 4 courses.
     */
    if (
      !normalizedSearch &&
      category === "All"
    ) {
      return matches.slice(0, 4);
    }

    return matches;
  }, [normalizedSearch, category]);

  /* =======================================================
     TOGGLE DAY
  ======================================================= */

  function toggleDay(date: string) {
    setTarget((current) => ({
      ...current,

      planDays: current.planDays.map(
        (day) =>
          day.date === date
            ? {
                ...day,
                completed: !day.completed,
              }
            : day
      ),
    }));
  }

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setCategory("All");
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm font-medium text-primary">
            Your learning command center
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Study Plan
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize your learning, follow your target,
            and stay consistent.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setTargetOpen(true)}
          className="gap-2"
        >
          <Target className="h-4 w-4" />
          Set Target
        </Button>

      </div>

      {/* =================================================
          CATEGORY FILTERS
      ================================================= */}

      <div className="flex gap-2 overflow-x-auto pb-1">

        {CATEGORY_OPTIONS.map((option) => {
          const isActive =
            category === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                setCategory(option)
              }
              className={`whitespace-nowrap rounded-md border px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:bg-indigo-50 hover:text-primary"
              }`}
            >
              {option === "All"
                ? "All Modules"
                : option}
            </button>
          );
        })}

      </div>

      {/* =================================================
          ACTIVE FILTER INDICATOR
      ================================================= */}

      {(normalizedSearch ||
        category !== "All") && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2.5">

          <div className="text-xs text-slate-600">

            {normalizedSearch && (
              <span>
                Search:{" "}
                <strong className="text-slate-900">
                  {search}
                </strong>
              </span>
            )}

            {normalizedSearch &&
              category !== "All" && (
                <span className="mx-2 text-slate-400">
                  •
                </span>
              )}

            {category !== "All" && (
              <span>
                Category:{" "}
                <strong className="text-slate-900">
                  {category}
                </strong>
              </span>
            )}

          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>

        </div>
      )}

      {/* =================================================
          MAIN DASHBOARD GRID
      ================================================= */}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,0.9fr)]">

        {/* =================================================
            LEFT — LEARNING PATHS
        ================================================= */}

        <section>

          <div className="mb-4 flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Learning Paths & Modules
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Build your skills
              </h2>
            </div>

            <p className="text-xs text-slate-500">
              {filteredCourses.length}{" "}
              {filteredCourses.length === 1
                ? "module"
                : "modules"}
            </p>

          </div>

          {/* =================================================
              LEARNING CARDS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2">

            {/* =================================================
                TODAY'S PRIORITY
            ================================================= */}

            <Link
              href={`/dashboard/study-space/learn?topic=${encodeURIComponent(
                target.goal
              )}`}
              className="group sm:col-span-2"
            >

              <Card className="overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">

                <CardContent className="p-0">

                  <div className="grid md:grid-cols-[1.05fr_0.95fr]">

                    {/* COLORFUL VISUAL */}

                    <div className="relative min-h-[190px] overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6">

                      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

                      <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10" />

                      <div className="relative flex h-full flex-col justify-between">

                        <div className="flex items-center justify-between">

                          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                            <Flame className="h-3.5 w-3.5" />
                            TODAY&apos;S PRIORITY
                          </span>

                          <ArrowRight className="h-5 w-5 text-white/80 transition-transform group-hover:translate-x-1" />

                        </div>

                        <div className="mt-8">

                          <div className="mb-3 flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-sm">
                              <Target className="h-6 w-6" />
                            </div>

                            <div className="flex gap-1">
                              <span className="h-2 w-2 rounded-full bg-white/80" />
                              <span className="h-2 w-2 rounded-full bg-white/50" />
                              <span className="h-2 w-2 rounded-full bg-white/30" />
                            </div>

                          </div>

                          <h3 className="max-w-md text-2xl font-bold text-white">
                            {target.goal}
                          </h3>

                        </div>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="flex flex-col justify-between p-6">

                      <div>

                        <Badge className="bg-indigo-50 text-primary hover:bg-indigo-50">
                          Current Target
                        </Badge>

                        <h3 className="mt-3 text-lg font-bold text-slate-950">
                          Focus on your current goal
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Start learning today and keep
                          your study routine aligned with
                          your target.
                        </p>

                      </div>

                      <div className="mt-6 flex items-center justify-between">

                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <Clock3 className="h-4 w-4 text-primary" />
                          {target.hoursPerDay} hours/day
                        </div>

                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                          Start Learning
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>

                      </div>

                    </div>

                  </div>

                </CardContent>

              </Card>

            </Link>

            {/* =================================================
                COURSE MODULES
            ================================================= */}

            {filteredCourses.map(
              (course, index) => (
                <CourseCard
                  key={course.slug}
                  course={course}
                  index={index}
                />
              )
            )}

            {/* =================================================
                NO RESULTS
            ================================================= */}

            {filteredCourses.length === 0 && (
              <Card className="border-dashed border-slate-300 bg-slate-50 sm:col-span-2">

                <CardContent className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No learning modules found
                  </h3>

                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Try another search term or select
                    a different category.
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>

                </CardContent>

              </Card>
            )}

          </div>

        </section>

        {/* =================================================
            RIGHT — STUDY OVERVIEW
        ================================================= */}

        <aside>

          <div className="mb-4">

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Your Progress
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Study Overview
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">

            {/* CURRENT TARGET */}

            <StatCard
              icon={Target}
              label="Current Target"
              value={target.goal}
              detail={`Due ${target.targetDate}`}
            >
              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                Active
              </Badge>
            </StatCard>

            {/* REMAINING DAYS */}

            <StatCard
              icon={CalendarDays}
              label="Remaining Days"
              value={`${days} ${
                days === 1
                  ? "day"
                  : "days"
              }`}
              detail="Keep your daily rhythm"
            />

            {/* OVERALL PROGRESS */}

            <StatCard
              icon={TrendingUp}
              label="Overall Progress"
              value={`${progressPercent}%`}
              detail={
                totalDays > 0
                  ? `${completedDays} of ${totalDays} days completed`
                  : "Start your plan to track progress"
              }
            >
              <ProgressCircle
                progress={progressPercent}
              />
            </StatCard>

            {/* STUDY TIME */}

            <StatCard
              icon={Clock3}
              label="Study Time / Day"
              value={`${target.hoursPerDay} hours`}
              detail="Your planned daily pace"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Flame className="h-5 w-5" />
              </span>
            </StatCard>

          </div>

        </aside>

      </div>

      {/* =================================================
          DAY-WISE PLAN
      ================================================= */}

      <section>

        <div className="mb-4">

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Your Schedule
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Day-wise Study Plan
          </h2>

        </div>

        <DayWisePlan
          planDays={target.planDays}
          onToggleDay={toggleDay}
        />

      </section>

      {/* =================================================
          ADDITIONAL FEATURES
      ================================================= */}

      <div className="grid gap-4 md:grid-cols-2">

        {/* SMART QUEUE */}

        <FeatureCard
          icon={Layers3}
          title="Smart Queue"
          description="Prioritize the modules that matter most for your current target."
        />

        {/* CATCH UP */}

        <FeatureCard
          icon={CalendarDays}
          title="Catch-Up & Reschedule"
          description="Recover unfinished study tasks and keep your plan organized."
        />

        {/* REVISION */}

        <FeatureCard
          icon={BrainCircuit}
          title="Revision Loop"
          description="Keep important topics visible so you can revisit them regularly."
        />

        {/* NEXT MILESTONE */}

        <FeatureCard
          icon={CheckCircle2}
          title="Next Milestone"
          description="Complete your current stage and move toward the next learning goal."
        />

      </div>

      {/* =================================================
          TARGET DIALOG
      ================================================= */}

      <TargetDialog
        open={targetOpen}
        initialTarget={target}
        onClose={() => setTargetOpen(false)}
        onSave={(nextTarget) => {
          setTarget(nextTarget);
          setTargetOpen(false);
        }}
      />

    </div>
  );
}

/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({
  course,
  index,
}: {
  course: (typeof COURSE_CATALOG)[number];
  index: number;
}) {
  const Icon = courseIcon(
    course.category,
    course.title
  );

  const visualClasses = [
    "from-sky-100 via-indigo-50 to-white text-sky-600",
    "from-emerald-100 via-teal-50 to-white text-emerald-600",
    "from-orange-100 via-amber-50 to-white text-orange-600",
    "from-violet-100 via-fuchsia-50 to-white text-violet-600",
    "from-rose-100 via-pink-50 to-white text-rose-600",
  ];

  const visual =
    visualClasses[
      index % visualClasses.length
    ];

  return (
    <Link
      href={`/dashboard/study-space/learn?topic=${encodeURIComponent(
        course.title
      )}`}
      className="group"
    >

      <Card className="h-full overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md">

        <CardContent className="p-0">

          {/* COURSE VISUAL */}

          <div
            className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${visual}`}
          >

            <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/60" />

            <div className="absolute -bottom-10 -left-5 h-28 w-28 rounded-full bg-white/50" />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/75 shadow-sm backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">

              <Icon className="h-8 w-8" />

            </div>

            <div className="absolute bottom-3 left-4 rounded-full bg-white/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 backdrop-blur-sm">
              Module
            </div>

          </div>

          {/* COURSE DETAILS */}

          <div className="p-4">

            <h3 className="line-clamp-1 font-bold text-slate-950">
              {course.title}
            </h3>

            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
              {course.category}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <span className="text-xs font-medium text-slate-400">
                Start learning
              </span>

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-primary">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>

            </div>

          </div>

        </CardContent>

      </Card>

    </Link>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Target;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="p-5">

        <div className="flex gap-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-primary">
            <Icon className="h-5 w-5" />
          </div>

          <div>

            <h3 className="font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}

/* =========================================================
   COURSE ICON
========================================================= */

function courseIcon(
  category: string,
  title: string
) {
  if (
    category === "Databases" ||
    title === "DBMS" ||
    title === "MySQL" ||
    title === "MongoDB" ||
    title === "SQL"
  ) {
    return Database;
  }

  if (
    title === "Operating Systems" ||
    category === "Systems"
  ) {
    return Server;
  }

  if (title === "Computer Networks") {
    return Network;
  }

  if (
    category === "Web Development" ||
    title === "React" ||
    title === "JavaScript"
  ) {
    return Globe2;
  }

  if (category === "Security") {
    return ShieldCheck;
  }

  if (category === "AI & Data") {
    return BrainCircuit;
  }

  if (
    category === "Programming" ||
    title === "Algorithms" ||
    title === "Data Structures"
  ) {
    return Code2;
  }

  if (category === "Core CS") {
    return Layers3;
  }

  return BookOpen;
}