"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Flag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEditor } from "@/components/practice/code-editor";
import { fetcher, postJSON, getCurrentUserId } from "@/lib/api";
import type { TestBlueprint, Question } from "@/lib/practice-types";
import Link from "next/link";

const TEST_ID = "tcs-nqt-2020-numerical";

export default function TCSNQT2020NumericalPage() {
  const router = useRouter();
  const userId = getCurrentUserId();

  const { data, isLoading } = useSWR<{ test: TestBlueprint }>(
    `/api/practice/tests/${TEST_ID}`,
    fetcher
  );
  const test = data?.test;

  // Flatten questions for navigation; keep section grouping for the palette.
  const flat = useMemo(
    () => (test ? test.sections.flatMap((s) => s.questions) : []),
    [test]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    submissionId: string;
    score: number;
    correctCount: number;
    incorrectCount: number;
    percentage: number;
    totalQuestions: number;
  } | null>(null);

  // Initialise current question + timer once the blueprint arrives.
  useEffect(() => {
    if (test) {
      setSecondsLeft((prev) => prev ?? test.durationMinutes * 60);
      setCurrentId((prev) => prev ?? test.sections[0]?.questions[0]?.id ?? null);
    }
  }, [test]);

  const current: Question | undefined = flat.find((q) => q.id === currentId);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleMark(questionId: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  }

  // --- Submit ---------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!userId) {
      setSubmissionError("Please log in to submit your answers.");
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);
    try {
      console.log("Submitting:", { userId, testId: TEST_ID, answerCount: Object.keys(answers).length });
      const res = await postJSON<{ status: string; result?: any }>(
        "/api/practice/submit",
        { userId, testId: TEST_ID, answers }
      );
      console.log("Response:", res);
      if (res.result) {
        setResult(res.result);
      } else {
        setSubmissionError("Submission succeeded but no result returned.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setSubmissionError(`Failed to submit: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, userId, answers]);

  // --- Countdown ------------------------------------------------------------
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, handleSubmit]);

  if (isLoading || !test) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Success icon */}
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900">Test Submitted Successfully</h1>
                <p className="text-slate-600">{test.title}</p>

                {/* Percentage */}
                <div className="text-6xl font-bold text-primary">
                  {result.percentage.toFixed(2)}%
                </div>

                {/* Score */}
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">Score</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {result.score} / {result.totalQuestions}
                  </p>
                </div>

                {/* Correct / Incorrect cards */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-green-700 mb-1">Correct Answers</p>
                      <p className="text-3xl font-bold text-green-600">{result.correctCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-red-700 mb-1">Incorrect Answers</p>
                      <p className="text-3xl font-bold text-red-600">{result.incorrectCount}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Back button */}
                <div className="pt-4">
                  <Button onClick={() => router.push("/dashboard/assessment-center")} size="lg">
                    Back to Assessment Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/assessment-center">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{test.title}</h1>
            <div className="mt-1 flex gap-1">
              {test.sections.map((s) => (
                <span key={s.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-slate-600">
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-red-50 px-3 py-1.5 font-mono text-sm font-bold text-red-600">
            {formatTime(secondsLeft ?? 0)}
          </span>
        </div>
      </div>

      {/* Submission error */}
      {submissionError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">{submissionError}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_18rem]">
        {/* Question viewer */}
        <Card>
          <CardContent className="space-y-4 p-6">
            {current && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    Question {flat.indexOf(current) + 1} of {flat.length}
                  </span>
                  <button
                    onClick={() => toggleMark(current.id)}
                    className={
                      "flex items-center gap-1 rounded-lg border px-3 py-1 text-sm " +
                      (marked.has(current.id)
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-slate-200 text-slate-600")
                    }
                  >
                    <Flag className="h-4 w-4" /> Mark for Review
                  </button>
                </div>

                <p className="text-slate-900">{current.prompt}</p>

                {/* Choice question */}
                {current.options && (
                  <div className="space-y-2">
                    {current.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm " +
                          (answers[current.id] === opt.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:bg-slate-50")
                        }
                      >
                        <input
                          type="radio"
                          name={current.id}
                          checked={answers[current.id] === opt.id}
                          onChange={() => setAnswer(current.id, opt.id)}
                        />
                        <span className="font-medium text-slate-700">{opt.label}.</span>
                        <span className="text-slate-700">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Coding question */}
                {(current.type === "CODING" || current.type === "PSEUDOCODE") && (
                  <CodeEditor
                    value={answers[current.id] ?? "# Write your code here\n"}
                    onChange={(v) => setAnswer(current.id, v)}
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    disabled={flat.indexOf(current) === 0}
                    onClick={() => setCurrentId(flat[flat.indexOf(current) - 1].id)}
                  >
                    Previous
                  </Button>
                  {flat.indexOf(current) < flat.length - 1 ? (
                    <Button onClick={() => setCurrentId(flat[flat.indexOf(current) + 1].id)}>
                      Save &amp; Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Test"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Question palette */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <p className="text-sm font-semibold text-slate-900">Question Palette</p>
              {test.sections.map((s) => (
                <div key={s.id}>
                  <p className="mb-2 text-xs font-medium text-slate-500">{s.title}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {s.questions.map((q) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== "";
                      const isMarked = marked.has(q.id);
                      const cls = isMarked
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : answered
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-slate-100 text-slate-500 border-slate-200";
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentId(q.id)}
                          className={
                            "h-9 rounded-md border text-sm font-medium " +
                            cls +
                            (currentId === q.id ? " ring-2 ring-primary" : "")
                          }
                        >
                          {flat.indexOf(q) + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <Legend color="bg-emerald-100" label="Answered" />
                <Legend color="bg-slate-100" label="Not Answered" />
                <Legend color="bg-amber-100" label="Marked for Review" />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" variant="outline" onClick={handleSubmit} disabled={submitting}>
            End Test
          </Button>
        </aside>
      </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={"h-3 w-3 rounded " + color} />
      {label}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
