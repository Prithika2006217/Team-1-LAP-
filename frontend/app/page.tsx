"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleGauge,
  ClipboardCheck,
  ListChecks,
  LockKeyhole,
  Menu,
  Play,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Swords,
  TrendingUp,
  UsersRound,
  X,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Structured Learning", description: "Clear paths that turn ambition into steady progress." },
  { icon: BrainCircuit, title: "Smart Practice", description: "AI-guided repetition that meets every learner where they are." },
  { icon: ShieldCheck, title: "Secure Assessments", description: "Trusted evaluation built for real outcomes at every scale." },
];

const spaces = [
  { icon: BookOpen, number: "01", title: "Study Space", description: "Build confident foundations with guided modules, resources, and progress that stays visible.", href: "/dashboard/study-space" },
  { icon: Swords, number: "02", title: "Practice Arena", description: "Turn theory into instinct with focused challenges, instant feedback, and healthy competition.", href: "/dashboard/practice-arena" },
  { icon: ClipboardCheck, number: "03", title: "Assessment Center", description: "Measure what matters with secure, insight-rich assessments that reflect real readiness.", href: "/dashboard/assessment-center" },
];

const benefits = [
  { icon: Sparkles, title: "AI-Powered", subtitle: "Insights" },
  { icon: LockKeyhole, title: "Granular Access", subtitle: "Control" },
  { icon: ServerCog, title: "Secure &", subtitle: "Reliable" },
  { icon: UsersRound, title: "Scalable", subtitle: "for All" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function scrollToSpaces() {
    document.getElementById("spaces")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  }

  return (
    <main className="overflow-hidden bg-background text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Tenzorce home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">T</span>
            <span className="text-xl font-bold tracking-tight text-slate-950">tenzorce</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <button type="button" onClick={scrollToSpaces} className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Product</button>
            <button type="button" onClick={scrollToSpaces} className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Solutions</button>
            <button type="button" onClick={scrollToSpaces} className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Pricing</button>
            <a href="mailto:hello@tenzorce.com" className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Contact</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-primary">Login</Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md">
              Get Started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="rounded-lg p-2 text-slate-700 hover:bg-indigo-50 hover:text-primary md:hidden" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-6 py-5 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <button type="button" onClick={scrollToSpaces} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-primary">Product</button>
              <button type="button" onClick={scrollToSpaces} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-primary">Solutions</button>
              <button type="button" onClick={scrollToSpaces} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-primary">Pricing</button>
              <a href="mailto:hello@tenzorce.com" className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-primary">Contact</a>
              <div className="mt-3 flex gap-3 border-t border-slate-100 pt-4">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700">Login</Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-white">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-20 lg:pt-16">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            The learning operating system
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Learn. Practice.
            <span className="block text-primary">Prove. Succeed.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Tenzorce is the AI-powered platform that helps institutions make learning measurable, practice purposeful, and assessment trusted.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="mailto:sales@tenzorce.com?subject=Book%20a%20Tenzorce%20demo" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md">Book a Demo <ArrowUpRight className="h-4 w-4" /></a>
            <button type="button" onClick={scrollToSpaces} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary">Explore Product <Play className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="relative min-h-[380px] lg:min-h-[430px]" aria-hidden="true">
          <div className="absolute inset-3 rounded-[2rem] border border-indigo-100 bg-indigo-50/50" />
          <div className="absolute inset-6 rounded-[1.5rem] bg-indigo-50/70" />
          <div className="absolute left-4 top-8 w-52 -rotate-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-indigo-100/70 sm:left-9">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Weekly progress</span><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
            <div className="mt-5 flex h-20 items-end gap-2">
              {[35, 52, 42, 68, 58, 82, 95].map((height, index) => <span key={index} className={`flex-1 rounded-t-md ${index === 6 ? "bg-primary" : "bg-indigo-100"}`} style={{ height: `${height}%` }} />)}
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">+28.4%</p>
          </div>
          <div className="absolute right-3 top-12 w-52 rotate-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-indigo-100/70 sm:right-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><CircleGauge className="h-4 w-4 text-primary" /> Completion rate</div>
            <div className="mt-4 flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-full border-[10px] border-indigo-100 border-t-primary text-lg font-bold text-slate-950">98%</div><span className="text-xs leading-5 text-slate-500">Learners on track this week</span></div>
          </div>
          <div className="absolute bottom-8 left-1/2 w-60 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-indigo-200/70 sm:bottom-5">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Today&apos;s focus</span><BarChart3 className="h-4 w-4 text-primary" /></div>
            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Algebra foundations</div><div className="flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> Aptitude assessment</div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white" aria-label="Platform features">
        <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-3 lg:px-8">
          {features.map(({ icon: Icon, title, description }, index) => <div key={title} className={`flex gap-4 py-7 lg:px-8 ${index !== 0 ? "border-t border-slate-100 lg:border-l lg:border-t-0" : "lg:pl-0"}`}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary"><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>)}
        </div>
      </section>

      <section id="spaces" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Built for momentum</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">One Platform. Three Powerful Spaces.</h2></div><p className="max-w-sm text-sm leading-6 text-slate-500">Every part of the learner journey, connected in one calm and capable workspace.</p></div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {spaces.map(({ icon: Icon, number, title, description, href }) => <article key={title} className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-primary"><Icon className="h-6 w-6" /></span><span className="text-sm font-bold text-slate-300">{number}</span></div><h3 className="mt-10 text-xl font-bold text-slate-950">{title}</h3><p className="mt-3 min-h-14 text-sm leading-6 text-slate-500">{description}</p><Link href={href} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Explore space <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></article>)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white" aria-label="Platform benefits">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {benefits.map(({ icon: Icon, title, subtitle }) => <div key={`${title}-${subtitle}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 shadow-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-primary"><Icon className="h-5 w-5" /></span><p className="text-sm font-semibold leading-5 text-slate-700">{title}<br /><span className="text-slate-500">{subtitle}</span></p></div>)}
        </div>
      </section>

      <section className="px-6 py-16 lg:px-8 lg:py-20"><div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-2xl border border-indigo-100 bg-white px-7 py-10 shadow-sm sm:px-12 lg:flex-row lg:items-center lg:justify-between lg:py-12"><div className="max-w-2xl"><h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Empower every student. Elevate every institution.</h2><p className="mt-4 max-w-xl leading-7 text-slate-500">Give your teams the clarity, tools, and confidence to make progress impossible to miss.</p></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row"><a href="mailto:sales@tenzorce.com?subject=Book%20a%20Tenzorce%20demo" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Book a Demo <ArrowUpRight className="h-4 w-4" /></a><a href="mailto:hello@tenzorce.com" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary/30 hover:text-primary">Contact Sales <ArrowRight className="h-4 w-4" /></a></div></div></section>

      <footer className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Tenzorce home">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">T</span>
              <span className="text-lg font-bold tracking-tight text-slate-950">tenzorce</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">Learning that moves with every student and every institution.</p>
          </div>
          <div><h3 className="text-sm font-semibold text-slate-950">Product</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><Link className="block hover:text-primary" href="/dashboard/study-space">Study Space</Link><Link className="block hover:text-primary" href="/dashboard/practice-arena">Practice Arena</Link><Link className="block hover:text-primary" href="/dashboard/assessment-center">Assessment Center</Link></div></div>
          <div><h3 className="text-sm font-semibold text-slate-950">Company</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><a className="block hover:text-primary" href="#spaces">About</a><a className="block hover:text-primary" href="mailto:hello@tenzorce.com">Contact</a><a className="block hover:text-primary" href="mailto:careers@tenzorce.com">Careers</a></div></div>
          <div><h3 className="text-sm font-semibold text-slate-950">Legal</h3><div className="mt-4 space-y-3 text-sm text-slate-500"><Link className="block hover:text-primary" href="/privacy-policy">Privacy Policy</Link><Link className="block hover:text-primary" href="/terms">Terms</Link></div></div>
        </div>
        <div className="border-t border-slate-200"><div className="mx-auto max-w-7xl px-6 py-5 text-xs text-slate-400 lg:px-8">&copy; 2026 Tenzorce. All rights reserved.</div></div>
      </footer>
    </main>
  );
}