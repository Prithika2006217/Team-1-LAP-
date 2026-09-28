// Shared Practice Arena types (mirror the backend payloads).
export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionType =
  | "MCQ"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "PREDICT_OUTPUT"
  | "PSEUDOCODE"
  | "CODING";

export interface TestListItem {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  company: string | null;
  durationMinutes: number;
  questionCount: number;
  attempts: number;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  difficulty: Difficulty;
  options: QuestionOption[] | null;
  marks: number;
  negativeMarks: number;
  order: number;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  timeLimitMinutes: number | null;
  questions: Question[];
}

export interface TestBlueprint {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  sections: Section[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}

export interface StreakDay {
  label: string;
  date: string;
  completed: boolean;
}
