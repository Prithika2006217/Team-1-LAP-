"use client";

import {
  BrainCircuit,
  Clock3,
  Code2,
  Database,
  Layers3,
  Play,
  Search,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";


type Topic = {
  name: string;
  description: string;
  icon: React.ElementType;
};

const topics: Topic[] = [
  {
    name: "Binary Trees",
    description:
      "Tree traversal, recursion & BST patterns",
    icon: Layers3,
  },
  {
    name: "Graphs",
    description:
      "BFS, DFS, shortest paths & connectivity",
    icon: BrainCircuit,
  },
  {
    name: "Arrays",
    description:
      "Arrays, prefixes, sliding window & sorting",
    icon: Layers3,
  },
  {
    name: "Dynamic Programming",
    description:
      "State optimization and counting DP",
    icon: BrainCircuit,
  },
  {
    name: "Java",
    description:
      "Core Java & OOP concepts",
    icon: Code2,
  },
  {
    name: "DBMS",
    description:
      "SQL, normalization & transactions",
    icon: Database,
  },
  {
    name: "Operating Systems",
    description:
      "Processes, memory & scheduling",
    icon: Layers3,
  },
];

const difficulties = [
  "ALL",
  "EASY",
  "MEDIUM",
  "HARD",
] as const;

type DifficultyFilter =
  (typeof difficulties)[number];

export default function PracticeArenaPage() {
  const [topic, setTopic] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [difficulty, setDifficulty] =
    useState<DifficultyFilter>("ALL");

  const filteredTopics =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return topics;
      }

      return topics.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(value) ||
          item.description
            .toLowerCase()
            .includes(value)
      );
    }, [search]);

  // -------------------------------------------------------------------------
  // Generate AI test
  // -------------------------------------------------------------------------

  function openGeneratedTest() {
    const cleanTopic = topic.trim();
    if (!cleanTopic) return;

    window.open(
      `/practice/test?topic=${encodeURIComponent(cleanTopic)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // -------------------------------------------------------------------------
  // Select topic
  // -------------------------------------------------------------------------

  function selectTopic(
    selectedTopic: string
  ) {
    setTopic(selectedTopic);
  }

  // -------------------------------------------------------------------------
  // Clear topic
  // -------------------------------------------------------------------------

  function clearTopic() {
    setTopic("");
  }

  return (
    <div className="space-y-7 pb-10">

      {/* ================================================================ */}
      {/* HEADER */}
      {/* ================================================================ */}

      <section>
        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Practice Arena
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Generate personalized practice tests
                with AI.
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:flex">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <span className="text-sm">
                🔥
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                7 Day Streak
              </p>

              <p className="text-[10px] text-slate-400">
                Keep practicing
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* AI GENERATOR */}
      {/* ================================================================ */}

      <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-sm">

        <div className="p-5 sm:p-7">

          <div className="max-w-2xl">

            <div className="mb-2 flex items-center gap-2">

              <Sparkles className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                AI Test Generator
              </span>

            </div>

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Practice any topic you want
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter any topic and generate 90
              personalized questions with 30 Easy,
              30 Medium and 30 Hard questions.
            </p>

          </div>

          {/* INPUT */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={topic}
                onChange={(event) => {
                  setTopic(
                    event.target.value
                  );
                }}
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter"
                  ) {
                    openGeneratedTest();
                  }
                }}
                placeholder="Enter a topic e.g. Binary Trees, DBMS, Java..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              {topic &&
                (
                  <button
                    type="button"
                    onClick={clearTopic}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

            </div>

            <button
              type="button"
              onClick={openGeneratedTest}
              disabled={!topic.trim()}
              className="flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Test
              </>
            </button>

          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DifficultyCard
              color="green"
              title="Easy"
              description="30 Questions"
            />

            <DifficultyCard
              color="yellow"
              title="Medium"
              description="30 Questions"
            />

            <DifficultyCard
              color="red"
              title="Hard"
              description="30 Questions"
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FILTER */}
      {/* ================================================================ */}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Difficulty
          </h2>

          <p className="text-xs text-slate-400">
            The filter will also be available inside
            generated tests.
          </p>
        </div>

        <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">

          {difficulties.map(
            (item) => {
              const active =
                difficulty === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setDifficulty(
                      item
                    )
                  }
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  ].join(" ")}
                >
                  {item === "ALL"
                    ? "All"
                    : item.charAt(
                        0
                      ) +
                      item
                        .slice(1)
                        .toLowerCase()}
                </button>
              );
            }
          )}

        </div>

      </section>

      {/* ================================================================ */}
      {/* POPULAR TOPICS */}
      {/* ================================================================ */}

      <section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Popular Topics
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Select one to automatically fill the
              generator.
            </p>
          </div>

          <div className="relative w-full sm:w-64">

            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search topics..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400"
            />

          </div>

        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

          {filteredTopics.map(
            (item) => {
              const Icon =
                item.icon;

              const selected =
                topic.toLowerCase() ===
                item.name.toLowerCase();

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    selectTopic(
                      item.name
                    )
                  }
                  className={[
                    "group flex items-center gap-4 rounded-xl border bg-white p-4 text-left shadow-sm transition",
                    selected
                      ? "border-blue-400 ring-2 ring-blue-100"
                      : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  ].join(" ")}
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">

                    <Icon className="h-5 w-5" />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-slate-800">
                      {item.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {item.description}
                    </p>

                  </div>

                  <Play className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* ================================================================ */}
      {/* INFORMATION CARDS */}
      {/* ================================================================ */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <InfoCard
          icon={
            <Layers3 className="h-4 w-4" />
          }
          title="90 Questions"
          description="30 questions at each difficulty"
        />

        <InfoCard
          icon={
            <Clock3 className="h-4 w-4" />
          }
          title="90 Minutes"
          description="Practice at your own pace"
        />

        <InfoCard
          icon={
            <Trophy className="h-4 w-4" />
          }
          title="Track Progress"
          description="Review performance after submission"
        />

      </section>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Difficulty card
// ---------------------------------------------------------------------------

function DifficultyCard({
  color,
  title,
  description,
}: {
  color: "green" | "yellow" | "red";
  title: string;
  description: string;
}) {
  const styles = {
    green: {
      dot: "bg-emerald-500",
      border: "border-emerald-100",
    },

    yellow: {
      dot: "bg-amber-500",
      border: "border-amber-100",
    },

    red: {
      dot: "bg-red-500",
      border: "border-red-100",
    },
  };

  return (
    <div
      className={`rounded-xl border ${styles[color].border} bg-white/80 p-3`}
    >
      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${styles[color].dot}`}
        />

        <span className="text-sm font-semibold text-slate-800">
          {title}
        </span>

      </div>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Information card
// ---------------------------------------------------------------------------

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
        {icon}
      </div>

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>

      </div>

    </div>
  );
}