"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  Code2,
  Database,
  Flame,
  Globe2,
  Network,
  Server,
  ShieldCheck,
  Target,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TargetDialog } from "@/components/study-plan/target-dialog";
import { DayWisePlan } from "@/components/study-plan/day-wise-plan";
import type { StudyTarget } from "@/components/study-plan/types";
import { COURSE_CATALOG } from "@/components/study-plan/course-catalog";

const initialTarget: StudyTarget = {
  goal: "Crack DSA foundations",
  targetDate: "2026-11-30",
  hoursPerDay: 2,
  planDays: [],
};

function daysRemaining(targetDate: string) {
  const difference =
    new Date(`${targetDate}T23:59:59`).getTime() - Date.now();

  return Math.max(0, Math.ceil(difference / 86400000));
}

/* -------------------------------------------------------
   STAT CARD
------------------------------------------------------- */

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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-lg bg-indigo-50 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </span>

          {children}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-bold text-slate-950">
          {value}
        </p>

        {detail && (
          <p className="mt-1 text-xs text-slate-500">
            {detail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
   PLACEHOLDER CARD
------------------------------------------------------- */

function SectionPlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------
   CIRCULAR PROGRESS
------------------------------------------------------- */

function ProgressCircle({
  progress,
}: {
  progress: number;
}) {
  const radius = 15;

  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative h-10 w-10 shrink-0"
      aria-label={`${progress}% complete`}
    >
      <svg
        className="h-10 w-10 -rotate-90"
        viewBox="0 0 40 40"
      >
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#e0e7ff"
          strokeWidth="4"
        />

        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
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

      {/* Percentage inside circle */}
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-700">
        {progress}%
      </span>
    </div>
  );
}

/* -------------------------------------------------------
   STUDY PLAN DASHBOARD
------------------------------------------------------- */

export function StudyPlanDashboard() {
  const [target, setTarget] =
    useState<StudyTarget>(initialTarget);

  const [targetOpen, setTargetOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const days = daysRemaining(target.targetDate);

  /* -----------------------------------------------------
     CALCULATE OVERALL PROGRESS
  ----------------------------------------------------- */

  const totalDays = target.planDays.length;

  const completedDays = target.planDays.filter(
    (day) => day.completed
  ).length;

  const progressPercent =
    totalDays > 0
      ? Math.round((completedDays / totalDays) * 100)
      : 0;

  /* -----------------------------------------------------
     SEARCH
  ----------------------------------------------------- */

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    const matches = COURSE_CATALOG.filter((course) =>
      !normalizedSearch ||
      `${course.title} ${course.category}`
        .toLowerCase()
        .includes(normalizedSearch)
    );

    return normalizedSearch
      ? matches
      : matches.slice(0, 5);
  }, [normalizedSearch]);

  /* -----------------------------------------------------
     SEARCH EVENT
  ----------------------------------------------------- */

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

    return () =>
      window.removeEventListener(
        "study-space-search",
        handleSearch
      );
  }, []);

  /* -----------------------------------------------------
     TOGGLE DAY
  ----------------------------------------------------- */

  function toggleDay(date: string) {
    setTarget((current) => ({
      ...current,

      planDays: current.planDays.map((day) =>
        day.date === date
          ? {
              ...day,
              completed: !day.completed,
            }
          : day
      ),
    }));
  }

  /* -----------------------------------------------------
     UI
  ----------------------------------------------------- */

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            Your learning command center
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Study Plan
          </h1>
        </div>

        <Button
          type="button"
          onClick={() => setTargetOpen(true)}
        >
          <Target className="h-4 w-4" />
          Set Target
        </Button>
      </div>

      {/* -------------------------------------------------
          STAT CARDS
      ------------------------------------------------- */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* CURRENT TARGET */}

        <StatCard
          icon={Target}
          label="Current Target"
          value={target.goal}
          detail={`Due ${target.targetDate}`}
        >
          <Badge>
            {days === 0
              ? "Due today"
              : "On track"}
          </Badge>
        </StatCard>

        {/* DAYS REMAINING */}

        <StatCard
          icon={CalendarDays}
          label="Days Remaining"
          value={`${days} ${
            days === 1 ? "day" : "days"
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
              ? `${completedDays} of ${totalDays} plan days completed`
              : "Set a target to begin"
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
          <Flame className="h-5 w-5 text-amber-500" />
        </StatCard>

      </div>

      {/* -------------------------------------------------
          TODAY + SMART QUEUE
      ------------------------------------------------- */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* TODAY'S PRIORITY */}

        <Card>
          <CardContent className="p-5">

            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Today&apos;s priority
                </p>

                <h2 className="mt-2 text-lg font-semibold text-slate-900">
                  {target.goal}
                </h2>
              </div>

              <span className="rounded-lg bg-indigo-50 p-2 text-primary">
                <Target className="h-5 w-5" />
              </span>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Keep building momentum with a mini-course
              matched to your current target.
            </p>

            <Link
              href={`/dashboard/study-space/learn?topic=${encodeURIComponent(
                target.goal
              )}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <BookOpen className="h-4 w-4" />

              Start course: {target.goal}
            </Link>

          </CardContent>
        </Card>

        {/* SMART QUEUE */}

        <SectionPlaceholder title="Smart Queue" />

        {/* DAY WISE PLAN */}

        <DayWisePlan
          planDays={target.planDays}
          onToggleDay={toggleDay}
        />

        {/* CATCH UP */}

        <SectionPlaceholder
          title="Catch-Up & Reschedule"
        />

        {/* REVISION */}

        <SectionPlaceholder
          title="Revision Loop"
        />

      </div>

      {/* -------------------------------------------------
          EXPLORE COURSES
      ------------------------------------------------- */}

      <section aria-labelledby="explore-courses-title">

        <div className="mb-3 flex items-end justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Build your skills
            </p>

            <h2
              id="explore-courses-title"
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              Explore Courses
            </h2>
          </div>

          <p className="text-sm text-slate-500">
            {normalizedSearch
              ? `${filteredCourses.length} ${
                  filteredCourses.length === 1
                    ? "course"
                    : "courses"
                } found`
              : `Showing ${filteredCourses.length} of ${COURSE_CATALOG.length} courses`}
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredCourses.map((course) => (
            <CourseCard
              key={course.slug}
              course={course}
            />
          ))}

          {filteredCourses.length === 0 &&
            normalizedSearch && (
              <Link
                href={`/dashboard/study-space/learn?topic=${encodeURIComponent(
                  search.trim()
                )}`}
                className="group rounded-xl border border-dashed border-primary/40 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md sm:col-span-2 lg:col-span-3 xl:col-span-4"
              >
                <div className="flex h-24 items-center gap-4 rounded-lg bg-indigo-50 px-4 text-primary">

                  <BookOpen className="h-8 w-8 shrink-0" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em]">
                      Search results
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      Learn {search.trim()}
                    </p>
                  </div>

                </div>
              </Link>
            )}

        </div>
      </section>

      {/* -------------------------------------------------
          TARGET DIALOG
      ------------------------------------------------- */}

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

/* -------------------------------------------------------
   COURSE CARD
------------------------------------------------------- */

function CourseCard({
  course,
}: {
  course: (typeof COURSE_CATALOG)[number];
}) {
  const Icon = courseIcon(
    course.category,
    course.title
  );

  return (
    <Link
      href={`/dashboard/study-space/learn?topic=${encodeURIComponent(
        course.title
      )}`}
      className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
    >

      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 text-primary">

        <Icon className="h-10 w-10 transition-transform group-hover:scale-110" />

      </div>

      <div className="p-4">

        <h3 className="font-semibold text-slate-900">
          {course.title}
        </h3>

        <Badge
          variant="secondary"
          className="mt-2"
        >
          {course.category}
        </Badge>

      </div>

    </Link>
  );
}

/* -------------------------------------------------------
   COURSE ICON
------------------------------------------------------- */

function courseIcon(
  category: string,
  title: string
) {
  if (
    category === "Databases" ||
    title === "DBMS"
  ) {
    return Database;
  }

  if (
    category === "Core CS" &&
    title === "Operating Systems"
  ) {
    return Server;
  }

  if (title === "Computer Networks") {
    return Network;
  }

  if (category === "Web Development") {
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
    category === "Systems"
  ) {
    return Code2;
  }

  return BookOpen;
}