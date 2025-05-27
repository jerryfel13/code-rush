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
  const [easyTimeRemaining, setEasyTimeRemaining] = useState(15 * 60); // 15 minutes
  const [mediumTimeRemaining, setMediumTimeRemaining] = useState(20 * 60); // 20 minutes
  const [hardTimeRemaining, setHardTimeRemaining] = useState(25 * 60); // 25 minutes (default for first two)
  const [progressMap, setProgressMap] = useState<{ [questionId: string]: any }>({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<{ [key: string]: boolean }>({});

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
    if (round === "easy") {
      // Lock easy round if all easy questions are completed
      return Object.keys(completedQuestions.easy).length === easyQuestions.length && easyQuestions.length > 0;
    }
    if (round === "medium") {
      // Unlock medium if all easy are done, lock if all medium are done
      if (Object.keys(completedQuestions.easy).length === easyQuestions.length && easyQuestions.length > 0) {
        return Object.keys(completedQuestions.medium).length === mediumQuestions.length && mediumQuestions.length > 0;
      }
      return true;
    }
    if (round === "hard") {
      // Unlock hard if all medium are done, lock if all hard are done
      if (Object.keys(completedQuestions.medium).length === mediumQuestions.length && mediumQuestions.length > 0) {
        return Object.keys(completedQuestions.hard).length === hardQuestions.length && hardQuestions.length > 0;
      }
      return true;
    }
    return true;
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
          if (data.timer && typeof data.timer.remainingTime === "number") {
            setTimeRemaining(data.timer.remainingTime * 60);
          } else {
            setTimeRemaining(15 * 60);
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
      const completed: { easy: any, medium: any, hard: any } = { easy: {}, medium: {}, hard: {} };
      snapshot.forEach(doc => {
        const data = doc.data();
        map[data.questionId] = data;
        if (data.status === "correct") {
          if (data.round === "easy") completed.easy[data.order - 1] = true;
          if (data.round === "medium") completed.medium[data.order - 1] = true;
          if (data.round === "hard") completed.hard[data.order - 1] = true;
        }
      });
      setProgressMap(map);
      setCompletedQuestions(completed);
    };
    fetchProgress();
  }, [participant, questions]);

  // Helper to get points for a question based on round
  const getPointsForCurrentQuestion = () => {
    if (activeRound === "easy") return 2;
    if (activeRound === "medium") return 4;
    if (activeRound === "hard") return 6;
    return 0;
  };

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
    // Save points for correct questions
    if (status === "correct") {
      if (participant && currentQuestion) {
        const progressRef = doc(
          collection(db, "participant_progress"),
          `${participant.id}_${currentQuestion.id}`
        );
        setDoc(progressRef, {
          points: getPointsForCurrentQuestion(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } else {
      savePointsToProgress();
    }
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
    });
    // Save timer state when time is up
    saveTimerState(0, true);
    setIsTimerPaused(true); // Pause timer when time is up
    // Save 0 points for this question
    if (participant && currentQuestion) {
      const progressRef = doc(
        collection(db, "participant_progress"),
        `${participant.id}_${currentQuestion.id}`
      );
      setDoc(progressRef, {
        points: 0,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }

  const handleRoundChange = (round: string) => {
    // Check if the round is finished (all questions completed)
    let isFinished = false;
    if (round === "easy") {
      isFinished = easyQuestions.length > 0 && Object.keys(completedQuestions.easy).length === easyQuestions.length;
    } else if (round === "medium") {
      isFinished = mediumQuestions.length > 0 && Object.keys(completedQuestions.medium).length === mediumQuestions.length;
    } else if (round === "hard") {
      isFinished = hardQuestions.length > 0 && Object.keys(completedQuestions.hard).length === hardQuestions.length;
    }
    if (isFinished) {
      toast({
        title: "This round is already finished.",
        description: "You have completed all questions in this round.",
        variant: "default",
      });
      return;
    }
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
        teamName: participant.teamName,
        questionId: currentQuestion.id,
        answer: "", // No answer input
        status: "pending",
        round: activeRound,
        timer: {
          remainingTime: getCurrentTimeRemaining(),
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
      // Save timer state on submit
      saveTimerState(getCurrentTimeRemaining(), true);
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
            setIsTimerPaused(true); // Pause timer when completed
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
                  nextTime = 15 * 60;
                }
              } else {
                nextTime = 15 * 60;
              }
              setActiveQuestionIndex(nextIndex);
              setCurrentTimeRemaining(nextTime);
            }
            updateProgressForCurrent("correct");
            if (participant && currentQuestion) {
              const progressRef = doc(
                collection(db, "participant_progress"),
                `${participant.id}_${currentQuestion.id}`
              );
              await setDoc(progressRef, {
                points: getPointsForCurrentQuestion(),
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
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
    setCurrentTimeRemaining(remaining);
    // No saveTimerState here to avoid excessive writes
  };

  // Pause timer on unload and save remaining time
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeRound === "easy" && !isTimerPaused) {
        saveTimerState(getCurrentTimeRemaining(), true);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeRound, isTimerPaused]);

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
      let timerValue = 15 * 60;
      let pausedValue = true;
      let waitingValue = false;
      let statusValue = "not started";
      let startedValue = false;
      if (progressSnap.exists()) {
        const data = progressSnap.data();
        if (data.timer && typeof data.timer.remainingTime === "number") {
          setCurrentTimeRemaining(data.timer.remainingTime);
        }
        statusValue = data.status;
        startedValue = data.started ?? false;
        if (data.status === "skipped" || data.status === "not started") {
          setStarted(false);
          setIsTimerPaused(true);
        } else if (data.status === "correct" || data.status === "pending") {
          setStarted(false);
          setIsTimerPaused(true);
        } else {
          setStarted(true);
          setIsTimerPaused(false);
        }
      } else {
        if (activeRound === "easy") setEasyTimeRemaining(15 * 60);
        if (activeRound === "medium") setMediumTimeRemaining(20 * 60);
        if (activeRound === "hard") {
          if (activeQuestionIndex < 2) setHardTimeRemaining(25 * 60);
          else setHardTimeRemaining(30 * 60);
        }
        setStarted(false);
        setIsTimerPaused(true);
      }
      setWaitingForJudge(waitingValue);
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
      } else {
        if (activeRound === "easy") resumeTime = 15 * 60;
        else if (activeRound === "medium") resumeTime = 20 * 60;
        else if (activeRound === "hard") resumeTime = (activeQuestionIndex < 2 ? 25 * 60 : 30 * 60);
        else resumeTime = 0;
      }
    } else {
      if (activeRound === "easy") resumeTime = 15 * 60;
      else if (activeRound === "medium") resumeTime = 20 * 60;
      else if (activeRound === "hard") resumeTime = (activeQuestionIndex < 2 ? 25 * 60 : 30 * 60);
      else resumeTime = 0;
    }
    setStarted(true);
    setIsTimerPaused(false);
    setCurrentTimeRemaining(resumeTime);
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

  // Calculate progress for each round
  const easyCorrect = Object.keys(completedQuestions.easy).length;
  const mediumCorrect = Object.keys(completedQuestions.medium).length;
  const hardCorrect = Object.keys(completedQuestions.hard).length;

  // Calculate points for each round
  const easyPoints = Object.keys(completedQuestions.easy).length * 2;
  const mediumPoints = Object.keys(completedQuestions.medium).length * 4;
  const hardPoints = Object.keys(completedQuestions.hard).length * 6;
  const totalPoints = easyPoints + mediumPoints + hardPoints;

  // Add handler for pass/skip
  const handlePassSkip = async () => {
    if (!participant || !currentQuestion) return;
    // Save timer state and mark as skipped
    await saveTimerState(getCurrentTimeRemaining(), true);
    setSkippedQuestions(prev => ({ ...prev, [currentQuestion.id]: true }));
    // Save skipped status in progress
    const progressRef = doc(
      collection(db, "participant_progress"),
      `${participant.id}_${currentQuestion.id}`
    );
    await setDoc(progressRef, {
      participantId: participant.id,
      teamName: participant.teamName,
      questionId: currentQuestion.id,
      status: "skipped",
      round: activeRound,
      timer: {
        remainingTime: getCurrentTimeRemaining(),
        isPaused: true,
      },
      order: currentQuestion.order,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    // Move to next question if available
    const nextIndex = activeQuestionIndex + 1;
    if (nextIndex < roundQuestions.length) {
      setActiveQuestionIndex(nextIndex);
      setStarted(false);
      setIsTimerPaused(true);
    } else {
      // If no more questions, stay on current
      setIsTimerPaused(true);
    }
  };

  // Update progressMap to include skipped status
  useEffect(() => {
    if (!participant || !questions.length) return;
    const updateSkipped = async () => {
      const qProgress = query(
        collection(db, "participant_progress"),
        where("participantId", "==", participant.id)
      );
      const snapshot = await getDocs(qProgress);
      const skipped: { [key: string]: boolean } = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === "skipped") {
          skipped[data.questionId] = true;
        }
      });
      setSkippedQuestions(skipped);
    };
    updateSkipped();
  }, [participant, questions]);

  // Helper to get/set the correct timer for the current round
  const getCurrentTimeRemaining = () => {
    if (activeRound === "easy") return easyTimeRemaining;
    if (activeRound === "medium") return mediumTimeRemaining;
    if (activeRound === "hard") return hardTimeRemaining;
    return 0;
  };
  const setCurrentTimeRemaining = (val: number) => {
    if (activeRound === "easy") setEasyTimeRemaining(val);
    if (activeRound === "medium") setMediumTimeRemaining(val);
    if (activeRound === "hard") setHardTimeRemaining(val);
  };

  // Helper to save points to Firestore for the current question
  const savePointsToProgress = async () => {
    if (!participant || !currentQuestion) return;
    const progressRef = doc(
      collection(db, "participant_progress"),
      `${participant.id}_${currentQuestion.id}`
    );
    await setDoc(progressRef, {
      points: totalPoints,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
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
                <p className="text-cyan-400 font-semibold mt-1">Total Points: <span className="text-green-400">{totalPoints}</span></p>
              </div>
              {["easy", "medium", "hard"].includes(activeRound) && (
                <Timer
                  time={getCurrentTimeRemaining()}
                  isPaused={!started || isTimerPaused}
                  onTimeUp={handleTimeUp}
                  onTick={val => setCurrentTimeRemaining(val)}
                />
              )}
            </div>
            <Tabs value={activeRound} onValueChange={handleRoundChange} className="mb-4">
              <TabsList className="grid grid-cols-3 bg-[#181c24]/80 border border-cyan-700/40">
                <TabsTrigger 
                  value="easy" 
                  className={`data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 flex items-center gap-2`}
                >
                  Easy Round
                  <span className="ml-1 text-xs text-cyan-400">{easyCorrect}/{easyQuestions.length}</span>
                  {easyCorrect === easyQuestions.length && easyQuestions.length > 0 && (
                    <CheckCircle2 className="h-4 w-4 text-green-400 ml-1" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="medium" 
                  className={`data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 flex items-center gap-2 ${isRoundLocked("medium") ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isRoundLocked("medium")}
                >
                  <div className="flex items-center gap-2">
                    Medium Round
                    <span className="ml-1 text-xs text-cyan-400">{mediumCorrect}/{mediumQuestions.length}</span>
                    {mediumCorrect === mediumQuestions.length && mediumQuestions.length > 0 && (
                      <CheckCircle2 className="h-4 w-4 text-green-400 ml-1" />
                    )}
                    {isRoundLocked("medium") && <Lock className="h-4 w-4" />}
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="hard" 
                  className={`data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300 flex items-center gap-2 ${isRoundLocked("hard") ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={isRoundLocked("hard")}
                >
                  <div className="flex items-center gap-2">
                    Hard Round
                    <span className="ml-1 text-xs text-cyan-400">{hardCorrect}/{hardQuestions.length}</span>
                    {hardCorrect === hardQuestions.length && hardQuestions.length > 0 && (
                      <CheckCircle2 className="h-4 w-4 text-green-400 ml-1" />
                    )}
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
                    onClick={() => {
                      if (index !== activeQuestionIndex) handleQuestionChange(index);
                    }}
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
                      {skippedQuestions[question.id] && <span className="text-orange-400 ml-1">⏭️</span>}
                      {status === "not started" && !skippedQuestions[question.id] && <span className="text-gray-400 ml-1">•</span>}
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
                    {progressMap[currentQuestion.id]?.status === "correct" ? (
                      <p className="text-green-400">Question completed!</p>
                    ) : progressMap[currentQuestion.id]?.status === "pending" ? (
                      <Button disabled className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold">
                        Waiting for Judge...
                      </Button>
                    ) : !started ? (
                      <Button
                        onClick={async () => {
                          // If the question was skipped, set status to 'in progress' but do not reset the timer
                          if (progressMap[currentQuestion.id]?.status === "skipped") {
                            if (participant && currentQuestion) {
                              const progressRef = doc(
                                collection(db, "participant_progress"),
                                `${participant.id}_${currentQuestion.id}`
                              );
                              await setDoc(progressRef, {
                                status: "in progress",
                                timer: {
                                  remainingTime: getCurrentTimeRemaining(),
                                  isPaused: false,
                                },
                                started: true,
                                updatedAt: new Date().toISOString(),
                              }, { merge: true });
                            }
                          }
                          handleStart();
                        }}
                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold"
                      >
                        Start
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReadyForValidation}
                          disabled={isSubmitting || waitingForJudge}
                          className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold"
                        >
                          {isSubmitting ? "Submitting..." : "Answer is Ready"}
                        </Button>
                        {activeQuestionIndex < roundQuestions.length - 1 && (
                          <Button
                            onClick={handlePassSkip}
                            disabled={waitingForJudge}
                            className="w-full bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-bold"
                          >
                            Pass / Skip
                          </Button>
                        )}
                      </div>
                    )}
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
