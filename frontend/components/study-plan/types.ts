export type StudyTask = {
  id: string;
  name: string;
  priority: "High" | "Medium" | "Low";
  minutes: number;
};

export type PlanDay = {
  date: string;
  topic: string;
  tasks: string[];
  completed: boolean;
};

export type StudyPlanDay = PlanDay;

export type StudyTarget = {
  goal: string;
  targetDate: string;
  hoursPerDay: number;
  planDays: PlanDay[];
};

export type Milestone = {
  id?: string;
  title: string;
  active?: boolean;
  complete?: boolean;
  completed?: boolean;
  description?: string;
  prerequisite?: string;
};