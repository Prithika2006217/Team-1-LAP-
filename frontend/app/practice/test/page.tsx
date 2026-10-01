"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Loader2, RefreshCw, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuestionTimer } from "@/hooks/use-question-timer";
import type { GeneratedDifficulty, GeneratedQuestion } from "@/lib/practice-types";

type Filter = GeneratedDifficulty;
type QuestionStatus = "unanswered" | "answered" | "expired";

type QuestionProgress = {
  selectedIndex?: number;
  status: QuestionStatus;
  startedAt?: number;
  timeTakenSec?: number;
};

type StoredTest = {
  topic: string;
  questions: GeneratedQuestion[];
  questionStates: Record<string, QuestionProgress>;
  filter: Filter;
  currentIndex: number;
};

const filters: Array<{ value: Filter; label: string; color: string; active: string }> = [
  { value: "easy", label: "Easy", color: "text-emerald-700", active: "border-emerald-500 bg-emerald-50" },
  { value: "medium", label: "Medium", color: "text-amber-700", active: "border-amber-500 bg-amber-50" },
  { value: "hard", label: "Hard", color: "text-red-700", active: "border-red-500 bg-red-50" },
];

function getQuestionKey(difficulty: Filter, index: number) {
  return `${difficulty}-${index}`;
}

export default function PracticeTestPage() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionProgress>>({});
  const [filter, setFilter] = useState<Filter>("easy");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resultVisible, setResultVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const expiryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizedTopic = topic.trim().toLowerCase().replace(/\s+/g, " ");
  const cacheKey = normalizedTopic ? `tenzorce_test_${normalizedTopic}` : "";

  const filteredQuestions = useMemo(
    () => questions.filter((question) => question.difficulty === filter),
    [filter, questions]
  );
  const currentQuestion = filteredQuestions[currentIndex];
  const currentQuestionKey = getQuestionKey(filter, currentIndex);
  const currentState = useMemo<QuestionProgress>(
    () => questionStates[currentQuestionKey] ?? { status: "unanswered" },
    [currentQuestionKey, questionStates]
  );

  const saveCache = useCallback((nextStates: Record<string, QuestionProgress>, nextFilter = filter, nextIndex = currentIndex) => {
    if (!cacheKey || questions.length !== 90) return;
    const payload: StoredTest = {
      topic,
      questions,
      questionStates: nextStates,
      filter: nextFilter,
      currentIndex: nextIndex,
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  }, [cacheKey, currentIndex, filter, questions, topic]);

  const loadTest = useCallback(async (force = false) => {
    if (!normalizedTopic || !cacheKey) return;
    setLoading(true);
    setError("");
    setResultVisible(false);
    setReviewVisible(false);

    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const stored = JSON.parse(cached) as Partial<StoredTest>;
          if (stored.questions?.length === 90) {
            setQuestions(stored.questions);
            setQuestionStates(stored.questionStates ?? {});
            setFilter(stored.filter ?? "easy");
            setCurrentIndex(stored.currentIndex ?? 0);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }
    }

    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      let data: { questions?: GeneratedQuestion[]; error?: string };
      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }
      if (!response.ok) throw new Error(data.error || "Failed to generate test");
      if (!data.questions || data.questions.length !== 90) {
        throw new Error("The server did not return exactly 90 questions.");
      }
      setQuestions(data.questions);
      setQuestionStates({});
      setFilter("easy");
      setCurrentIndex(0);
    } catch (loadError) {
      console.error("Practice test load failed:", loadError);
      setError(loadError instanceof Error ? loadError.message : "Failed to generate test");
    } finally {
      setLoading(false);
    }
  }, [cacheKey, normalizedTopic, topic]);

  useEffect(() => {
    const queryTopic = new URLSearchParams(window.location.search).get("topic")?.trim() ?? "";
    setTopic(queryTopic);
  }, []);

  useEffect(() => {
    if (normalizedTopic) void loadTest();
    else if (topic === "") setLoading(false);
  }, [loadTest, normalizedTopic, topic]);

  useEffect(() => {
    if (questions.length === 90 && cacheKey) {
      saveCache(questionStates);
    }
  }, [cacheKey, questions.length, questionStates, saveCache]);

  useEffect(() => {
    if (!currentQuestion || currentState.status !== "unanswered" || currentState.startedAt) {
      return;
    }

    const startedAt = Date.now();
    setQuestionStates((previous) => {
      const existing = previous[currentQuestionKey];
      if (existing?.startedAt || existing?.status === "answered" || existing?.status === "expired") {
        return previous;
      }
      return {
        ...previous,
        [currentQuestionKey]: { ...existing, status: "unanswered", startedAt },
      };
    });
  }, [currentQuestion, currentQuestionKey, currentState.startedAt, currentState.status]);

  const advance = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, filteredQuestions.length - 1));
  }, [filteredQuestions.length]);

  const handleExpire = useCallback(() => {
    setQuestionStates((previous) => {
      const existing = previous[currentQuestionKey];
      if (!existing || existing.status !== "unanswered") return previous;
      return { ...previous, [currentQuestionKey]: { ...existing, status: "expired", timeTakenSec: 60 } };
    });
    if (expiryTimeout.current) clearTimeout(expiryTimeout.current);
    expiryTimeout.current = setTimeout(advance, 2000);
  }, [advance, currentQuestionKey]);

  useEffect(() => () => {
    if (expiryTimeout.current) clearTimeout(expiryTimeout.current);
  }, [currentQuestionKey]);

  const timer = useQuestionTimer(
    currentState.status === "unanswered" ? currentState.startedAt ?? null : null,
    60,
    handleExpire
  );

  const chooseAnswer = (selectedIndex: number) => {
    if (!currentQuestion || currentState.status !== "unanswered") return;
    const timeTakenSec = currentState.startedAt
      ? Math.min(60, Math.floor((Date.now() - currentState.startedAt) / 1000))
      : 0;
    setQuestionStates((previous) => ({
      ...previous,
      [currentQuestionKey]: { ...previous[currentQuestionKey], selectedIndex, status: "answered", timeTakenSec },
    }));
  };

  const selectFilter = (nextFilter: Filter) => {
    setFilter(nextFilter);
    setCurrentIndex(0);
  };

  const clearAndRegenerate = () => {
    if (cacheKey) localStorage.removeItem(cacheKey);
    void loadTest(true);
  };

  const resetProgress = () => {
    setQuestionStates({});
    setFilter("easy");
    setCurrentIndex(0);
    setResultVisible(false);
    setReviewVisible(false);
  };

  const results = useMemo(() => {
    const byDifficulty = filters.map(({ value, label }) => {
      const group = questions.filter((question) => question.difficulty === value);
      const correct = group.filter((question, index) => questionStates[getQuestionKey(value, index)]?.selectedIndex === question.correctIndex).length;
      return { value, label, correct, total: group.length };
    });
    const keyedQuestions = questions.map((question, index) => ({ question, key: getQuestionKey(question.difficulty, questions.filter((item) => item.difficulty === question.difficulty).indexOf(question)) }));
    const answered = keyedQuestions.filter(({ key }) => questionStates[key]?.status === "answered");
    const completed = keyedQuestions.filter(({ key }) => ["answered", "expired"].includes(questionStates[key]?.status ?? ""));
    const correct = keyedQuestions.filter(({ question, key }) => questionStates[key]?.selectedIndex === question.correctIndex).length;
    const expired = keyedQuestions.filter(({ key }) => questionStates[key]?.status === "expired").length;
    const unanswered = keyedQuestions.filter(({ key }) => !questionStates[key] || questionStates[key].status === "unanswered").length;
    const totalTime = completed.reduce((sum, { key }) => sum + (questionStates[key]?.timeTakenSec ?? 0), 0);
    return {
      byDifficulty,
      correct,
      accuracy: questions.length ? Math.round((correct / questions.length) * 100) : 0,
      averageTime: completed.length ? Math.round(totalTime / completed.length) : 0,
      answered: answered.length,
      expired,
      unanswered,
    };
  }, [questionStates, questions]);

  if (!topic) return <ErrorState message="No topic was provided." onRetry={() => window.close()} />;
  if (loading) return <LoadingState topic={topic} />;
  if (error) return <ErrorState message={error} onRetry={() => void loadTest(true)} />;
  if (resultVisible) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm text-slate-500">Practice results</p><h1 className="text-2xl font-bold text-slate-900">{topic}</h1></div>
          <Button variant="outline" onClick={resetProgress}><RotateCcw className="h-4 w-4" /> Practice again</Button>
        </header>
        <Card><CardContent className="grid gap-4 p-6 sm:grid-cols-4"><Metric label="Overall score" value={`${results.correct} / 90`} /><Metric label="Accuracy" value={`${results.accuracy}%`} /><Metric label="Average time" value={`${results.averageTime}s`} /><Metric label="Answered" value={`${results.answered} / 90`} /></CardContent></Card>
        <div className="grid gap-4 md:grid-cols-3">{results.byDifficulty.map((item) => <Card key={item.value}><CardContent className="p-5"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{item.correct} / {item.total}</p></CardContent></Card>)}</div>
        <Card><CardContent className="space-y-2 p-6 text-sm text-slate-600"><p>Unanswered: <strong>{results.unanswered}</strong></p><p>Expired: <strong>{results.expired}</strong></p><Button variant="outline" onClick={() => setReviewVisible((visible) => !visible)}>{reviewVisible ? "Hide review" : "Review answers"}</Button>{reviewVisible && <ReviewList questions={questions} states={questionStates} />}</CardContent></Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div><p className="text-sm text-slate-500">AI Practice Test</p><h1 className="text-xl font-bold text-slate-900">{topic}</h1></div>
        <div className="flex flex-wrap items-center gap-2"><span className="text-sm text-slate-500">Progress {results.answered} / 90</span><Button variant="outline" size="sm" onClick={clearAndRegenerate}><RefreshCw className="h-4 w-4" /> Regenerate</Button><Button size="sm" onClick={() => setResultVisible(true)}>Submit Test</Button></div>
      </header>

      <div className="grid gap-2 sm:grid-cols-3">{filters.map((item) => <button key={item.value} type="button" onClick={() => selectFilter(item.value)} className={`rounded-xl border p-3 text-left transition ${filter === item.value ? item.active : "border-slate-200 bg-white hover:border-slate-300"}`}><span className={`text-sm font-semibold ${item.color}`}>{item.label}</span><span className="mt-1 block text-xs text-slate-500">{questions.filter((question) => question.difficulty === item.value).length} questions</span></button>)}</div>

      {currentQuestion && <div className="grid gap-5 lg:grid-cols-[1fr_17rem]">
        <Card><CardContent className="space-y-5 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">Question {currentIndex + 1} of {filteredQuestions.length}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${filter === "easy" ? "bg-emerald-50 text-emerald-700" : filter === "medium" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{filter}</span></div>
          <div><div className="mb-2 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatTime(currentState.status === "unanswered" ? timer.remaining : currentState.timeTakenSec ?? 0)}</span><span>{currentState.status === "unanswered" ? `${timer.remaining}s remaining` : `${currentState.timeTakenSec ?? 0}s taken`}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full transition-[width] ${(currentState.status === "unanswered" ? timer.remaining : 0) <= 10 ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${currentState.status === "unanswered" ? timer.progress : 0}%` }} /></div></div>
          <h2 className="text-lg font-semibold leading-7 text-slate-900">{currentQuestion.question}</h2>
          <div className="space-y-2">{currentQuestion.options.map((option, index) => { const selected = currentState.selectedIndex === index; const correct = currentQuestion.correctIndex === index; const locked = currentState.status !== "unanswered"; return <button key={option} type="button" disabled={locked} onClick={() => chooseAnswer(index)} className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition ${selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"} ${locked && correct ? "border-emerald-500 bg-emerald-50" : ""}`}><span className="font-semibold text-slate-500">{String.fromCharCode(65 + index)}</span><span className="text-slate-700">{option}</span></button>; })}</div>
          {currentState?.status !== "unanswered" && <div className={`rounded-lg border p-4 text-sm ${currentState.status === "answered" && currentState.selectedIndex === currentQuestion.correctIndex ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}><p className="flex items-center gap-2 font-semibold">{currentState.status === "answered" && currentState.selectedIndex === currentQuestion.correctIndex ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {currentState.status === "expired" ? "Time expired" : currentState.selectedIndex === currentQuestion.correctIndex ? "Correct" : "Incorrect"}</p><p className="mt-1">{currentQuestion.explanation}</p></div>}
          <div className="flex justify-between gap-3"><Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}><ChevronLeft className="h-4 w-4" /> Previous</Button>{currentIndex === filteredQuestions.length - 1 ? <Button onClick={() => setResultVisible(true)}>Finish</Button> : <Button onClick={advance}>Next <ChevronRight className="h-4 w-4" /></Button>}</div>
        </CardContent></Card>
        <Navigator difficulty={filter} questions={filteredQuestions} states={questionStates} currentIndex={currentIndex} onSelect={setCurrentIndex} />
      </div>}
    </main>
  );
}

function Navigator({ difficulty, questions, states, currentIndex, onSelect }: { difficulty: Filter; questions: GeneratedQuestion[]; states: Record<string, QuestionProgress>; currentIndex: number; onSelect: (index: number) => void }) {
  return <Card><CardContent className="p-4"><p className="mb-3 text-sm font-semibold text-slate-900">Question navigator</p><div className="grid grid-cols-6 gap-2 sm:grid-cols-5">{questions.map((question, index) => { const state = states[getQuestionKey(difficulty, index)]; const current = index === currentIndex; const color = current ? "border-blue-600 bg-blue-600 text-white" : state?.status === "answered" ? "border-emerald-300 bg-emerald-100 text-emerald-700" : state?.status === "expired" ? "border-red-300 bg-red-100 text-red-700" : "border-slate-200 bg-slate-50 text-slate-500"; return <button key={question.id} type="button" onClick={() => onSelect(index)} className={`h-9 rounded-md border text-xs font-semibold ${color}`}>{index + 1}</button>; })}</div></CardContent></Card>;
}

function ReviewList({ questions, states }: { questions: GeneratedQuestion[]; states: Record<string, QuestionProgress> }) {
  return <div className="mt-4 space-y-3">{questions.map((question, index) => <div key={question.id} className="border-t border-slate-100 pt-3"><p className="font-medium text-slate-800">{index + 1}. {question.question}</p><p className="mt-1 text-xs text-slate-500">Your answer: {states[question.id]?.selectedIndex === undefined ? "Unanswered" : String.fromCharCode(65 + (states[question.id]?.selectedIndex ?? 0))} · Correct: {String.fromCharCode(65 + question.correctIndex)}</p></div>)}</div>;
}

function LoadingState({ topic }: { topic: string }) { return <main className="flex min-h-screen items-center justify-center p-6"><Card className="w-full max-w-md"><CardContent className="p-8 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /><h1 className="mt-4 text-xl font-bold text-slate-900">Generating 90 questions on {topic}...</h1><p className="mt-2 text-sm text-slate-500">This may take a little while.</p></CardContent></Card></main>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <main className="flex min-h-screen items-center justify-center p-6"><Card className="w-full max-w-md"><CardContent className="p-8 text-center"><XCircle className="mx-auto h-8 w-8 text-red-500" /><h1 className="mt-4 text-lg font-bold text-slate-900">Unable to load this test</h1><p className="mt-2 text-sm text-red-600">{message}</p><Button className="mt-5" onClick={onRetry}>Retry</Button></CardContent></Card></main>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>; }
function formatTime(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
