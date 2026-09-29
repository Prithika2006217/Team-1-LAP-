"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import type { AssessmentQuestion } from "@/components/study-plan/topic-learning-data";

const questionCache = new Map<string, AssessmentQuestion[]>();

export default function TestPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";

  const [questions, setQuestions] = useState<AssessmentQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!topic) return;
    let active = true;
    const cacheKey = topic.trim().toLowerCase();
    const cachedQuestions = questionCache.get(cacheKey);

    if (cachedQuestions) {
      setQuestions(cachedQuestions);
      return () => { active = false; };
    }

    setQuestions(null);
    setError(null);
    fetch(`${API_BASE}/api/study/assessment/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    })
      .then(async (response) => {
        const data = await response.json() as { questions?: AssessmentQuestion[]; message?: string };
        if (!response.ok || !Array.isArray(data.questions)) {
          throw new Error(data.message || "Unable to generate questions right now.");
        }
        return data.questions;
      })
      .then((generatedQuestions) => {
        if (!active) return;
        questionCache.set(cacheKey, generatedQuestions);
        setQuestions(generatedQuestions);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to generate questions right now.");
      });

    return () => { active = false; };
  }, [retryCount, topic]);

  function submit() {
    if (!questions) return;
    setScore(questions.reduce((total, question, index) => total + (answers[index] === question.correctAnswer ? 1 : 0), 0));
  }

  if (!topic) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-rose-600">No topic was provided for this assessment.</p>
        <Link href="/dashboard/study-space" className="mt-3 inline-block text-sm font-semibold text-primary">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-8">
      <div className="rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Assessment</p>
            <h1 className="mt-2 text-xl font-bold text-slate-950">{score === null ? `Test: ${topic}` : "Assessment complete"}</h1>
          </div>
          <Link href="/dashboard/study-space" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700">
            Back to Dashboard
          </Link>
        </div>

        {score !== null && questions ? (
          <ResultScreen score={score} questions={questions} answers={answers} />
        ) : (
          <TestContent
            topic={topic}
            questions={questions}
            error={error}
            answers={answers}
            onAnswer={(index, answer) => setAnswers((current) => ({ ...current, [index]: answer }))}
            onSubmit={submit}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}
      </div>
    </div>
  );
}

function QuestionItem({ question, index, answer, onAnswer }: { question: AssessmentQuestion; index: number; answer?: number; onAnswer: (answer: number) => void }) {
  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-900">{index + 1}. {question.question}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => (
          <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${answer === optionIndex ? "border-primary bg-indigo-50 text-slate-950" : "border-slate-100 text-slate-600 hover:border-slate-300"}`}>
            <input type="radio" name={`question-${index}`} checked={answer === optionIndex} onChange={() => onAnswer(optionIndex)} className="accent-indigo-600" />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ResultScreen({ score, questions, answers }: { score: number; questions: AssessmentQuestion[]; answers: Record<number, number> }) {
  const percentage = Math.round((score / questions.length) * 100);
  return (
    <div className="p-6">
      <div className="rounded-lg bg-indigo-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-3 text-2xl font-bold text-slate-950">You scored {score} out of {questions.length}</p>
        <p className="mt-1 text-sm text-slate-600">That&apos;s {percentage}%</p>
      </div>
      <div className="mt-5 max-h-[45vh] space-y-2 overflow-y-auto">
        {questions.map((question, index) => {
          const correct = answers[index] === question.correctAnswer;
          return (
            <div key={question.question} className="flex items-start gap-2 rounded-lg border border-slate-100 p-3 text-sm">
              <span className={correct ? "text-emerald-600" : "text-rose-500"}>
                {correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              </span>
              <span>{index + 1}. {correct ? "Correct" : `Incorrect. Answer: ${question.options[question.correctAnswer]}`}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex justify-end">
        <Link href="/dashboard/study-space"><Button type="button">Back to Dashboard</Button></Link>
      </div>
    </div>
  );
}

function TestContent({ topic, questions, error, answers, onAnswer, onSubmit, onRetry }: { topic: string; questions: AssessmentQuestion[] | null; error: string | null; answers: Record<number, number>; onAnswer: (index: number, answer: number) => void; onSubmit: () => void; onRetry: () => void }) {
  if (error) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-rose-600">{error}</p>
        <Button type="button" onClick={onRetry}>Retry</Button>
      </div>
    );
  }

  if (!questions) {
    return <div className="p-6"><p className="text-sm text-slate-500">Generating your test on {topic}...</p></div>;
  }

  return (
    <div className="space-y-5 p-6">
      <p className="text-sm text-slate-500">Select one answer for each question. You can submit early.</p>
      <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-2">
        {questions.map((question, index) => (
          <QuestionItem key={`${index}-${question.question}`} question={question} index={index} answer={answers[index]} onAnswer={(answer) => onAnswer(index, answer)} />
        ))}
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="button" onClick={onSubmit}>Submit Test</Button>
      </div>
    </div>
  );
}