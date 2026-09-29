"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";

type CourseLesson = {
  title: string;
  level: "Beginner" | "Intermediate";
  content: string;
  keyPoints: string[];
  codeExample?: string;
  quizCheck: { question: string; answer: string };
};

type Course = { topic: string; lessons: CourseLesson[] };
const courseCache = new Map<string, Course>();

export default function LearnPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic")?.trim() || "";
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [answerVisible, setAnswerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!topic) return;
    const cacheKey = topic.toLowerCase();
    const cached = courseCache.get(cacheKey);
    if (cached) {
      setCourse(cached);
      return;
    }

    let active = true;
    setCourse(null);
    setError(null);
    fetch(`${API_BASE}/api/study/course/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then(async (response) => {
        const data = await response.json() as Course & { message?: string };
        if (!response.ok || !Array.isArray(data.lessons) || data.lessons.length !== 8) {
          throw new Error(data.message || "Unable to build this course right now.");
        }
        return data;
      })
      .then((generatedCourse) => {
        if (!active) return;
        courseCache.set(cacheKey, generatedCourse);
        setCourse(generatedCourse);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to build this course right now.");
      });

    return () => { active = false; };
  }, [retryCount, topic]);

  function selectLesson(index: number) {
    setCurrentLesson(index);
    setAnswerVisible(false);
  }

  function markComplete() {
    setCompleted((current) => {
      const next = new Set(current);
      next.add(currentLesson);
      return next;
    });
  }

  if (!topic) {
    return <EmptyState message="Choose a topic to start learning." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <p className="text-sm text-rose-600">{error}</p>
        <Button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try Again</Button>
      </div>
    );
  }

  if (!course) {
    return <div className="mx-auto max-w-3xl p-6"><p className="text-sm text-slate-500">Building your complete course on {topic}...</p></div>;
  }

  const lesson = course.lessons[currentLesson];
  const isFirst = currentLesson === 0;
  const isLast = currentLesson === course.lessons.length - 1;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
        <Link href="/dashboard/study-space" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Link>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Mini-course</p>
        <h1 className="mt-2 line-clamp-3 text-lg font-bold text-slate-950">{course.topic}</h1>
        <p className="mt-2 text-xs text-slate-500">{completed.size} of {course.lessons.length} lessons complete</p>
        <nav className="mt-5 space-y-1" aria-label="Course lessons">
          {course.lessons.map((item, index) => (
            <button key={`${index}-${item.title}`} type="button" onClick={() => selectLesson(index)} className={`flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${currentLesson === index ? "bg-indigo-50 font-semibold text-primary" : "text-slate-600 hover:bg-slate-50"}`}>
              {completed.has(index) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <span className="mt-0.5 w-4 shrink-0 text-center text-xs text-slate-400">{index + 1}</span>}
              <span className="line-clamp-2">{item.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500"><span>Lesson {currentLesson + 1} of {course.lessons.length}</span><Badge variant={lesson.level === "Beginner" ? "easy" : "medium"}>{lesson.level}</Badge></div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{lesson.title}</h2>
        </div>

        <div className="space-y-7 p-6 sm:p-8">
          <article className="space-y-5 text-[1.02rem] leading-8 text-slate-700">
            {lesson.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)}
          </article>

          <section className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5" aria-labelledby="takeaways-title">
            <h3 id="takeaways-title" className="font-semibold text-slate-950">Key Takeaways</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">{lesson.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
          </section>

          {lesson.codeExample && <section aria-labelledby="code-title"><h3 id="code-title" className="mb-3 font-semibold text-slate-950">Code Example</h3><pre className="overflow-x-auto rounded-xl bg-slate-950 p-5 text-sm leading-6 text-slate-100"><code>{lesson.codeExample}</code></pre></section>}

          <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5" aria-labelledby="quick-check-title">
            <div className="flex items-center gap-2"><CircleHelp className="h-5 w-5 text-amber-600" /><h3 id="quick-check-title" className="font-semibold text-slate-950">Quick Check</h3></div>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-800">{lesson.quizCheck.question}</p>
            {answerVisible && <p className="mt-3 border-t border-amber-200 pt-3 text-sm leading-6 text-slate-700"><span className="font-semibold text-slate-950">Answer:</span> {lesson.quizCheck.answer}</p>}
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setAnswerVisible((visible) => !visible)}>{answerVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{answerVisible ? "Hide Answer" : "Reveal Answer"}</Button>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" disabled={isFirst} onClick={() => selectLesson(currentLesson - 1)}><ChevronLeft className="h-4 w-4" />Previous Lesson</Button>
            <Button type="button" variant={completed.has(currentLesson) ? "outline" : "default"} onClick={markComplete}>{completed.has(currentLesson) ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Check className="h-4 w-4" />}{completed.has(currentLesson) ? "Completed" : "Mark as Complete"}</Button>
            <Button type="button" disabled={isLast} onClick={() => selectLesson(currentLesson + 1)}>Next Lesson<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="mx-auto max-w-3xl space-y-3 p-6"><p className="text-sm text-slate-500">{message}</p><Link href="/dashboard/study-space" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Back to Dashboard<ArrowRight className="h-4 w-4" /></Link></div>;
}
