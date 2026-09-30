"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Shield,
  Monitor,
  HelpCircle,
  ChevronRight,
  Play,
  Calendar,
  TrendingUp,
  FileText,
  Eye
} from "lucide-react";
import { fetcher, getCurrentUserId } from "@/lib/api";

interface Assessment {
  id: string;
  title: string;
  type: string;
  company?: string;
  questions: number;
  durationMinutes: number;
  sections: number;
  startTime: string;
  endTime: string;
  status: string;
  proctoringEnabled: boolean;
  fullScreenRequired: boolean;
  tabSwitchRestricted: boolean;
  maxAttempts: number;
}

interface CompletedAssessment {
  id: string;
  assessmentId: string;
  title: string;
  type: string;
  company?: string;
  date: string | null;
  score: number;
  percentage: number;
  percentile: number | null;
  status: string;
}

export default function AssessmentCenterPage() {
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [activeSection, setActiveSection] = useState<"live" | "upcoming" | "completed">("live");

  const userId = getCurrentUserId();

  // Fetch live assessments (no authentication required)
  const { data: liveData, error: liveError, isLoading: liveLoading } = useSWR(
    `/api/assessments/live`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch upcoming assessments (no authentication required)
  const { data: upcomingData, error: upcomingError, isLoading: upcomingLoading } = useSWR(
    `/api/assessments/upcoming`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Fetch completed assessments (authentication required)
  const { data: completedData, error: completedError, isLoading: completedLoading } = useSWR(
    userId ? `/api/assessments/completed` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const liveAssessments = liveData?.assessments || [];
  const upcomingAssessments = upcomingData?.assessments || [];
  const completedAssessments = completedData?.completed || [];

  const handleContactSupport = () => {
    alert('Support contact feature coming soon!');
  };

  // Tab selection handler
  const handleTabChange = (sectionId: "live" | "upcoming" | "completed") => {
    setActiveSection(sectionId);
  };

  // Calculate time remaining for live assessments
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newTimeRemaining: { [key: string]: string } = {};

      liveAssessments.forEach((assessment: Assessment) => {
        const endTime = new Date(assessment.endTime);
        const diff = endTime.getTime() - now.getTime();

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          if (hours > 0) {
            newTimeRemaining[assessment.id] = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            newTimeRemaining[assessment.id] = `${minutes}m ${seconds}s`;
          } else {
            newTimeRemaining[assessment.id] = `${seconds}s`;
          }
        } else {
          newTimeRemaining[assessment.id] = "Ended";
        }
      });

      // Calculate time until start for upcoming assessments
      upcomingAssessments.forEach((assessment: Assessment) => {
        const startTime = new Date(assessment.startTime);
        const diff = startTime.getTime() - now.getTime();

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            newTimeRemaining[assessment.id] = `${days}d ${hours}h ${minutes}m`;
          } else if (hours > 0) {
            newTimeRemaining[assessment.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeRemaining[assessment.id] = `${minutes}m`;
          }
        } else {
          newTimeRemaining[assessment.id] = "Starting soon";
        }
      });

      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveAssessments, upcomingAssessments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessment Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Take proctored assessments and track your performance in real-time.
        </p>
      </div>

      {/* Horizontal Navigation Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 py-2">
        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {[
            { 
              id: "live", 
              label: "Live Now", 
              icon: <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> 
            },
            { 
              id: "upcoming", 
              label: "Upcoming", 
              icon: <Calendar className="h-4 w-4" /> 
            },
            { 
              id: "completed", 
              label: "Completed", 
              icon: <CheckCircle className="h-4 w-4" /> 
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as "live" | "upcoming" | "completed")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-2.5 rounded-md ${
                activeSection === tab.id
                  ? "border-primary text-primary bg-primary/10 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Assessment Listings */}
        <div className="lg:col-span-2">
          {/* Live Assessments Section */}
          {activeSection === "live" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                Live Assessments
              </h2>
              <div className="space-y-4">
                {liveLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                      </div>
                    ))}
                  </div>
                ) : liveError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-500">Failed to load live assessments</p>
                    <p className="text-xs text-slate-400 mt-1">Please try again later</p>
                  </div>
                ) : liveAssessments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No live assessments at the moment</p>
                    <p className="text-xs text-slate-400 mt-1">Check back later for upcoming assessments</p>
                  </div>
                ) : (
                  liveAssessments.map((assessment: Assessment) => (
                    <div key={assessment.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{assessment.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{assessment.type}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            Live Now
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.questions} Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.durationMinutes} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.sections} Sections</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(assessment.startTime).toLocaleString()} -{" "}
                          {new Date(assessment.endTime).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {assessment.company && (
                          <Badge variant="outline" className="text-xs">
                            {assessment.company}
                          </Badge>
                        )}
                        {assessment.proctoringEnabled && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Proctored
                          </Badge>
                        )}
                        {assessment.fullScreenRequired && (
                          <Badge variant="outline" className="text-xs">
                            <Monitor className="h-3 w-3 mr-1" />
                            Full Screen
                          </Badge>
                        )}
                        {assessment.tabSwitchRestricted && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Tab Switch Restricted
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Max Attempts: {assessment.maxAttempts}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                          <Clock className="h-4 w-4" />
                          Time Remaining: {timeRemaining[assessment.id] || "Calculating..."}
                        </div>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Play className="h-4 w-4 mr-2" />
                          Enter Exam
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Upcoming Assessments Section */}
          {activeSection === "upcoming" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                Upcoming Assessments
              </h2>
              <div className="space-y-4">
                {upcomingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-10 w-32" />
                      </div>
                    ))}
                  </div>
                ) : upcomingError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-500">Failed to load upcoming assessments</p>
                    <p className="text-xs text-slate-400 mt-1">Please try again later</p>
                  </div>
                ) : upcomingAssessments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No upcoming assessments</p>
                    <p className="text-xs text-slate-400 mt-1">New assessments will appear here</p>
                  </div>
                ) : (
                  upcomingAssessments.map((assessment: Assessment) => (
                    <div key={assessment.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{assessment.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{assessment.type}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Upcoming
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.questions} Questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.durationMinutes} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{assessment.sections} Sections</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(assessment.startTime).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                          <Clock className="h-4 w-4" />
                          Starts in: {timeRemaining[assessment.id] || "Calculating..."}
                        </div>
                        <Button variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Completed Assessments Section */}
          {activeSection === "completed" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                Completed Assessments
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                {completedLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-100">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                ) : completedError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-500">Failed to load completed assessments</p>
                    <p className="text-xs text-slate-400 mt-1">Please try again later</p>
                  </div>
                ) : completedAssessments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No completed assessments yet</p>
                    <p className="text-xs text-slate-400 mt-1">Your completed assessments will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Assessment</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Score</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Percentile</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedAssessments.map((assessment: CompletedAssessment) => (
                          <tr key={assessment.id} className="border-b border-slate-100 last:border-0">
                            <td className="py-3 px-4 text-sm text-slate-900">{assessment.title}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {assessment.date ? new Date(assessment.date).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">{assessment.score}%</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {assessment.percentile !== null ? `${assessment.percentile}%` : "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                {assessment.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm" className="text-primary">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column - Information Panels */}
        <div className="space-y-6">
          {/* Assessment Guidelines */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                Assessment Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  Ensure stable internet connection
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  Close all other applications
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  Do not switch tabs or windows
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  Use a quiet and well-lit environment
                </li>
              </ul>
              <Button
                variant="ghost"
                className="text-primary mt-4 px-0 hover:bg-transparent"
                onClick={() => setShowGuidelinesModal(true)}
              >
                View All Guidelines
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Performance Snapshot */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Performance Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No performance data yet</p>
                  <p className="text-xs text-slate-400 mt-1">Complete assessments to see your stats</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
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
                          strokeDasharray={`${completedAssessments.length > 0 ? Math.round(completedAssessments.reduce((sum: number, a: CompletedAssessment) => sum + a.score, 0) / completedAssessments.length) : 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-900">
                          {completedAssessments.length > 0 ? Math.round(completedAssessments.reduce((sum: number, a: CompletedAssessment) => sum + a.score, 0) / completedAssessments.length) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900">{completedAssessments.length}</p>
                      <p className="text-xs text-slate-500">Attempted</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {completedAssessments.filter((a: CompletedAssessment) => a.status === "COMPLETED").length}
                      </p>
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">
                        {completedAssessments.filter((a: CompletedAssessment) => a.status !== "COMPLETED").length}
                      </p>
                      <p className="text-xs text-slate-500">In Progress</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Best Score</span>
                      <span className="font-medium text-slate-900">
                        {completedAssessments.length > 0 ? Math.max(...completedAssessments.map((a: CompletedAssessment) => a.score)) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Avg. Percentile</span>
                      <span className="font-medium text-slate-900">
                        {(() => {
                          const validPercentiles = completedAssessments.map((a: CompletedAssessment) => a.percentile).filter((p: number | null) => p !== null);
                          return validPercentiles.length > 0
                            ? Math.round(validPercentiles.reduce((sum: number, p: number) => sum + p, 0) / validPercentiles.length)
                            : "N/A";
                        })()}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Having trouble with assessments? Our support team is here to help you.
              </p>
              <Button className="w-full" variant="outline" onClick={handleContactSupport}>
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Guidelines Modal */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Assessment Guidelines</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowGuidelinesModal(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Before the Assessment
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Ensure you have a stable internet connection throughout the assessment
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Close all other applications and browser tabs before starting
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Use a quiet, well-lit environment with minimal distractions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Keep your photo ID ready for verification if required
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Test your webcam and microphone if proctoring is enabled
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    During the Assessment
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Do not switch tabs or windows during the assessment
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Stay in full-screen mode if required by the assessment
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Do not use any external resources or reference materials
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Manage your time effectively - keep track of the countdown timer
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Save your answers regularly if auto-save is not enabled
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Technical Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Use a modern browser (Chrome, Firefox, Edge, Safari)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Enable JavaScript and cookies in your browser
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Ensure your screen resolution is at least 1366x768
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      Disable browser extensions that might interfere
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Important Notes
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Multiple attempts may be restricted based on assessment settings
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Your assessment will be auto-submitted when time expires
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                      Suspicious activity may result in disqualification
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <Button 
                  className="w-full" 
                  onClick={() => setShowGuidelinesModal(false)}
                >
                  I Understand
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
