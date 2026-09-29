"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PlanDay, StudyTarget } from "./types";

type TargetDialogProps = {
  open: boolean;
  initialTarget: StudyTarget;
  onClose: () => void;
  onSave: (target: StudyTarget) => void;
};

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function buildDsaPlan(
  date: string,
  dayNumber: number,
  hoursPerDay: number
): PlanDay {
  const studyMinutes = Math.round(hoursPerDay * 60);

  const plans = [
    {
      topic: "Arrays & Array Fundamentals",
      tasks: [
        "Learn array traversal, insertion, deletion and searching",
        "Understand time complexity of common array operations",
        "Solve Two Sum and Maximum Subarray",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Strings & Basic Problem Solving",
      tasks: [
        "Learn string traversal and character manipulation",
        "Practice frequency counting using HashMap",
        "Solve palindrome and anagram problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Hashing",
      tasks: [
        "Understand HashMap and HashSet",
        "Learn frequency-map based problem solving",
        "Solve Two Sum, Contains Duplicate and frequency problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Two Pointers",
      tasks: [
        "Understand the two-pointer technique",
        "Learn when to move left and right pointers",
        "Solve sorted-array and pair-sum problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Sliding Window",
      tasks: [
        "Understand fixed-size sliding window",
        "Learn variable-size sliding window",
        "Solve longest-substring and subarray problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Linked Lists",
      tasks: [
        "Learn singly linked-list structure",
        "Practice insertion, deletion and traversal",
        "Solve reverse linked list and middle-node problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Stacks & Queues",
      tasks: [
        "Understand stack and queue operations",
        "Learn monotonic-stack basics",
        "Solve valid parentheses and next-greater-element problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Trees",
      tasks: [
        "Understand binary-tree structure",
        "Learn preorder, inorder and postorder traversal",
        "Practice DFS and level-order traversal",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Graphs",
      tasks: [
        "Understand graph representation using adjacency lists",
        "Practice BFS and DFS",
        "Solve connected-components and cycle-detection problems",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
    {
      topic: "Revision & Problem Solving",
      tasks: [
        "Revise the topics covered so far",
        "Solve mixed DSA problems without looking at solutions",
        "Review mistakes and write down patterns learned",
        `Practice for ${studyMinutes} minutes`,
      ],
    },
  ];

  const plan = plans[(dayNumber - 1) % plans.length];

  return {
    date,
    topic: plan.topic,
    tasks: plan.tasks,
    completed: false,
  };
}

function buildGenericPlan(
  goal: string,
  date: string,
  dayNumber: number,
  hoursPerDay: number
): PlanDay {
  const studyMinutes = Math.round(hoursPerDay * 60);

  const phases = [
    "Understand the fundamentals",
    "Learn core concepts",
    "Study important patterns",
    "Practice basic problems",
    "Practice intermediate problems",
    "Review mistakes",
    "Revision and self-assessment",
  ];

  const phase = phases[(dayNumber - 1) % phases.length];

  return {
    date,
    topic: `${goal} — ${phase}`,
    tasks: [
      `Study the main concepts related to "${goal}"`,
      `Understand the important ideas behind ${phase.toLowerCase()}`,
      "Make short notes and identify areas that need revision",
      `Practice for ${studyMinutes} minutes`,
    ],
    completed: false,
  };
}

function buildPlanDays(
  goal: string,
  targetDate: string,
  hoursPerDay: number
): PlanDay[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(`${targetDate}T00:00:00`);

  if (end.getTime() < start.getTime()) {
    return [];
  }

  const difference =
    Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  // Generate the next 7 days, or fewer if the target is sooner.
  const numberOfDays = Math.min(7, Math.max(1, difference));

  const days: PlanDay[] = [];

  for (let i = 0; i < numberOfDays; i += 1) {
    const date = getLocalDate(addDays(start, i));
    const dayNumber = i + 1;

    const isDsa =
      goal.toLowerCase().includes("dsa") ||
      goal.toLowerCase().includes("data structure") ||
      goal.toLowerCase().includes("algorithm");

    days.push(
      isDsa
        ? buildDsaPlan(date, dayNumber, hoursPerDay)
        : buildGenericPlan(goal, date, dayNumber, hoursPerDay)
    );
  }

  return days;
}

export function TargetDialog({
  open,
  initialTarget,
  onClose,
  onSave,
}: TargetDialogProps) {
  const [target, setTarget] = useState(initialTarget);

  useEffect(() => {
    if (open) {
      setTarget(initialTarget);
    }
  }, [open, initialTarget]);

  if (!open) return null;

  function update(
    field: "goal" | "targetDate" | "hoursPerDay",
    value: string
  ) {
    setTarget((current) => ({
      ...current,
      [field]:
        field === "hoursPerDay" ? Number(value) : value,
    }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (
      !target.goal.trim() ||
      !target.targetDate ||
      target.hoursPerDay <= 0
    ) {
      return;
    }

    const goal = target.goal.trim();

    const planDays = buildPlanDays(
      goal,
      target.targetDate,
      target.hoursPerDay
    );

    onSave({
      ...target,
      goal,
      planDays,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="target-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Plan ahead
              </span>
            </div>

            <h2
              id="target-dialog-title"
              className="mt-2 text-xl font-bold text-slate-950"
            >
              Set your target
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close target form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="target-goal">
              Learning goal
            </Label>

            <Input
              id="target-goal"
              value={target.goal}
              onChange={(event) =>
                update("goal", event.target.value)
              }
              placeholder="e.g. Complete DSA foundations"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-date">
              Target date
            </Label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                id="target-date"
                type="date"
                value={target.targetDate}
                onChange={(event) =>
                  update("targetDate", event.target.value)
                }
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-hours">
              Available study time per day
            </Label>

            <div className="flex items-center gap-2">
              <Input
                id="target-hours"
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={target.hoursPerDay}
                onChange={(event) =>
                  update("hoursPerDay", event.target.value)
                }
                required
              />

              <span className="text-sm text-slate-500">
                hours
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-indigo-50 p-3 text-sm text-slate-600">
            Your plan will automatically generate tasks for
            today and the next 6 days based on your target.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              Generate Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}