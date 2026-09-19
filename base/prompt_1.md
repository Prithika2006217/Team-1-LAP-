System Role: You are an Expert Full-Stack Developer architecting a production-grade, high-concurrency Learning Assessment Placement System (LAP) named "Tenzorce."
Objective: Generate the foundational boilerplate for this application. This architecture must be explicitly designed to handle 1,000+ concurrent users without performance degradation. You must utilize advanced optimization techniques including aggressive Next.js edge caching, Node.js rate-limiting, Redis in-memory caching, and PostgreSQL connection pooling.
This codebase will be handed off to a team of junior developers, so the code must be modular, heavily commented, and strictly adhere to the defined tech stack.
1. Technology Stack & Scalability Architecture
Frontend (Hosted on Vercel): Next.js (App Router, React 18+).
Optimization Requirement: Heavy use of React Server Components (RSC) to minimize client-side bundle size. Implement dynamic imports (lazy loading) for heavy UI components (like charts or modals) and use SWR or React Query with stale-while-revalidate caching strategies for client fetches.
Backend API (Hosted on Render): Node.js, Express.js (TypeScript).
Optimization Requirement: Implement express-rate-limit to protect against DDoS/spam, use helmet for security, and structure the server to handle high-throughput async operations without blocking the Event Loop.
Database (Hosted on Neon DB) & Cache (Upstash Redis): Serverless PostgreSQL.
Optimization Requirement: Prisma ORM must utilize Neon's connection pooling (?pgbouncer=true or ?sslmode=require) to prevent connection limit exhaustion during concurrent exam loads. Include Redis implementation placeholders for caching high-frequency read operations (like fetching the active course catalog).
2. UI/UX & Styling Guidelines (Tenzorce Design System)
Adhere strictly to these visual constraints:
Colors: Use a deep indigo/purple as the primary brand color (e.g., bg-indigo-600). Backgrounds should be a soft off-white (e.g., bg-slate-50). Main content areas are white (bg-white).
Layout Structure: Implement a persistent Left Sidebar Navigation and a Top Header across all authenticated routes.
Sidebar Links: Dashboard, Study Space, Practice Arena, Assessment Center, Reports & Analytics, Settings.
Component Styling: Use clean, grid-based layouts with rounded-xl, subtle drop shadows (shadow-sm), and border-slate-100. Use Tailwind CSS; write classes fully (no arbitrary shorthand). Use shadcn/ui and lucide-react.
3. Required Deliverables & Implementation Steps
Generate the code for the following six phases, clearly separating the backend API code from the frontend UI code:
Phase 1: Environment Variables (.env.example)
Generate the .env.example files for both repositories.
Backend .env.example: Include DATABASE_URL (pooled for Neon), DIRECT_URL (direct for migrations), REDIS_URL (Upstash), JWT_SECRET, PORT (default 5000), and FRONTEND_URL.
Frontend .env.example: Include NEXT_PUBLIC_API_URL.
Phase 2: High-Performance Database Schema (Node.js Backend)
Write the prisma/schema.prisma file containing a User model with an Enum for Role (STUDENT, TRAINER, COLLEGE_TPO, SUPER_ADMIN).
Optimization Requirement: Add database-level indexes (@@index) on frequently queried fields like email and role to ensure read times remain under 10ms at scale.
Include standard fields: id, email, passwordHash, name, createdAt, updatedAt, isActive.
Phase 3: Optimized Node.js Express Server Setup (Node.js Backend)
Generate the foundational src/server.ts (or server.js) for the Render API.
Initialize Express.
Configure cors() dynamically for FRONTEND_URL.
Optimization Requirement: Implement a global Rate Limiter (e.g., max 100 requests per 15 minutes per IP).
Initialize Prisma Client and a dummy Redis client connection.
Set up placeholder routes for POST /api/auth/login and GET /api/study/modules.
Phase 4: Next.js Global Layouts (Next.js Frontend)
Generate the app/layout.tsx and app/dashboard/layout.tsx files.
Include a responsive <Sidebar/> component (fixed left) and a <Header/> component (fixed top).
Optimization Requirement: Ensure the layout is a Server Component where possible, passing only necessary state to Client Components to maximize initial page load speed on Vercel's Edge network.
Phase 5: Multi-Role Tabbed Login UI (Next.js Frontend)
Generate the code for app/(auth)/login/page.tsx.
Use shadcn/ui Tabs to create four distinct login modes: Student, Trainer, TPO, and Admin.
Optimization Requirement: Implement client-side form validation before hitting the Render API to reduce unnecessary server load.
Include a mock onSubmit handler that saves a dummy JWT token to cookies and redirects to /dashboard.
Phase 6: Edge-Optimized Route Protection Middleware (Next.js Frontend)
Generate the Next.js middleware.ts file.
Write lightweight edge-compatible logic that checks for the JWT cookie.
If a user accesses /dashboard without a token, redirect to /login.
If a logged-in user accesses /login, redirect to /dashboard.
