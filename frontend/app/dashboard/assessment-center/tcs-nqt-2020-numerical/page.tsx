"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Flag, ArrowLeft, CheckCircle2, AlertTriangle, Video, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEditor } from "@/components/practice/code-editor";
import { fetcher, postJSON, getCurrentUserId } from "@/lib/api";
import type { TestBlueprint, Question } from "@/lib/practice-types";
import Link from "next/link";

const TEST_ID = "tcs-nqt-2020-numerical";

export default function TCSNQT2020NumericalPage() {
  const router = useRouter();
  const userId = getCurrentUserId();

  const { data, isLoading } = useSWR<{ test: TestBlueprint }>(
    `/api/practice/tests/${TEST_ID}`,
    fetcher
  );
  const test = data?.test;

  // Flatten questions for navigation; keep section grouping for the palette.
  const flat = useMemo(
    () => (test ? test.sections.flatMap((s) => s.questions) : []),
    [test]
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    submissionId: string;
    score: number;
    correctCount: number;
    incorrectCount: number;
    percentage: number;
    totalQuestions: number;
  } | null>(null);

  // Proctoring state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [isAudioAboveThreshold, setIsAudioAboveThreshold] = useState(false);
  const [faceVisible, setFaceVisible] = useState(true);
  const [warningCount, setWarningCount] = useState(0);
  const [currentWarning, setCurrentWarning] = useState<string | null>(null);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSubmittedRef = useRef(false);

  // Initialise current question + timer once the blueprint arrives.
  useEffect(() => {
    if (test) {
      setSecondsLeft((prev) => prev ?? test.durationMinutes * 60);
      setCurrentId((prev) => prev ?? test.sections[0]?.questions[0]?.id ?? null);
    }
  }, [test]);

  // --- Submit ---------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    if (!userId) {
      setSubmissionError("Please log in to submit your answers.");
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);
    try {
      console.log("Submitting:", { userId, testId: TEST_ID, answerCount: Object.keys(answers).length });
      const res = await postJSON<{ status: string; result?: any }>(
        "/api/practice/submit",
        { userId, testId: TEST_ID, answers }
      );
      console.log("Response:", res);
      if (res.result) {
        setResult(res.result);
      } else {
        setSubmissionError("Submission succeeded but no result returned.");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      setSubmissionError(`Failed to submit: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, userId, answers]);

  // --- Proctoring Functions -------------------------------------------------
  const enterFullScreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
      }
      setIsFullScreen(true);
      // Add class to body to hide sidebar/header
      document.body.classList.add('fullscreen-mode');
    } catch (err: any) {
      console.error("Fullscreen failed:", err);
      // Continue even if fullscreen fails - user might have denied permission
      setIsFullScreen(true);
      document.body.classList.add('fullscreen-mode');
    }
  }, []);

  const exitFullScreen = useCallback(async () => {
    try {
      // Check if currently in fullscreen before trying to exit
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      
      if (isCurrentlyFullScreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
      
      setIsFullScreen(false);
      // Remove class to show sidebar/header
      document.body.classList.remove('fullscreen-mode');
    } catch (err) {
      console.error("Exit fullscreen failed:", err);
      // Continue anyway - document might already be out of fullscreen
      setIsFullScreen(false);
      document.body.classList.remove('fullscreen-mode');
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      console.log("Starting camera in test...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log("Camera stream obtained:", stream);
      setCameraStream(stream);
      
      // Set video preview with delay to ensure element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          console.log("Setting camera preview in test");
          console.log("Video element exists:", !!videoRef.current);
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.autoplay = true;
          
          videoRef.current.onloadedmetadata = () => {
            console.log("Camera video metadata loaded, playing...");
            console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
            videoRef.current?.play()
              .then(() => console.log("Camera video playing successfully"))
              .catch(e => console.error("Camera video play error:", e));
          };

          videoRef.current.play()
            .then(() => console.log("Camera video playing immediately"))
            .catch(e => console.log("Camera video not playing yet, waiting for metadata:", e));
        } else {
          console.error("Camera videoRef.current is null after delay!");
        }
      }, 200);
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }, [cameraStream]);

  const startAudioDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      setAudioContext(audioCtx);
      setAudioAnalyser(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let sustainedNoiseCount = 0;
      const sustainedNoiseThreshold = 10; // consecutive detections
      const audioThreshold = 30; // volume threshold

      const checkAudio = () => {
        if (!audioAnalyser) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > audioThreshold) {
          sustainedNoiseCount++;
          if (sustainedNoiseCount >= sustainedNoiseThreshold) {
            setIsAudioAboveThreshold(true);
            sustainedNoiseCount = 0;
          }
        } else {
          sustainedNoiseCount = 0;
          setIsAudioAboveThreshold(false);
        }
        
        requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      console.error("Audio detection failed:", err);
    }
  }, [audioAnalyser]);

  const stopAudioDetection = useCallback(() => {
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
      setAudioAnalyser(null);
    }
  }, [audioContext]);

  const triggerWarning = useCallback((message: string) => {
    setWarningCount(prev => {
      const newCount = prev + 1;
      
      // Auto-submit after 2 warnings
      if (newCount >= 2) {
        setIsAutoSubmitted(true);
        setCurrentWarning("Multiple violations detected. Test auto-submitted.");
      }
      
      return newCount;
    });
    
    setCurrentWarning(message);
    
    // Clear previous timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    
    // Auto-hide warning after 5 seconds
    warningTimeoutRef.current = setTimeout(() => {
      setCurrentWarning(null);
    }, 5000);
  }, []);

  // Ensure video plays when camera stream is set
  useEffect(() => {
    if (cameraStream && videoRef.current && videoRef.current.srcObject) {
      console.log("Camera stream set, ensuring video plays");
      videoRef.current.play()
        .then(() => console.log("Camera video playing after stream set"))
        .catch(e => console.error("Camera video play error after stream set:", e));
    }
  }, [cameraStream]);

  // Ensure video plays when test loads
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      console.log("Test loaded, ensuring camera video plays");
      videoRef.current.play()
        .then(() => console.log("Camera video playing after test load"))
        .catch(e => console.error("Camera video play error after test load:", e));
    }
  }, [cameraStream]);

  // Simple face detection - check if video has motion (simplified version)
  useEffect(() => {
    if (!cameraStream || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let previousFrame: ImageData | null = null;
    let noFaceCount = 0;
    const noFaceThreshold = 30; // consecutive frames without face

    const checkFace = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = ctx;

      canvas.width = video.videoWidth / 4;
      canvas.height = video.videoHeight / 4;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);
      
      if (previousFrame) {
        // Simple motion detection - compare frames
        let motionPixels = 0;
        for (let i = 0; i < currentFrame.data.length; i += 4) {
          const diff = Math.abs(currentFrame.data[i] - previousFrame.data[i]) +
                       Math.abs(currentFrame.data[i + 1] - previousFrame.data[i + 1]) +
                       Math.abs(currentFrame.data[i + 2] - previousFrame.data[i + 2]);
          if (diff > 30) motionPixels++;
        }

        const motionRatio = motionPixels / (currentFrame.data.length / 4);
        
        // If no motion for extended period, face might not be visible
        if (motionRatio < 0.01) {
          noFaceCount++;
          if (noFaceCount >= noFaceThreshold) {
            setFaceVisible(false);
            triggerWarning("Face not detected. Please ensure your face is visible in the camera.");
            noFaceCount = 0;
          }
        } else {
          noFaceCount = 0;
          setFaceVisible(true);
        }
      }

      previousFrame = currentFrame;
      requestAnimationFrame(checkFace);
    };

    checkFace();

    return () => {
      previousFrame = null;
    };
  }, [cameraStream, triggerWarning]);

  // Monitor audio threshold changes
  useEffect(() => {
    if (isAudioAboveThreshold) {
      triggerWarning("Audio detected. Please maintain silence during the test.");
    }
  }, [isAudioAboveThreshold, triggerWarning]);

  // Monitor fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullScreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      
      if (!isCurrentlyFullScreen && isFullScreen && !isAutoSubmitted) {
        triggerWarning("Fullscreen mode exited. Please return to fullscreen. (Warning " + (warningCount + 1) + "/2)");
        // Don't force re-enter fullscreen - just show warning
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullScreen, isAutoSubmitted, triggerWarning, warningCount]);

  // Start proctoring when test loads
  useEffect(() => {
    if (test && !result) {
      enterFullScreen();
      startCamera();
      startAudioDetection();
    }

    return () => {
      stopCamera();
      stopAudioDetection();
      exitFullScreen();
      // Ensure fullscreen class is removed on cleanup
      document.body.classList.remove('fullscreen-mode');
    };
  }, [test, result, enterFullScreen, startCamera, stopCamera, startAudioDetection, stopAudioDetection, exitFullScreen]);

  // Remove fullscreen class when showing result
  useEffect(() => {
    if (result) {
      document.body.classList.remove('fullscreen-mode');
    }
  }, [result]);

  // Auto-submit when triggered
  useEffect(() => {
    if (isAutoSubmitted && !result && !hasAutoSubmittedRef.current) {
      hasAutoSubmittedRef.current = true;
      setTimeout(() => {
        handleSubmit();
      }, 2000);
    }
  }, [isAutoSubmitted, result, handleSubmit]);

  const current: Question | undefined = flat.find((q) => q.id === currentId);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleMark(questionId: string) {
    setMarked((prev) => {
      const next = new Set(prev);
      next.has(questionId) ? next.delete(questionId) : next.add(questionId);
      return next;
    });
  }

  // --- Countdown ------------------------------------------------------------
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, handleSubmit]);

  if (isLoading || !test) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Success icon */}
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900">Test Submitted Successfully</h1>
                <p className="text-slate-600">{test.title}</p>

                {/* Percentage */}
                <div className="text-6xl font-bold text-primary">
                  {result.percentage.toFixed(2)}%
                </div>

                {/* Score */}
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">Score</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {result.score} / {result.totalQuestions}
                  </p>
                </div>

                {/* Correct / Incorrect cards */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-green-700 mb-1">Correct Answers</p>
                      <p className="text-3xl font-bold text-green-600">{result.correctCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-red-700 mb-1">Incorrect Answers</p>
                      <p className="text-3xl font-bold text-red-600">{result.incorrectCount}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Back button */}
                <div className="pt-4">
                  <Button onClick={() => router.push("/dashboard/assessment-center")} size="lg">
                    Back to Assessment Center
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 fullscreen-test-content">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4" id="test-container">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/assessment-center">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{test.title}</h1>
            <div className="mt-1 flex gap-1">
              {test.sections.map((s) => (
                <span key={s.id} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-slate-600">
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-red-50 px-3 py-1.5 font-mono text-sm font-bold text-red-600">
            {formatTime(secondsLeft ?? 0)}
          </span>
        </div>
      </div>

      {/* Submission error */}
      {submissionError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-700">{submissionError}</p>
          </CardContent>
        </Card>
      )}

      {/* Proctoring Warning Banner */}
      {currentWarning && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-900">Proctoring Warning ({warningCount}/2)</p>
                <p className="text-sm text-amber-700">{currentWarning}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentWarning(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Proctoring Camera Preview */}
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="shadow-lg">
          <CardContent className="p-2">
            <div className="relative w-48 h-36 bg-slate-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                onCanPlay={() => {
                  console.log("Camera video can play in test, forcing playback");
                  videoRef.current?.play().catch(e => console.error("Camera video play error in onCanPlay:", e));
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Status indicators */}
              <div className="absolute top-2 left-2 flex gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  faceVisible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  <Video className="h-3 w-3" />
                  {faceVisible ? 'Face OK' : 'No Face'}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  warningCount < 2 ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount}/2
                </div>
              </div>
              
              <div className="absolute top-2 right-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isAudioAboveThreshold ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  <Volume2 className="h-3 w-3" />
                  {isAudioAboveThreshold ? 'Audio' : 'Silent'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_18rem]">
        {/* Question viewer */}
        <Card>
          <CardContent className="space-y-4 p-6">
            {current && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    Question {flat.indexOf(current) + 1} of {flat.length}
                  </span>
                  <button
                    onClick={() => toggleMark(current.id)}
                    className={
                      "flex items-center gap-1 rounded-lg border px-3 py-1 text-sm " +
                      (marked.has(current.id)
                        ? "border-amber-300 bg-amber-50 text-amber-600"
                        : "border-slate-200 text-slate-600")
                    }
                  >
                    <Flag className="h-4 w-4" /> Mark for Review
                  </button>
                </div>

                <p className="text-slate-900">{current.prompt}</p>

                {/* Choice question */}
                {current.options && (
                  <div className="space-y-2">
                    {current.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={
                          "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm " +
                          (answers[current.id] === opt.id
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 hover:bg-slate-50")
                        }
                      >
                        <input
                          type="radio"
                          name={current.id}
                          checked={answers[current.id] === opt.id}
                          onChange={() => setAnswer(current.id, opt.id)}
                        />
                        <span className="font-medium text-slate-700">{opt.label}.</span>
                        <span className="text-slate-700">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Coding question */}
                {(current.type === "CODING" || current.type === "PSEUDOCODE") && (
                  <CodeEditor
                    value={answers[current.id] ?? "# Write your code here\n"}
                    onChange={(v) => setAnswer(current.id, v)}
                  />
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    disabled={flat.indexOf(current) === 0}
                    onClick={() => setCurrentId(flat[flat.indexOf(current) - 1].id)}
                  >
                    Previous
                  </Button>
                  {flat.indexOf(current) < flat.length - 1 ? (
                    <Button onClick={() => setCurrentId(flat[flat.indexOf(current) + 1].id)}>
                      Save &amp; Next
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Test"}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Question palette */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <p className="text-sm font-semibold text-slate-900">Question Palette</p>
              {test.sections.map((s) => (
                <div key={s.id}>
                  <p className="mb-2 text-xs font-medium text-slate-500">{s.title}</p>
                  <div className="grid grid-cols-5 gap-2">
                    {s.questions.map((q) => {
                      const answered = answers[q.id] !== undefined && answers[q.id] !== "";
                      const isMarked = marked.has(q.id);
                      const cls = isMarked
                        ? "bg-amber-100 text-amber-700 border-amber-300"
                        : answered
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : "bg-slate-100 text-slate-500 border-slate-200";
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentId(q.id)}
                          className={
                            "h-9 rounded-md border text-sm font-medium " +
                            cls +
                            (currentId === q.id ? " ring-2 ring-primary" : "")
                          }
                        >
                          {flat.indexOf(q) + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <Legend color="bg-emerald-100" label="Answered" />
                <Legend color="bg-slate-100" label="Not Answered" />
                <Legend color="bg-amber-100" label="Marked for Review" />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" variant="outline" onClick={handleSubmit} disabled={submitting}>
            End Test
          </Button>
        </aside>
      </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={"h-3 w-3 rounded " + color} />
      {label}
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
