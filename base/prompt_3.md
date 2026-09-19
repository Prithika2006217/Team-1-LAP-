Phase 12: Practice Arena APIs (Node.js Backend)
Generate src/controllers/practice.controller.ts and src/routes/practice.routes.ts:
GET /api/practice/tests: Return list of available tests filtered by query params (category, difficulty). Use Prisma select to exclude answer keys and questions to keep payload small.
GET /api/practice/leaderboard: Return top 5 ranked users sorted by total points.
GET /api/practice/streak/:userId: Return user's 7-day activity completion boolean array ([true, true, false, ...]).
GET /api/practice/tests/:id: Return full test blueprint (sections, questions, options, time limit) without correct answer keys.
Phase 13: Practice Arena Page & Side Widgets (Next.js Frontend)
Generate app/dashboard/practice-arena/page.tsx:
Top Filter Ribbon: Scrollable badges (All Tests, Aptitude, Coding, DSA, Domain, Company Specific).
Recommended Tests Grid: Render cards showing company badges (e.g., TCS, Amazon), question count, duration, difficulty tag, and "Start Test" button.
Explore by Test Type Grid: Cards for MCQs, Multiple Select, True/False, Predict Output, Pseudocode, and Coding Practice.
Right Side-Panel Widgets:
QuickActions: Links for Bookmarks, Weak Areas, Custom Test.
TestStreak: Visual 7-day checkboxes (Mon–Sun) with active badges.
Leaderboard: Ranked list with avatars, names, and points.
TrendingTests: Compact list with attempt counts.
Phase 14: High-Concurrency Auto-Save & Grading Engine (Node.js Backend)
Generate src/controllers/exam.controller.ts and src/routes/exam.routes.ts:
POST /api/practice/autosave:
Accepts { userId, testId, questionId, selectedAnswer }.
Saves payload into Upstash Redis using a Hash key: exam:${testId}:${userId}.
Returns { status: "saved", timestamp } immediately without touching PostgreSQL.
POST /api/practice/submit:
Fetches stored answers from Upstash Redis (or request body fallback).
Fetches correct answer keys from Neon DB.
Calculates total score, correct/incorrect count, and percentage.
Executes a Prisma $transaction that:
Writes record to TestSubmission table in Neon DB.
Updates user points and streak in User table.
Deletes the temporary Redis exam key.
Returns the final score and results payload.
Phase 15: Live Test Runner Interface & Monaco Editor (Next.js Frontend)
Generate app/dashboard/practice-arena/[testId]/page.tsx:
Header: Test title, section tabs, "Proctored Exam" indicator, fullscreen toggle, and live countdown timer.
Countdown Timer Logic: Decrements every second; automatically triggers handleSubmitTest() when timer reaches 00:00:00.
Question Viewer: Supports both MCQ options (radio selection) and Programming 
questions.
Code Editor Component: Dynamically import @monaco-editor/react (SSR disabled) with language dropdown (Python, Java, C++), Dark/Light theme toggle, and "Run Code" placeholder button.
Question Palette Sidebar: Grid of question numbers color-coded by status (Answered: Green, Not Answered: Gray, Marked for Review: Orange).
Auto-Save Trigger: Trigger backend POST /api/practice/autosave whenever an option is selected or on code editor onChange (debounced by 2 seconds).
Phase 16: Sidebar Shell Routes (Next.js Frontend)
Generate boilerplate shell pages to ensure all remaining sidebar links render with standard headers, breadcrumbs, and empty-state placeholders:
app/dashboard/assessment-center/page.tsx (Proctored exams placeholder)
app/dashboard/results/page.tsx (Scorecards and analytics placeholder)
app/dashboard/my-progress/page.tsx (Detailed skill progression placeholder)
app/dashboard/profile/page.tsx (User profile details placeholder)
app/dashboard/settings/page.tsx (Platform and account preferences placeholder)


