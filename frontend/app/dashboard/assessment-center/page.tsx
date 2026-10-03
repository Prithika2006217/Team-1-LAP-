"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Eye,
  History,
  Camera,
  Mic,
  RefreshCw,
  MicOff,
  Code
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
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [activeSection, setActiveSection] = useState<"live" | "upcoming" | "completed" | "attempts" | "editor">("live");

  // System check state
  const [showSystemCheck, setShowSystemCheck] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<"checking" | "granted" | "denied">("checking");
  const [micPermissionStatus, setMicPermissionStatus] = useState<"checking" | "granted" | "denied">("checking");
  const [micVerificationStatus, setMicVerificationStatus] = useState<"idle" | "listening" | "verified" | "failed">("idle");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const recognitionRef = React.useRef<any>(null);

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

  // Fetch attempts (authentication required)
  const { data: attemptsData, error: attemptsError, isLoading: attemptsLoading } = useSWR(
    userId ? `/api/assessments/attempts` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const liveAssessments = liveData?.assessments || [];
  const upcomingAssessments = upcomingData?.assessments || [];
  const completedAssessments = completedData?.completed || [];
  const attempts = attemptsData?.attempts || [];

  const handleContactSupport = () => {
    alert('Support contact feature coming soon!');
  };

  // Tab selection handler
  const handleTabChange = (sectionId: "live" | "upcoming" | "completed" | "attempts" | "editor") => {
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

  // Ensure video plays when camera status changes
  useEffect(() => {
    if (cameraStatus === "granted" && videoRef.current && videoRef.current.srcObject) {
      console.log("Camera status granted, ensuring video plays");
      console.log("Video srcObject:", videoRef.current.srcObject);
      console.log("Video readyState:", videoRef.current.readyState);
      videoRef.current.play()
        .then(() => console.log("Video playing after status change"))
        .catch(e => console.error("Video play error after status change:", e));
    }
  }, [cameraStatus]);

  // Ensure video plays when dialog opens
  useEffect(() => {
    if (showSystemCheck && videoRef.current && videoRef.current.srcObject) {
      console.log("Dialog opened, ensuring video plays");
      console.log("Video srcObject:", videoRef.current.srcObject);
      videoRef.current.play()
        .then(() => console.log("Video playing after dialog open"))
        .catch(e => console.error("Video play error after dialog open:", e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSystemCheck]);

  // Debug video state periodically
  useEffect(() => {
    if (showSystemCheck && videoRef.current) {
      const interval = setInterval(() => {
        console.log("Video debug - readyState:", videoRef.current?.readyState, 
                    "videoWidth:", videoRef.current?.videoWidth,
                    "videoHeight:", videoRef.current?.videoHeight,
                    "paused:", videoRef.current?.paused,
                    "srcObject:", !!videoRef.current?.srcObject);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showSystemCheck]);

  // System check functions
  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setMicVerificationStatus("idle");
    setRecognizedText("");
    setSpeechError(null);
  }, []);

  const stopMediaStream = useCallback(() => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    stopSpeechRecognition();
  }, [mediaStream, stopSpeechRecognition]);

  const requestMediaAccess = useCallback(async () => {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera and microphone access are not supported by this browser.");
      setCameraStatus("denied");
      setMicPermissionStatus("denied");
      return;
    }

    console.log("Requesting camera and microphone access...");

    // Enumerate devices to check if cameras are available
    let videoDevices: MediaDeviceInfo[] = [];
    let audioDevices: MediaDeviceInfo[] = [];
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter(device => device.kind === 'videoinput');
      audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      console.log("Available video devices:", videoDevices.length, videoDevices.map(d => d.label));
      console.log("Available audio devices:", audioDevices.length, audioDevices.map(d => d.label));

      if (videoDevices.length === 0) {
        setError("No camera was found on this device. Please connect a camera and try again.");
        setCameraStatus("denied");
        setMicPermissionStatus("denied");
        return;
      }

      if (audioDevices.length === 0) {
        setError("No microphone was found on this device. Please connect a microphone and try again.");
        setCameraStatus("denied");
        setMicPermissionStatus("denied");
        return;
      }
    } catch (enumerateErr: any) {
      console.error("Error enumerating devices:", enumerateErr);
      // Continue anyway - enumeration might fail if permissions not granted yet
    }

    // Request camera first - try each available camera device
    let videoStream: MediaStream | null = null;
    let cameraError: any = null;
    
    for (let i = 0; i < videoDevices.length; i++) {
      const device = videoDevices[i];
      try {
        console.log(`Trying camera ${i + 1}/${videoDevices.length}:`, device.deviceId, device.label || "Unnamed camera");
        
        // Try with deviceId constraint
        videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: { exact: device.deviceId } } 
        });
        
        console.log("Camera access granted with device:", device.label || device.deviceId);
        setCameraStatus("granted");
        setError(null);
        cameraError = null;
        break; // Success - exit loop
      } catch (err: any) {
        console.error(`Camera ${i + 1} failed:`, err.name || err, err.message || err);
        cameraError = err;
        
        // Stop any partial stream
        if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop());
          videoStream = null;
        }
      }
    }

    // If all cameras failed, try without deviceId constraint as fallback
    if (!videoStream) {
      try {
        console.log("Trying camera without deviceId constraint...");
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Camera access granted (fallback)");
        setCameraStatus("granted");
        setError(null);
        cameraError = null;
      } catch (fallbackErr: any) {
        console.error("Camera fallback failed:", fallbackErr.name, fallbackErr.message);
        cameraError = fallbackErr;
      }
    }

    // If still no camera, show error but allow proceeding with warning
    if (!videoStream) {
      console.error("All camera attempts failed");
      setCameraStatus("denied");
      
      if (cameraError.name === "NotAllowedError" || cameraError.name === "PermissionDeniedError") {
        setError("Camera permission was denied. Please allow camera access in your browser. Click Retry to try again, or Skip to proceed without camera.");
      } else if (cameraError.name === "NotFoundError") {
        setError("No camera was found on this device. Click Retry to try again, or Skip to proceed without camera.");
      } else if (cameraError.name === "NotReadableError") {
        setError("The camera is currently being used by another application. Please close other applications using the camera and try again, or Skip to proceed without camera.");
      } else if (cameraError.name === "AbortError") {
        setError("Camera could not be started (timeout). This may be a hardware/driver issue. Click Retry to try again, or Skip to proceed without camera.");
      } else {
        setError(cameraError.message || "Failed to access camera. Click Retry to try again, or Skip to proceed without camera.");
      }
      return;
    }

    // Only request microphone after camera succeeds
    let audioStream: MediaStream | null = null;
    try {
      console.log("Requesting microphone access...");
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted");
      setMicPermissionStatus("granted");
    } catch (audioErr: any) {
      console.error("Microphone access error - Name:", audioErr.name, "Message:", audioErr.message);
      setMicPermissionStatus("denied");
      // Stop video stream if audio fails
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      if (audioErr.name === "NotAllowedError" || audioErr.name === "PermissionDeniedError") {
        setError("Microphone permission was denied. Please allow microphone access in your browser.");
      } else if (audioErr.name === "NotFoundError") {
        setError("No microphone was found on this device.");
      } else if (audioErr.name === "NotReadableError") {
        setError("The microphone is currently being used by another application.");
      } else if (audioErr.name === "AbortError") {
        setError("Microphone could not be started. Please check that your microphone is available and not being used by another application.");
      } else {
        setError(audioErr.message || "Failed to access microphone. Please try again.");
      }
      return;
    }

    // Combine streams
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks()
    ]);

    console.log("Combined stream created");
    setMediaStream(combinedStream);

    // Set video preview after a small delay to ensure video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        console.log("Setting video preview (delayed)");
        console.log("Video stream tracks:", combinedStream.getTracks());
        console.log("Video stream video tracks:", combinedStream.getVideoTracks());
        
        videoRef.current.srcObject = combinedStream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing...");
          console.log("Video readyState:", videoRef.current?.readyState);
          console.log("Video videoWidth:", videoRef.current?.videoWidth);
          console.log("Video videoHeight:", videoRef.current?.videoHeight);
          videoRef.current?.play()
            .then(() => console.log("Video playing successfully"))
            .catch(e => console.error("Video play error:", e));
        };

        videoRef.current.play()
          .then(() => console.log("Video playing immediately"))
          .catch(e => console.log("Video not playing yet, waiting for metadata:", e));
      } else {
        console.error("videoRef.current is still null after delay!");
      }
    }, 100);
  }, []);

  const startSystemCheck = useCallback(async () => {
    setShowSystemCheck(true);
    setCameraStatus("checking");
    setMicPermissionStatus("checking");
    setMicVerificationStatus("idle");
    setError(null);

    await requestMediaAccess();
  }, [requestMediaAccess]);

  const handleRetry = useCallback(async () => {
    stopMediaStream();
    setCameraStatus("checking");
    setMicPermissionStatus("checking");
    setMicVerificationStatus("idle");
    setError(null);
    setRecognizedText("");
    setSpeechError(null);

    await requestMediaAccess();
  }, [stopMediaStream, requestMediaAccess]);

  // Speech recognition functions
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeString(str1);
    const s2 = normalizeString(str2);

    console.log("Similarity calculation - Input 1:", str1, "-> Normalized:", s1);
    console.log("Similarity calculation - Input 2:", str2, "-> Normalized:", s2);

    if (s1 === s2) return 100;

    // Calculate Levenshtein distance
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    const similarity = maxLen === 0 ? 100 : ((maxLen - distance) / maxLen) * 100;
    
    console.log("Levenshtein distance:", distance, "Max length:", maxLen, "Similarity:", similarity);

    return similarity;
  };

  const startSpeechRecognition = useCallback(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Speech verification is not supported by this browser. Please use a supported browser such as Chrome or Edge.");
      return;
    }

    console.log("Starting speech recognition...");

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    // Store final transcript locally to avoid stale state
    let finalTranscript = "";

    recognition.onstart = () => {
      console.log("Speech recognition started");
      setMicVerificationStatus("listening");
      setRecognizedText("");
      setSpeechError(null);
      finalTranscript = "";
    };

    recognition.onresult = (event: any) => {
      const interim = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      console.log("Speech recognition result:", interim);
      setRecognizedText(interim);
      finalTranscript = interim;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setSpeechError("Microphone permission was denied. Please allow microphone access and try again.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech was detected. Please try again.");
      } else {
        setSpeechError("Speech recognition failed. Please try again.");
      }
      setMicVerificationStatus("failed");
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      console.log("Final transcript:", finalTranscript);
      const expectedSentence = "I am ready to begin my assessment";
      const similarity = calculateSimilarity(finalTranscript, expectedSentence);
      console.log("Similarity:", similarity);

      if (similarity >= 75) {
        setMicVerificationStatus("verified");
        setSpeechError(null);
      } else {
        setMicVerificationStatus("failed");
        setSpeechError("Your speech could not be verified. Please try again.");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const handleCloseSystemCheck = useCallback(() => {
    stopMediaStream();
    setShowSystemCheck(false);
    setCameraStatus("checking");
    setMicPermissionStatus("checking");
    setMicVerificationStatus("idle");
    setError(null);
    setRecognizedText("");
    setSpeechError(null);
  }, [stopMediaStream]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleCloseSystemCheck();
    }
  }, [handleCloseSystemCheck]);

  const handleContinueToTest = useCallback(() => {
    stopMediaStream();
    setShowSystemCheck(false);
    router.push("/dashboard/assessment-center/tcs-nqt-2020-numerical");
  }, [stopMediaStream, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

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
              icon: <History className="h-4 w-4" />
            },
            {
              id: "editor",
              label: "Code Editor",
              icon: <Code className="h-4 w-4" />
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as "live" | "upcoming" | "completed" | "attempts" | "editor")}
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
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg p-6 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">TCS NQT – Previous Year Questions</h3>
                        <p className="text-sm text-slate-500 mt-1">TCS NQT 2020</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Previous Year Paper
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">26 Questions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">2020</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Numerical Ability</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div></div>
                      <Button onClick={startSystemCheck} className="bg-primary hover:bg-primary/90">
                        <Play className="h-4 w-4 mr-2" />
                        Start Questions
                      </Button>
                    </div>
                  </div>
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

          {/* My Attempts Section */}
          {activeSection === "attempts" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100">
                  <History className="h-4 w-4 text-purple-600" />
                </div>
                My Attempts
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                {attemptsLoading ? (
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
                ) : attemptsError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-100 mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-500">Failed to load attempts</p>
                    <p className="text-xs text-slate-400 mt-1">Please try again later</p>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-4">
                      <History className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-sm text-slate-500">No attempts yet</p>
                    <p className="text-xs text-slate-400 mt-1">Your test attempts will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Test</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Score</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Correct</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Incorrect</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((attempt: any) => (
                          <tr key={attempt.id} className="border-b border-slate-100 last:border-0">
                            <td className="py-3 px-4 text-sm text-slate-900">{attempt.testTitle || "Test"}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">{attempt.score ?? "N/A"}</td>
                            <td className="py-3 px-4 text-sm text-green-600">{attempt.correctCount ?? "N/A"}</td>
                            <td className="py-3 px-4 text-sm text-red-600">{attempt.incorrectCount ?? "N/A"}</td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">
                              {attempt.percentage !== null && attempt.percentage !== undefined
                                ? `${attempt.percentage.toFixed(2)}%`
                                : "N/A"}
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

          {/* Code Editor Section */}
          {activeSection === "editor" && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                Code Editor
              </h2>
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Practice Coding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Practice coding problems with our integrated code editor supporting multiple languages including Python, Java, C, C++, JavaScript, and TypeScript.
                  </p>
                  <Link href="/dashboard/editor">
                    <Button className="gap-2">
                      <Code className="h-4 w-4" />
                      Open Code Editor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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

      {/* System Check Dialog */}
      <Dialog open={showSystemCheck} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>System Check</DialogTitle>
            <DialogDescription>
              Please check your camera and microphone before starting the assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Camera Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Camera className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Camera</p>
                <p className="text-xs text-slate-500">
                  {cameraStatus === "checking" && "Checking..."}
                  {cameraStatus === "granted" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Camera access granted
                    </span>
                  )}
                  {cameraStatus === "denied" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Camera access required
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Microphone Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Mic className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Microphone</p>
                <p className="text-xs text-slate-500">
                  {micPermissionStatus === "checking" && "Checking..."}
                  {micPermissionStatus === "granted" && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Microphone access granted
                    </span>
                  )}
                  {micPermissionStatus === "denied" && (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Microphone access required
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 mb-3">{error}</p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                  <Button
                    onClick={() => {
                      stopMediaStream();
                      setCameraStatus("granted");
                      setMicPermissionStatus("granted");
                      setError(null);
                      router.push("/dashboard/assessment-center/tcs-nqt-2020-numerical");
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            )}

            {/* Camera Preview */}
            {cameraStatus === "granted" && (
              <div className="flex justify-center">
                <div className="relative w-full max-w-sm aspect-video bg-slate-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    onCanPlay={() => {
                      console.log("Video can play, forcing playback");
                      videoRef.current?.play().catch(e => console.error("Video play error in onCanPlay:", e));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Microphone Speech Verification */}
            {cameraStatus === "granted" && micPermissionStatus === "granted" && (
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Microphone Test</h3>
                <p className="text-xs text-slate-500 mb-3">Please say the following sentence clearly:</p>
                <div className="p-3 bg-slate-50 rounded-lg mb-3">
                  <p className="text-sm font-medium text-slate-900">"I am ready to begin my assessment."</p>
                </div>

                {micVerificationStatus === "idle" && (
                  <Button onClick={startSpeechRecognition} className="w-full">
                    <Mic className="h-4 w-4 mr-2" />
                    Start Microphone Test
                  </Button>
                )}

                {micVerificationStatus === "listening" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-sm font-medium">Listening...</span>
                    </div>
                    {recognizedText && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">You said:</p>
                        <p className="text-sm text-slate-900">{recognizedText}</p>
                      </div>
                    )}
                  </div>
                )}

                {micVerificationStatus === "verified" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Microphone verified</span>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">You said:</p>
                      <p className="text-sm text-slate-900">{recognizedText}</p>
                    </div>
                  </div>
                )}

                {micVerificationStatus === "failed" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">{speechError || "Your speech could not be verified. Please try again."}</p>
                    </div>
                    {recognizedText && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">You said:</p>
                        <p className="text-sm text-slate-900">{recognizedText}</p>
                      </div>
                    )}
                    <Button onClick={startSpeechRecognition} variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseSystemCheck}>
              Cancel
            </Button>
            {error && (
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
            <Button
              onClick={handleContinueToTest}
              disabled={cameraStatus !== "granted" || micPermissionStatus !== "granted" || micVerificationStatus !== "verified"}
            >
              Continue to Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
