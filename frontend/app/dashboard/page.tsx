"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  FileText,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
  Play,
  Plus,
  AlertCircle,
  Zap,
  Flame,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LearningOverviewDialog = dynamic(
  () => import("@/components/dashboard/learning-overview-dialog").then(mod => ({ default: mod.LearningOverviewDialog })),
  {
    ssr: false,
    loading: () => null
  }
);

// Mock data types
interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
}

interface LearningModule {
  id: string;
  title: string;
  category: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
}

interface UpcomingAssessment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  duration: string;
  status: "upcoming" | "tomorrow" | "today";
}

interface RecentActivity {
  id: string;
  type: "test" | "module" | "practice";
  title: string;
  time: string;
  score?: string;
}

interface AttentionItem {
  id: string;
  title: string;
  urgency: string;
  subtitle: string;
}

interface Recommendation {
  id: string;
  title: string;
  reason: string;
  action: string;
  type: "practice" | "learn" | "quiz";
}

interface PerformanceData {
  week: string;
  score: number;
}

interface LearningStreak {
  current: number;
  weekly: boolean[];
}

// Empty state data (will be replaced with real API data when backend is ready)
const emptyStats: StatCard[] = [
  {
    title: "Modules in Progress",
    value: "0",
    subtitle: "Start learning today",
    icon: <BookOpen className="h-5 w-5 text-primary" />,
  },
  {
    title: "Practice Tests Taken",
    value: "0",
    subtitle: "Begin practicing now",
    icon: <FileText className="h-5 w-5 text-primary" />,
  },
  {
    title: "Upcoming Assessments",
    value: "0",
    subtitle: "No assessments scheduled",
    icon: <Calendar className="h-5 w-5 text-primary" />,
  },
  {
    title: "Points",
    value: "0",
    subtitle: "Start earning points",
    icon: <Award className="h-5 w-5 text-primary" />,
  }
];

const emptyRecentActivities: RecentActivity[] = [];
const emptyUpcomingAssessments: UpcomingAssessment[] = [];

// Empty state data (will be populated from API when backend is ready)
const attentionItems: AttentionItem[] = [];

const recommendations: Recommendation[] = [];

const performanceData: PerformanceData[] = [];

// Overall progress data (will be populated from API when backend is ready)
const overallProgress = 0; // 0-100, represents combined learning/practice/assessment/consistency progress

// Learning streak data (will be populated from API when backend is ready)
const learningStreak: LearningStreak = {
  current: 0,
  weekly: [false, false, false, false, false, false, false] // M T W T F S S
};

// Weekly progress data (will be populated from API when backend is ready)
const weeklyProgress = [
  { day: "Mon", hours: 0 },
  { day: "Tue", hours: 0 },
  { day: "Wed", hours: 0 },
  { day: "Thu", hours: 0 },
  { day: "Fri", hours: 0 },
  { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 }
];

const maxHours = 1; // Avoid division by zero

// Get user name from cookie/localStorage (mock auth - replace with real auth when ready)
function getUserName(): string {
  if (typeof window === "undefined") return "User";
  
  // Try to get from localStorage first
  const localName = localStorage.getItem("userName");
  if (localName) return localName;
  
  // Try to get from cookie
  const match = document.cookie.match(/(?:^|;\s*)userName=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  
  // Fallback to generic name
  return "User";
}

export default function DashboardPage() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  });

  const [userName, setUserName] = useState("User");
  const [overviewOpen, setOverviewOpen] = useState(false);

  useEffect(() => {
    setUserName(getUserName());
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Let's continue your learning journey.
          </p>
        </div>

        {/* Learning Streak Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 border border-orange-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
            <Flame className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-lg font-bold text-orange-600">{learningStreak.current}</span>
        </div>
      </div>

      {/* Top Row: Your Overview + Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Column: Overall Progress + Statistics Cards */}
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3 lg:grid-rows-2" style={{ gridTemplateColumns: '180px 1fr 1fr' }}>
          {/* Your Overview Card - Clickable with Circular Progress */}
          <button
            onClick={() => setOverviewOpen(true)}
            className="group relative w-full row-span-2 border border-slate-200 bg-white rounded-xl shadow-sm px-2 py-1 hover:bg-slate-50 hover:border-primary/30 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="View detailed learning overview"
          >
            <div className="flex h-full flex-col justify-between">
              {/* Header: Title + Arrow */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Overall Progress</h3>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>

              {/* Center: Circular Progress */}
              <div className="flex items-center justify-center">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeDasharray={`${overallProgress}, 100`}
                      className="group-hover:stroke-primary/80 transition-colors"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900 group-hover:scale-110 transition-transform duration-200">
                      {overallProgress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom: Supporting Text */}
              <div className="text-center leading-tight px-2 mb-2">
                <p className="text-xs text-slate-500">Keep learning to improve</p>
                <p className="text-xs text-slate-500">your overall progress</p>
              </div>
            </div>
          </button>

          {/* Statistics Cards - Top Row */}
          <Link href="/dashboard/study-space">
            <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="px-3 py-2 h-full">
                <div className="flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      {emptyStats[0].icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-600">{emptyStats[0].title}</p>
                      <p className="text-lg font-bold text-slate-900">{emptyStats[0].value}</p>
                      <p className="text-[10px] text-slate-500">{emptyStats[0].subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/practice-arena">
            <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="px-3 py-2 h-full">
                <div className="flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      {emptyStats[1].icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-600">{emptyStats[1].title}</p>
                      <p className="text-lg font-bold text-slate-900">{emptyStats[1].value}</p>
                      <p className="text-[10px] text-slate-500">{emptyStats[1].subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Statistics Cards - Bottom Row */}
          <Link href="/dashboard/assessment-center">
            <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="px-3 py-2 h-full">
                <div className="flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      {emptyStats[2].icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-600">{emptyStats[2].title}</p>
                      <p className="text-lg font-bold text-slate-900">{emptyStats[2].value}</p>
                      <p className="text-[10px] text-slate-500">{emptyStats[2].subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/my-progress">
            <Card className="group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-200 h-full">
              <CardContent className="px-3 py-2 h-full">
                <div className="flex items-center justify-between gap-2.5 h-full">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      {emptyStats[3].icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-slate-600">{emptyStats[3].title}</p>
                      <p className="text-lg font-bold text-slate-900">{emptyStats[3].value}</p>
                      <p className="text-[10px] text-slate-500">{emptyStats[3].subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Right Column: Your Progress This Week */}
        <Card className="border-slate-200 shadow-sm h-full">
          <CardHeader className="pb-1 px-4 pt-3">
            <CardTitle className="text-sm">Your Progress This Week</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-3 h-full">
            <div className="flex flex-col justify-between h-full space-y-2">
              <div className="flex items-end justify-between gap-1 flex-1">
                {weeklyProgress.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-sm transition-all hover:bg-primary/80 ${
                        day.hours > 0 ? 'bg-primary' : 'bg-slate-200'
                      }`}
                      style={{
                        height: `${(day.hours / maxHours) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                    <span className="text-[10px] text-slate-500">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Total this week</span>
                <span className="font-semibold text-slate-900">
                  {weeklyProgress.reduce((sum, day) => sum + day.hours, 0).toFixed(1)} hrs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lazy-loaded Learning Overview Dialog */}
      <LearningOverviewDialog
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
        performanceData={performanceData}
        overallProgress={overallProgress}
      />

      {/* Attention & Assessments Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Needs Your Attention Card */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                Needs Your Attention
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {attentionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-orange-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
                <p className="text-sm text-slate-500">Nothing needs attention</p>
                <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attentionItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-2 border-b border-orange-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50">
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                Announcements
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">No announcements yet</p>
              <p className="text-xs text-slate-400 mt-1">New announcements will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning, Activity, Recommendations Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-lg">Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Start your learning journey</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm">
                Explore our modules and begin your first course to track your progress here.
              </p>
              <Button className="w-full sm:w-auto">
                <Play className="h-4 w-4 mr-2" />
                Browse Modules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {emptyRecentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No recent activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Start learning to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emptyRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {activity.type === "test" && <FileText className="h-5 w-5 text-primary" />}
                      {activity.type === "module" && <BookOpen className="h-5 w-5 text-primary" />}
                      {activity.type === "practice" && <TrendingUp className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                    {activity.score && (
                      <Badge variant="default" className="shrink-0">
                        {activity.score}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended For You */}
        <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-lg">Recommended For You</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <Zap className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No recommendations yet</p>
                <p className="text-xs text-slate-400 mt-1">Start learning to get personalized recommendations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        {rec.type === "practice" && <TrendingUp className="h-5 w-5 text-primary" />}
                        {rec.type === "learn" && <BookOpen className="h-5 w-5 text-primary" />}
                        {rec.type === "quiz" && <FileText className="h-5 w-5 text-primary" />}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {rec.reason}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{rec.title}</p>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      {rec.action}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
