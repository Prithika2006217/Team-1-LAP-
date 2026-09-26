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
  Eye,
  Zap,
  Flame
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Let's continue your learning journey.
        </p>
      </div>

      {/* Top Row: Your Overview + Learning Streak + Weekly Progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Your Overview Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Your Overview</h3>
                  <p className="text-xs text-slate-500">View detailed learning insights</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => setOverviewOpen(true)}
              >
                View Overview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lazy-loaded Learning Overview Dialog */}
        <LearningOverviewDialog
          open={overviewOpen}
          onOpenChange={setOverviewOpen}
          performanceData={performanceData}
        />

        {/* Learning Streak Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Learning Streak</h3>
                </div>
                <span className="text-2xl font-bold text-orange-600">{learningStreak.current}</span>
              </div>
              <div className="flex justify-between">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        learningStreak.weekly[index] 
                          ? "bg-orange-100 text-orange-600" 
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {day}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-slate-500">
                {learningStreak.current > 0 
                  ? "Keep learning to maintain your streak!" 
                  : "Start learning to build your streak!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your Progress This Week</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-1 h-20">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {emptyStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  {stat.icon}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.subtitle}</p>
                  {stat.trend && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {stat.trend}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attention & Assessments Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Needs Your Attention Card */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
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
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 mb-3">
                  <AlertCircle className="h-6 w-6 text-orange-400" />
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

        {/* Upcoming Assessments Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Assessments
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {emptyUpcomingAssessments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-3">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No upcoming assessments</p>
                <p className="text-xs text-slate-400 mt-1">Check back later for scheduled assessments</p>
              </div>
            ) : (
              emptyUpcomingAssessments.map((assessment) => (
                <div key={assessment.id} className="space-y-3 rounded-lg border border-slate-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {assessment.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{assessment.date}</span>
                        <span>•</span>
                        <span>{assessment.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {assessment.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{assessment.duration}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning, Activity, Recommendations Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {emptyRecentActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-3">
                  <TrendingUp className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No recent activity yet</p>
                <p className="text-xs text-slate-400 mt-1">Start learning to see your activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emptyRecentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      {activity.type === "test" && <FileText className="h-4 w-4 text-primary" />}
                      {activity.type === "module" && <BookOpen className="h-4 w-4 text-primary" />}
                      {activity.type === "practice" && <TrendingUp className="h-4 w-4 text-primary" />}
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended For You</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-3">
                  <Zap className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No recommendations yet</p>
                <p className="text-xs text-slate-400 mt-1">Start learning to get personalized recommendations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        {rec.type === "practice" && <TrendingUp className="h-4 w-4 text-primary" />}
                        {rec.type === "learn" && <BookOpen className="h-4 w-4 text-primary" />}
                        {rec.type === "quiz" && <FileText className="h-4 w-4 text-primary" />}
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
