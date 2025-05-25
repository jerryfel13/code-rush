"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParticipantAuth } from "../context/participant-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Send, MessageSquare, Lock, CheckCircle2 } from "lucide-react"
import { ParticipantHeader } from "./participant-header"
import { Timer } from "./timer"
import { ProtectedParticipantRoute } from "./protected-participant-route"
import { collection, setDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import axios from "axios";
import { Input } from "@/components/ui/input";

export function ParticipantInterface() {
  const { participant, logout } = useParticipantAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [activeRound, setActiveRound] = useState("easy")
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<{
    [key: string]: {
      [key: number]: boolean
    }
  }>({
    easy: {},
    medium: {},
    hard: {}
  })
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitingForJudge, setWaitingForJudge] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [easyTimeRemaining, setEasyTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [progressMap, setProgressMap] = useState<{ [questionId: string]: any }>({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("/api/questions");
        setQuestions(res.data.questions);
      } catch (err) {
        toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" });
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [toast]);

  // Map questions by difficulty and order
  const easyQuestions = questions.filter(q => q.difficulty === "easy").sort((a, b) => Number(a.order) - Number(b.order));
  const mediumQuestions = questions.filter(q => q.difficulty === "medium").sort((a, b) => Number(a.order) - Number(b.order));
  const hardQuestions = questions.filter(q => q.difficulty === "hard").sort((a, b) => Number(a.order) - Number(b.order));

  // Use the correct round's questions
  const roundQuestions =
    activeRound === "easy"
      ? easyQuestions
      : activeRound === "medium"
      ? mediumQuestions
      : hardQuestions;

  const currentQuestion = roundQuestions[activeQuestionIndex]

  // Check if a round is locked
  const isRoundLocked = (round: string) => {
    if (round === "easy") return false
    if (round === "medium") {
      return Object.keys(completedQuestions.easy).length < easyQuestions.length
    }
    if (round === "hard") {
      return Object.keys(completedQuestions.medium).length < mediumQuestions.length
    }
    return true
  }

  // Check if a question is locked
  const isQuestionLocked = (round: string, index: number) => {
    if (index === activeQuestionIndex) return false;
    if (index < activeQuestionIndex) {
      const questionId = roundQuestions[index].id;
      const progress = progressMap[questionId];
      return progress?.status === "correct" || (progress?.timer && progress.timer.remainingTime <= 0);
    }
    // Unlock the next question if the previous is correct
    if (index === activeQuestionIndex + 1) {
      const prevQuestionId = roundQuestions[index - 1]?.id;
      const prevProgress = progressMap[prevQuestionId];
      return prevProgress?.status !== "correct";
    }
    if (index > activeQuestionIndex + 1) return true;
    if (round === "easy") return false;
    if (round === "medium") {
      return !completedQuestions.easy[index];
    }
    if (round === "hard") {
      return !completedQuestions.medium[index];
    }
    return true;
  };

  useEffect(() => {
    const mapTimeFromProgress = async () => {
      if (!participant?.id || !currentQuestion?.id) return;
      if (activeRound === "easy") {
       
        const progressRef = doc(
          collection(db, "participant_progress"),
          `${participant.id}_${currentQuestion.id}`
        );
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const data = progressSnap.data();
          console.log("1", data);
          if (data.timer && typeof data.timer.remainingTime === "number") {
            setTimeRemaining(data.timer.remainingTime * 60);
          } else {
            console.log("2", data);
            setTimeRemaining(30 * 60);
          }
        }
      } else if (activeRound === "medium") {
        setTimeRemaining(15 * 60);
      } else if (activeRound === "hard") {
        if (activeQuestionIndex < 2) {
          setTimeRemaining(10 * 60);
        } else {
          setTimeRemaining(5 * 60);
        }
      }
    };
    mapTimeFromProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant?.id, currentQuestion?.id, activeRound, activeQuestionIndex]);

  // When question changes, reset timer for easy round
  useEffect(() => {
    if (activeRound === "easy") {
      setEasyTimeRemaining(30 * 60);
      setIsTimerPaused(false);
    }
  }, [activeRound, activeQuestionIndex]);

  // Fetch all progress for the participant
  useEffect(() => {
    const fetchProgress = async () => {
      if (!participant) return;
      const qProgress = query(
        collection(db, "participant_progress"),
        where("participantId", "==", participant.id)
      );
      const snapshot = await getDocs(qProgress);
      const map: { [questionId: string]: any } = {};
      snapshot.forEach(doc => {
        map[doc.data().questionId] = doc.data();
      });
      setProgressMap(map);
    };
    fetchProgress();
  }, [participant, questions]);

  // Update progressMap after judge feedback or submission
  const updateProgressForCurrent = (status: string) => {
    if (!currentQuestion) return;
    setProgressMap(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...(prev[currentQuestion.id] || {}),
        status,
      },
    }));
  };

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleTimeUp = () => {
    toast({
      title: "Time's Up!",
      description: "The time for this question has expired.",
      variant: "destructive",
    })
  }

  const handleRoundChange = (round: string) => {
    if (!isRoundLocked(round)) {
      setActiveRound(round)
      setActiveQuestionIndex(0)
      setAnswer("")
      setWaitingForJudge(false)
    } else {
      toast({
        title: "Round Locked",
        description: "Complete the previous round to unlock this one.",
        variant: "destructive",
      })
    }
  }

  const handleQuestionChange = (index: number) => {
    if (!isQuestionLocked(activeRound, index)) {
      setActiveQuestionIndex(index);
      setAnswer("");
      setWaitingForJudge(false);
      const questionId = roundQuestions[index].id;
      const progress = progressMap[questionId];
      if (progress?.status === "correct") {
        setStarted(true);
        setIsTimerPaused(true);
        // Enable the next question if it exists
        const nextIndex = index + 1;
        if (nextIndex < roundQuestions.length && !isQuestionLocked(activeRound, nextIndex)) {
          setActiveQuestionIndex(nextIndex);
        }
      } else {
        setStarted(false);
        setIsTimerPaused(false);
      }
    } else {
      toast({
        title: "Question Locked",
        description: "Complete the current question to unlock the next one.",
        variant: "destructive",
      });
    }
  };

  // When clicking "Answer is Ready"
  const handleReadyForValidation = async () => {
    if (!participant || !currentQuestion) return;
    setIsSubmitting(true);
    try {
      const progressRef = doc(
        collection(db, "participant_progress"),
        `${participant.id}_${currentQuestion.id}`
      );
      await setDoc(progressRef, {
        participantId: participant.id,
        questionId: currentQuestion.id,
        answer: "", // No answer input
        status: "pending",
        round: activeRound,
        timer: {
          remainingTime: easyTimeRemaining,
          isPaused: false,
        },
        order: currentQuestion.order,
        updatedAt: new Date().toISOString(),
      });
      setWaitingForJudge(true);
      if (activeRound === "easy") setIsTimerPaused(true); // Pause timer for easy round
      toast({
        title: "Ready for Checking!",
        description: "The judge has been notified that you are ready for checking.",
      });
      updateProgressForCurrent("pending");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to notify judge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll for judge validation
  useEffect(() => {
    if (!participant || !currentQuestion) return;
    const progressRef = doc(
      collection(db, "participant_progress"),
      `${participant.id}_${currentQuestion.id}`
    );
    let interval: NodeJS.Timeout;
    if (waitingForJudge) {
      interval = setInterval(async () => {
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const status = progressSnap.data().status;
          if (status === "correct") {
            setCompletedQuestions(prev => ({
              ...prev,
              [activeRound]: {
                ...prev[activeRound],
                [activeQuestionIndex]: true
              }
            }));
            toast({
              title: "Correct Answer!",
              description: "Judge has validated your answer. You can proceed.",
            });
            setWaitingForJudge(false);
            setAnswer("");
            setIsTimerPaused(false); // Resume for next question
            const nextIndex = activeQuestionIndex + 1;
            if (nextIndex < roundQuestions.length) {
              // Map the timer for the next question from Firestore
              const nextQuestion = roundQuestions[nextIndex];
              const nextProgressRef = doc(
                collection(db, "participant_progress"),
                `${participant.id}_${nextQuestion.id}`
              );
              const nextProgressSnap = await getDoc(nextProgressRef);
              let nextTime: number;
              if (nextProgressSnap.exists()) {
                const data = nextProgressSnap.data();
                if (data.timer && typeof data.timer.remainingTime === "number") {
                  nextTime = data.timer.remainingTime;
                } else {
                  nextTime = 30 * 60;
                }
              } else {
                nextTime = 30 * 60;
              }
              setActiveQuestionIndex(nextIndex);
              setEasyTimeRemaining(nextTime);
            }
            updateProgressForCurrent("correct");
            clearInterval(interval);
          } else if (status === "wrong") {
            toast({
              title: "Incorrect Answer",
              description: "Your answer was marked as wrong. Please try again.",
              variant: "destructive",
            });
            setWaitingForJudge(false); // Allow resubmission
            setIsTimerPaused(false);   // Resume the timer
            setStarted(true);          // Ensure timer is running
            clearInterval(interval);
            updateProgressForCurrent("wrong");
          } else if (status === "pending") {
            updateProgressForCurrent("pending");
          }
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [participant, currentQuestion, activeRound, activeQuestionIndex, waitingForJudge, roundQuestions.length]);

  const saveTimerState = async (remaining: number, paused: boolean) => {
    if (!participant || !currentQuestion) return;
    const progressRef = doc(
      collection(db, "participant_progress"),
      `${participant.id}_${currentQuestion.id}`
    );
    await setDoc(progressRef, {
      timer: {
        remainingTime: remaining,
        isPaused: paused,
      }
    }, { merge: true });
  };

  // Timer tick handler for easy round
  const handleEasyTick = (remaining: number) => {
    setEasyTimeRemaining(remaining);
    saveTimerState(remaining, isTimerPaused);
  };

  // Pause timer on unload and save remaining time
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeRound === "easy" && !isTimerPaused) {
        saveTimerState(easyTimeRemaining, true);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeRound, isTimerPaused, easyTimeRemaining]);

  // When question changes, load timer state and status from Firestore if it exists
  useEffect(() => {
    const loadProgressAndTimer = async () => {
      setProgressLoading(true);
      if (!participant || !currentQuestion) {
        setProgressLoading(false);
        return;
      }
      const progressRef = doc(
        collection(db, "participant_progress"),
        `${participant.id}_${currentQuestion.id}`
      );
      const progressSnap = await getDoc(progressRef);
      let timerValue = 30 * 60;
      let pausedValue = true;
      let waitingValue = false;
      let statusValue = "not started";
      let startedValue = false;
      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data.timer && typeof data.timer.remainingTime === "number") {
          setEasyTimeRemaining(data.timer.remainingTime);
          pausedValue = data.timer.isPaused ?? true;
        }
        statusValue = data.status;
        startedValue = data.started ?? false;
        if (data.status === "pending") {
          waitingValue = true;
          pausedValue = true;
          startedValue = false;
        } else if (data.status === "wrong") {
          waitingValue = false;
          pausedValue = false;
          startedValue = true;
        }
      } else {
        setEasyTimeRemaining(30 * 60); // Set timer to 30:00 if no progress
      }
      setIsTimerPaused(pausedValue);
      setWaitingForJudge(waitingValue);
      setStarted(startedValue);
      setProgressMap(prev => ({
        ...prev,
        [currentQuestion.id]: {
          ...(prev[currentQuestion.id] || {}),
          status: statusValue,
        },
      }));
      setProgressLoading(false);
    };
    if (activeRound === "easy") {
      loadProgressAndTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant, currentQuestion, activeRound, activeQuestionIndex]);

  const handleStart = async () => {
    if (!participant || !currentQuestion) return;

    // Fetch the latest progress for this question
    const progressRef = doc(
      collection(db, "participant_progress"),
      `${participant.id}_${currentQuestion.id}`
    );
    const progressSnap = await getDoc(progressRef);

    let resumeTime: number;
    if (progressSnap.exists()) {
      const data = progressSnap.data();
      if (data.timer && typeof data.timer.remainingTime === "number") {
        resumeTime = data.timer.remainingTime;
        console.log("resumeTime", resumeTime);
      } else {
        resumeTime = 30 * 60;
      }
    } else {
      resumeTime = 30 * 60;
    }

    setStarted(true);
    setIsTimerPaused(false);
    setEasyTimeRemaining(resumeTime);

    await setDoc(
      progressRef,
      {
        started: true,
        timer: {
          remainingTime: resumeTime,
          isPaused: false,
        }
      },
      { merge: true }
    );
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-cyan-200">Loading questions...</span>
      </div>
    );
  }

  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-4 text-cyan-200">Loading progress...</span>
      </div>
    );
  }

  return (
    <ProtectedParticipantRoute>
      <div className="min-h-screen bg-transparent">
        <ParticipantHeader participant={participant} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-6 text-cyan-100">
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-cyan-200 drop-shadow">Coding Competition</h1>
                <p className="text-cyan-300/80">
                  Team: {participant?.teamName} | Participant: {participant?.name}
                </p>
              </div>
              {activeRound === "easy" && !isTimerPaused && (
                <Timer
                  time={easyTimeRemaining}
                  isPaused={!started || isTimerPaused}
                  onTimeUp={handleTimeUp}
                  onTick={handleEasyTick}
                />
              )}
            </div>
            <Tabs value={activeRound} onValueChange={handleRoundChange} className="mb-4">
              <TabsList className="grid grid-cols-3 bg-[#181c24]/80 border border-cyan-700/40">
                <TabsTrigger 
                  value="easy" 
                  className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300"
                >
                  Easy Round
                </TabsTrigger>
                <TabsTrigger 
                  value="medium" 
                  className={`data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 ${isRoundLocked("medium") ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isRoundLocked("medium")}
                >
                  <div className="flex items-center gap-2">
                    Medium Round
                    {isRoundLocked("medium") && <Lock className="h-4 w-4" />}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="hard" 
                  className={`data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 ${isRoundLocked("hard") ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isRoundLocked("hard")}
                >
                  <div className="flex items-center gap-2">
                    Hard Round
                    {isRoundLocked("hard") && <Lock className="h-4 w-4" />}
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap gap-2 mb-4">
              {roundQuestions.map((question, index) => {
                const progress = progressMap[question.id];
                const status = progress?.status || "not started";
                return (
                  <Button
                    key={question.id || index}
                    variant={index === activeQuestionIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuestionChange(index)}
                    className={`${
                      index === activeQuestionIndex 
                        ? "bg-cyan-900/30 border-cyan-400 text-cyan-300" 
                        : "border-cyan-700/40 text-cyan-200 hover:bg-cyan-900/20"
                    } ${isQuestionLocked(activeRound, index) ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isQuestionLocked(activeRound, index)}
                  >
                    <div className="flex items-center gap-2">
                      Question {index + 1}
                      {status === "pending" && <span className="text-yellow-400 ml-1">⏳</span>}
                      {status === "correct" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {status === "wrong" && <span className="text-red-400 ml-1">✗</span>}
                      {status === "not started" && <span className="text-gray-400 ml-1">•</span>}
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
          {currentQuestion ? (
            <div className="space-y-6">
              <Card className="bg-[#181c24]/80 border border-cyan-700/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300">
                    {currentQuestion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-cyan-100 mb-4">
                    {currentQuestion.description}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#181c24]/80 border border-cyan-700/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300">
                    Submit Your Answer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!started ? (
                      <Button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold"
                      >
                        Start
                      </Button>
                    ) : (
                      progressMap[currentQuestion.id]?.status === "correct" ? (
                        <p className="text-green-400">Question completed!</p>
                      ) : (
                        <Button
                          onClick={handleReadyForValidation}
                          disabled={isSubmitting || waitingForJudge}
                          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold"
                        >
                          {isSubmitting
                            ? "Submitting..."
                            : waitingForJudge
                            ? "Waiting for Judge..."
                            : "Answer is Ready"}
                        </Button>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#181c24]/80 border border-cyan-700/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-300">
                    <MessageSquare className="h-5 w-5" />
                    Ask for Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your question here..." 
                      className="bg-[#232526]/80 border-cyan-700/40 text-cyan-100 placeholder:text-cyan-400/50"
                    />
                    <Button variant="outline" className="border-cyan-400 text-cyan-200 hover:bg-cyan-900/20">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-[#181c24]/80 border border-cyan-700/40">
              <CardContent className="p-6">
                <p className="text-center text-cyan-300/80">No questions available for this round.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedParticipantRoute>
  )
}
