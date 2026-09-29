"use client";

import {
  Clock,
  FileQuestion,
  ListChecks,
  ToggleLeft,
  Terminal,
  Code2,
  Braces,
  Search,
  SlidersHorizontal,
} from "lucide-react";

const categories = [
  "All Tests",
  "Aptitude",
  "Coding",
  "DSA",
  "Domain",
  "Company Specific",
  "Product Specific",
  "Interview",
  "AI",
];

const recommendedTests = [
  {
    title: "Aptitude Mock Test 15",
    category: "Aptitude",
    difficulty: "Medium",
    questions: "30 Questions",
    duration: "60 mins",
    attempts: "1.2k+ Attempts",
    image: "/logos/aptitude.png",
  },
  {
    title: "Python Basics Mock",
    category: "Coding",
    difficulty: "Medium",
    questions: "30 Questions",
    duration: "45 mins",
    attempts: "2.5k+ Attempts",
    image: "/logos/python.png",
  },
  {
    title: "Amazon SDE Mock",
    category: "Company Specific",
    difficulty: "Hard",
    questions: "65 Questions",
    duration: "90 mins",
    attempts: "3.6k+ Attempts",
    image: "/logos/amazon.png",
  },
  {
    title: "JavaScript Mock Test",
    category: "Coding",
    difficulty: "Medium",
    questions: "40 Questions",
    duration: "60 mins",
    attempts: "900+ Attempts",
    image: "/logos/js.png",
  },
  {
    title: "Quantitative Aptitude",
    category: "Aptitude",
    difficulty: "Easy",
    questions: "30 Questions",
    duration: "45 mins",
    attempts: "1.4k+ Attempts",
    image: "/logos/aptitude.png",
  },
  {
    title: "Data Structures - Arrays",
    category: "DSA",
    difficulty: "Medium",
    questions: "30 Questions",
    duration: "45 mins",
    attempts: "1.8k+ Attempts",
    image: "/logos/dbms.png",
  },
];

const testTypes = [
  {
    title: "MCQs",
    description: "Single correct answer",
    icon: FileQuestion,
  },
  {
    title: "Multiple Select",
    description: "One or more correct",
    icon: ListChecks,
  },
  {
    title: "True / False",
    description: "Quick true/false",
    icon: ToggleLeft,
  },
  {
    title: "Predict Output",
    description: "Predict code output",
    icon: Terminal,
  },
  {
    title: "Pseudocode",
    description: "Logic in plain English",
    icon: Braces,
  },
  {
    title: "Coding Practice",
    description: "Solve problems online",
    icon: Code2,
  },
];

export default function PracticeArenaPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Practice Arena
        </h1>

        <p className="text-sm text-slate-500">
          Sharpen your skills with mocks, practice tests and coding challenges.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-md border border-slate-200 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" />

          <span className="text-xs text-slate-400">
            Search tests, topics, company...
          </span>
        </div>

        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600">
          All Categories
        </button>

        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600">
          All Skills
        </button>

        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600">
          All Difficulty
        </button>

        <button className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600">
          All Durations
        </button>

        <button className="flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-600">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </button>

        <button className="h-9 px-1 text-xs text-blue-600">
          Clear All
        </button>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
        {categories.map((category) => (
          <div
            key={category}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:shadow-md"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
              {category.slice(0, 2).toUpperCase()}
            </div>

            <p className="text-xs font-medium text-slate-700">
              {category}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              50 Tests
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_20rem]">

        {/* Left Side */}
        <div className="space-y-8">

          {/* Recommended for You */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Recommended for You
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

              {recommendedTests.map((test) => (
                <div
                  key={test.title}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                >

                  {/* Logo + Difficulty */}
                  <div className="flex items-start justify-between gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-100 bg-white">
                      <img
                        src={test.image}
                        alt={test.title}
                        className="h-7 w-7 object-contain"
                      />
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                      {test.difficulty}
                    </span>

                  </div>

                  {/* Test Title */}
                  <p className="mt-3 text-xs font-semibold text-slate-800">
                    {test.title}
                  </p>

                  {/* Questions, Time, Attempts */}
                  <div className="mt-2 space-y-1.5 text-[10px] text-slate-400">

                    <p>
                      {test.questions}
                    </p>

                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {test.duration}
                    </p>

                    <p>
                      {test.attempts}
                    </p>

                  </div>

                  {/* Start Test */}
                  <button className="mt-3 w-full rounded-lg border border-blue-500 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50">
                    Start Test
                  </button>

                </div>
              ))}

            </div>
          </section>

          {/* Explore by Test Type */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Explore by Test Type
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

              {testTypes.map((type) => {
                const Icon = type.icon;

                return (
                  <div
                    key={type.title}
                    className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition hover:shadow-md"
                  >

                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {type.title}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {type.description}
                    </p>

                  </div>
                );
              })}

            </div>
          </section>

        </div>

        {/* Right Side Panel */}
        <aside className="space-y-4">

          {/* Quick Actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Quick Actions
            </h3>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                My Practice Tests
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Bookmarks
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Weak Areas
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Custom Test
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Challenge Friends
              </div>
            </div>
          </div>

          {/* Test Streak */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Test Streak
            </h3>

            <p className="mt-3 text-2xl font-bold text-orange-500">
              🔥 7 Days
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Keep practicing every day!
            </p>
          </div>

          {/* Leaderboard */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Leaderboard
            </h3>

            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>1. Rahul</span>
                <span>980</span>
              </div>

              <div className="flex justify-between">
                <span>2. Priya</span>
                <span>920</span>
              </div>

              <div className="flex justify-between">
                <span>3. Anjali</span>
                <span>890</span>
              </div>
            </div>
          </div>

          {/* Trending Tests */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Trending Tests
            </h3>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                TCS NQT Mock Test
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                Python Interview Test
              </div>

              <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                DSA Placement Test
              </div>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}