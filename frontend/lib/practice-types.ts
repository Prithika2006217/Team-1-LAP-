// ---------------------------------------------------------------------------
// Practice Arena types
// ---------------------------------------------------------------------------

export type Difficulty =
  | "EASY"
  | "MEDIUM"
  | "HARD";

export type GeneratedDifficulty = "easy" | "medium" | "hard";

export interface GeneratedQuestion {
  id: string;
  difficulty: GeneratedDifficulty;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export type QuestionType =
  | "MCQ"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "PREDICT_OUTPUT"
  | "PSEUDOCODE"
  | "CODING";

// ---------------------------------------------------------------------------
// Test list
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Question
// ---------------------------------------------------------------------------

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;

  // Difficulty of the individual question.
  difficulty: Difficulty;

  prompt: string;

  options: QuestionOption[] | null;

  marks: number;

  negativeMarks: number;

  order: number;
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export interface Section {
  id: string;
  title: string;
  order: number;
  timeLimitMinutes: number | null;

  questions: Question[];
}

// ---------------------------------------------------------------------------
// Test
// ---------------------------------------------------------------------------

export interface TestBlueprint {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;

  sections: Section[];
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

export interface StreakDay {
  label: string;
  date: string;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Generated Practice Test
// ---------------------------------------------------------------------------

export interface GeneratedPracticeTest {
  testId: string;
  title: string;
  topic: string;

  totalQuestions: number;

  counts: {
    easy: number;
    medium: number;
    hard: number;
  };
}