Generate the code for the following five phases, clearly separating the backend API code from the frontend UI code:
Phase 7: Optimized Dashboard API (Node.js Backend)
Generate the src/controllers/dashboard.controller.ts and src/routes/dashboard.routes.ts files.
Write a GET /api/dashboard/stats endpoint.
Optimization Requirement: Do NOT fetch entire user rows. Use Prisma's aggregate and count functions to calculate total modules in progress, tests taken, and overall score directly at the database level.
Return a structured JSON payload for the frontend widgets.
Phase 8: Dashboard Analytics UI (Next.js Frontend)
Generate the app/dashboard/page.tsx file.
Build a dashboard matching the Tenzorce UI: Top stat cards (Modules, Tests, Upcoming Assessments, Points) and a "Continue Learning" widget.
Include a "Progress Overview" donut chart using the recharts library.
Optimization Requirement: Implement SWR (Stale-While-Revalidate) to fetch data from the dashboard API. Render loading skeletons (shadcn/ui Skeleton) while the Render API wakes up.
Phase 9: Study Space API (Node.js Backend)
Generate the src/controllers/study.controller.ts and src/routes/study.routes.ts files.
Write a GET /api/study/modules endpoint.
Optimization Requirement: Implement pagination (skip, take) and use Prisma's select payload to return only necessary fields (title, category, duration, progress_percentage). Do not send large text blocks (like video URLs or full descriptions) in the catalog payload to save bandwidth.
Phase 10: Study Space Catalog UI (Next.js Frontend)
Generate the app/dashboard/study-space/page.tsx file.
Build the Study Space layout with shadcn/ui Tabs for categories (All Modules, 
Programming, Data Structures, Aptitude).
Create a responsive CSS Grid displaying the Learning Paths/Course Cards.
Each card must feature a progress bar (shadcn/ui Progress) indicating completion percentage.
Optimization Requirement: Map over the data fetched via SWR. Ensure the category filtering is handled client-side to avoid unnecessary network requests for tab switching.
Phase 11: Redis In-Memory Cache Setup (Node.js Backend)
Generate the src/utils/redis.util.ts file.
Initialize an Upstash Redis client connection using ioredis or @upstash/redis.
Write two exported helper functions: saveExamStateToCache(userId, testId, answers) and getExamStateFromCache(userId, testId).
Optimization Requirement: Add extensive comments explaining to the junior developers that this Redis layer will be used to intercept live exam auto-saves every 10 seconds, protecting the Neon PostgreSQL database from write-overload.
