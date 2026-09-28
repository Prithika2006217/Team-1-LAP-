"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Shield,
  Monitor,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Play,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Eye
} from "lucide-react";

interface Assessment {
  id: string;
  title: string;
  category: string;
  duration: number;
  questionCount: number;
  sectionCount: number;
  startTime?: Date;
  endTime?: Date;
  status: "live" | "upcoming" | "completed";
  proctored: boolean;
  fullScreen: boolean;
  tabSwitchRestricted: boolean;
  attempts: number;
  maxAttempts: number;
}

interface CompletedAssessment {
  id: string;
  title: string;
  date: Date;
  score: number;
  percentile: number;
  status: "passed" | "failed";
}

export default function AssessmentCenterPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [activeSection, setActiveSection] = useState<"live" | "upcoming" | "completed" | "attempts">("live");

  // Fetch completed assessments from backend
  useEffect(() => {
    async function fetchCompletedAssessments() {
      try {
        // This would be a separate endpoint like /api/practice/submissions
        // For now, keeping it empty as there's no hardcoded data
        setCompletedAssessments([]);
      } catch (error) {
        console.error('Failed to fetch completed assessments:', error);
      }
    }

    fetchCompletedAssessments();
  }, []);

  // Handler functions for quick links
  const handleMyAttempts = () => {
    // Scroll to My Attempts section
    const myAttemptsSection = document.getElementById('my-attempts');
    if (myAttemptsSection) {
      myAttemptsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadResources = () => {
    // This would open a resources download page or modal
    alert('Resources download feature coming soon!');
  };

  const handleSystemCheck = () => {
    // This would run a system check (camera, microphone, internet, etc.)
    alert('System check feature coming soon!');
  };

  const handleExamFAQs = () => {
    // This would open FAQs page or modal
    alert('Exam FAQs feature coming soon!');
  };

  const handleContactSupport = () => {
    // This would open support chat or email
    alert('Support contact feature coming soon!');
  };

  // Horizontal navigation scroll handlers
  const scrollToSection = (sectionId: string) => {
    const idMap: Record<string, string> = {
      "live": "live-assessments",
      "upcoming": "upcoming-assessments", 
      "completed": "completed-assessments",
      "attempts": "my-attempts"
    };
    
    // Force immediate state update for instant visual feedback
    setActiveSection(sectionId as "live" | "upcoming" | "completed" | "attempts");
    
    // Scroll to the section with offset for navigation bar
    const element = document.getElementById(idMap[sectionId]);
    if (element) {
      const yOffset = -100; // Offset for sticky navigation
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Fetch assessments from backend
  useEffect(() => {
    async function fetchAssessments() {
      try {
        const response = await fetch('/api/practice/tests');
        const data = await response.json();
        
        if (data.tests && Array.isArray(data.tests)) {
          // Transform backend data to match our interface
          const transformedAssessments: Assessment[] = data.tests.map((test: any) => ({
            id: test.id,
            title: test.title,
            category: test.category,
            duration: test.durationMinutes,
            questionCount: test.questionCount,
            sectionCount: 0, // Will be calculated when we fetch full test details
            status: 'upcoming', // Default status - can be determined from startTime/endTime
            proctored: true, // Default - can be added to schema
            fullScreen: true, // Default - can be added to schema
            tabSwitchRestricted: true, // Default - can be added to schema
            attempts: test.attempts || 0,
            maxAttempts: 1 // Default - can be added to schema
          }));
          
          setAssessments(transformedAssessments);
        }
      } catch (error) {
        console.error('Failed to fetch assessments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAssessments();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      assessments.forEach(assessment => {
        if (assessment.status === "live" && assessment.endTime) {
          const remaining = new Date(assessment.endTime).getTime() - Date.now();
          if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            newTimeRemaining[assessment.id] = `${hours}h ${minutes}m ${seconds}s`;
          }
        } else if (assessment.status === "upcoming" && assessment.startTime) {
          const remaining = new Date(assessment.startTime).getTime() - Date.now();
          if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            newTimeRemaining[assessment.id] = `${hours}h ${minutes}m`;
          }
        }
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [assessments]);

  const liveAssessments = assessments.filter(a => a.status === "live");
  const upcomingAssessments = assessments.filter(a => a.status === "upcoming");

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assessment Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Take proctored assessments and track your performance in real-time.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <Clock className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-sm text-slate-500">Loading assessments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            },
            { 
              id: "attempts", 
              label: "My Attempts", 
              icon: <FileText className="h-4 w-4" /> 
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
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
        <div className="lg:col-span-2 space-y-6">
          {/* Live Assessments Section */}
          <div id="live-assessments" className={`transition-all duration-300 ${activeSection === "live" ? "scale-[1.02] shadow-lg" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              Live Assessments
            </h2>
            <div className="space-y-4">
              {liveAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-slate-500">No live assessments at the moment</p>
                  <p className="text-xs text-slate-400 mt-1">Check back later for upcoming assessments</p>
                </div>
              ) : (
                liveAssessments.map(assessment => (
                  <div key={assessment.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{assessment.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{assessment.category}</p>
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
                        <span className="text-sm text-slate-600">{assessment.questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{assessment.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{assessment.sectionCount} Sections</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {assessment.startTime && new Date(assessment.startTime).toLocaleString()} -{" "}
                        {assessment.endTime && new Date(assessment.endTime).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {assessment.proctored && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Proctored Exam
                        </Badge>
                      )}
                      {assessment.fullScreen && (
                        <Badge variant="outline" className="text-xs">
                          <Monitor className="h-3 w-3 mr-1" />
                          Full Screen
                        </Badge>
                      )}
                      {assessment.tabSwitchRestricted && (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Tab Switch: Restricted
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        Attempts: {assessment.attempts} of {assessment.maxAttempts}
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
          </div>

          {/* Upcoming Assessments Section */}
          <div id="upcoming-assessments" className={`transition-all duration-300 ${activeSection === "upcoming" ? "scale-[1.02] shadow-lg" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              Upcoming Assessments
            </h2>
            <div className="space-y-4">
              {upcomingAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm text-slate-500">No upcoming assessments</p>
                  <p className="text-xs text-slate-400 mt-1">New assessments will appear here</p>
                </div>
              ) : (
                upcomingAssessments.map(assessment => (
                  <div key={assessment.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{assessment.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{assessment.category}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        Upcoming
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{assessment.questionCount} Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{assessment.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{assessment.sectionCount} Sections</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {assessment.startTime && new Date(assessment.startTime).toLocaleString()}
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
          </div>

          {/* Completed Assessments Section */}
          <div id="completed-assessments" className={`transition-all duration-300 ${activeSection === "completed" ? "scale-[1.02] shadow-lg" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              Completed Assessments
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              {completedAssessments.length === 0 ? (
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
                      {completedAssessments.map(assessment => (
                        <tr key={assessment.id} className="border-b border-slate-100 last:border-0">
                          <td className="py-3 px-4 text-sm text-slate-900">{assessment.title}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(assessment.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{assessment.score}%</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{assessment.percentile}%</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={assessment.status === "passed" ? "default" : "destructive"}
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
          </div>

          {/* My Attempts Section */}
          <div id="my-attempts" className={`transition-all duration-300 ${activeSection === "attempts" ? "scale-[1.02] shadow-lg" : ""}`}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              My Attempts
            </h2>
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-slate-500">No attempt history yet</p>
              <p className="text-xs text-slate-400 mt-1">Your assessment attempts will appear here</p>
            </div>
          </div>
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
                variant="link" 
                className="text-primary mt-4 px-0"
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
                          strokeDasharray={`${completedAssessments.length > 0 ? Math.round(completedAssessments.reduce((sum, a) => sum + a.score, 0) / completedAssessments.length) : 0}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-slate-900">
                          {completedAssessments.length > 0 ? Math.round(completedAssessments.reduce((sum, a) => sum + a.score, 0) / completedAssessments.length) : 0}%
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
                        {completedAssessments.filter(a => a.status === "passed").length}
                      </p>
                      <p className="text-xs text-slate-500">Passed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-600">
                        {completedAssessments.filter(a => a.status === "failed").length}
                      </p>
                      <p className="text-xs text-slate-500">Failed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Best Score</span>
                      <span className="font-medium text-slate-900">
                        {completedAssessments.length > 0 ? Math.max(...completedAssessments.map(a => a.score)) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Avg. Percentile</span>
                      <span className="font-medium text-slate-900">
                        {completedAssessments.length > 0 ? Math.round(completedAssessments.reduce((sum, a) => sum + a.percentile, 0) / completedAssessments.length) : 0}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm text-slate-600 hover:text-slate-900"
                    onClick={handleMyAttempts}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    My Attempts
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm text-slate-600 hover:text-slate-900"
                    onClick={handleDownloadResources}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Download Resources
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm text-slate-600 hover:text-slate-900"
                    onClick={handleSystemCheck}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System Check
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm text-slate-600 hover:text-slate-900"
                    onClick={handleExamFAQs}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Exam FAQs
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </li>
              </ul>
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
