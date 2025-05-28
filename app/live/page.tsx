"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Maximize2, Minimize2, Trophy, Target, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Problem {
  id: string
  title: string
  points: number
  difficulty: "easy" | "medium" | "hard"
}

// Mock problems data - replace with actual data from your backend
const PROBLEMS: Problem[] = [
  { id: "p1", title: "Array Manipulation", points: 100, difficulty: "easy" },
  { id: "p2", title: "Dynamic Programming", points: 200, difficulty: "medium" },
  { id: "p3", title: "Graph Algorithms", points: 300, difficulty: "hard" },
  { id: "p4", title: "String Processing", points: 150, difficulty: "medium" },
  { id: "p5", title: "Binary Search", points: 250, difficulty: "hard" },
]

export default function LiveContestPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showAchievements, setShowAchievements] = useState(true)
  const [progress, setProgress] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [usersMap, setUsersMap] = useState<{ [id: string]: any }>({});
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true)

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Subscribe to participant_progress collection
    const unsubscribeProgress = onSnapshot(collection(db, "participant_progress"), (snapshot) => {
      setProgress(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const map: { [id: string]: any } = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === "participant") {
          map[data.id] = data;
        }
      });
      setUsersMap(map);
    };
    fetchUsers();

    // Fetch all questions
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuestions();

    return () => {
      clearInterval(timer)
      unsubscribeProgress()
    }
  }, [])

  // Only count points for participant_progress with status 'correct'
  const participantMap: Record<string, any> = {};
  progress.filter(p => p.status === 'correct').forEach(p => {
    if (!participantMap[p.participantId]) {
      participantMap[p.participantId] = {
        participantId: p.participantId,
        name: p.participantName || p.name || p.participantId || "Unknown",
        teamName: p.teamName || "Unknown",
        points: 0,
      };
    }
    participantMap[p.participantId].points += p.points || 0;
  });
  console.log("participantMap result", participantMap);
  const participants = Object.values(participantMap);
  const teamMap: Record<string, any> = {};
  participants.forEach(p => {
    if (!teamMap[p.teamName]) {
      teamMap[p.teamName] = {
        teamName: p.teamName,
        members: [],
        points: 0,
        totalTime: 0,
      };
    }
    teamMap[p.teamName].members.push(p);
    teamMap[p.teamName].points += p.points;
  });
  console.log("teamMap result", teamMap);
  const teams = Object.values(teamMap).sort((a, b) => b.points - a.points);
  console.log("teams array", teams);

  // Aggregate problem completion statistics from participant_progress
  const problemMap: Record<string, { title: string, status: "solved" | "attempted" | "not_started" }> = {};
  progress.forEach(p => {
    if (!problemMap[p.questionId]) {
      problemMap[p.questionId] = {
        title: p.questionTitle || p.title || "Untitled",
        status: "not_started"
      };
    }
    if (p.status === "correct") {
      problemMap[p.questionId].status = "solved";
      // Compute total time taken for this question using timer.remainingTime only
      const team = teamMap[p.teamName];
      if (team) {
        const maxTime = p.round === "easy" ? 15 * 60 * 1000 : p.round === "medium" ? 20 * 60 * 1000 : 25 * 60 * 1000;
        const remainingTime = p.timer?.remainingTime ? p.timer.remainingTime * 1000 : 0;
        const timeTaken = maxTime - remainingTime;
        team.totalTime += timeTaken;
      }
    } else if (
      ["pending", "wrong", "in progress", "skipped"].includes(p.status) &&
      problemMap[p.questionId].status !== "solved"
    ) {
      problemMap[p.questionId].status = "attempted";
    }
  });
  const problems = Object.values(problemMap);
  const allQuestionIds = questions.map(q => q.id);
  const startedQuestionIds = new Set(progress.map(p => p.questionId));
  const notStarted = allQuestionIds.filter(qid => !startedQuestionIds.has(qid)).length;
  const stats = {
    total: problems.length,
    solved: problems.filter(p => p.status === "solved").length,
    attempted: progress.filter(p => p.status !== "correct").length,
    notStarted: notStarted,
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }

  const getRecentAchievements = () => {
    const achievements: { team: string; achievement: any }[] = []
    teams.forEach(team => {
      if (team.achievements) {
        team.achievements.forEach((achievement: any) => {
          achievements.push({ team: team.name, achievement })
        })
      }
    })
    return achievements.sort((a, b) => b.achievement.timestamp - a.achievement.timestamp).slice(0, 5)
  }

  const recentAchievements = getRecentAchievements()

  // Build list of all active teams/users
  const activeTeams = Object.values(usersMap).filter(
    (user: any) => user.role === "participant" && user.status === "active"
  );
  const getTeamPoints = (teamName: string) =>
    teams.find((t: any) => t.teamName === teamName)?.points || 0;

  return (
    <div className={`min-h-screen bg-[#181c24] p-8 transition-all duration-300 ${isFullScreen ? 'p-0' : ''}`}>
      <div className={`max-w-7xl mx-auto space-y-8 ${isFullScreen ? 'p-8' : ''}`}>
        {/* Full Screen Toggle Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleFullScreen}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(0,255,247,0.2)] text-shadow-cyber transition-all font-semibold"
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="h-5 w-5 text-cyan-400" /> Exit Full Screen
              </>
            ) : (
              <>
                <Maximize2 className="h-5 w-5 text-cyan-400" /> Full Screen
              </>
            )}
          </button>
        </div>

        {/* Back Button */}
        <div className="mb-4">
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(0,255,247,0.2)] text-shadow-cyber transition-all font-semibold">
            <ArrowLeft className="h-5 w-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,247,0.5)]" />
            Back to Admin Dashboard
          </Link>
        </div>

        {/* Header with Logos */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-5xl font-extrabold text-cyan-400 text-shadow-cyber whitespace-nowrap drop-shadow-lg">
              CodeRush 2025
            </h1>
            <img
              src="/cc-logo.png.jpg"
              alt="Coders Club Logo"
              className="h-12 w-auto rounded-xl border-2 border-cyan-400 shadow-[0_0_20px_0_rgba(0,255,247,0.5)] bg-black/30 p-1"
            />
            <img
              src="/cs-logo.png.jpg"
              alt="Computer Society Logo"
              className="h-12 w-auto rounded-xl border-2 border-purple-400 shadow-[0_0_20px_0_rgba(168,85,247,0.5)] bg-black/30 p-1"
            />
          </div>
          <div className="text-cyan-300 text-shadow-cyber text-lg font-semibold tracking-wide opacity-80">
            In partnership with <span className="text-purple-300">Coders Club</span> & <span className="text-purple-300">Computer Society</span>
          </div>
          <div className="text-3xl text-purple-300 text-shadow-cyber font-bold">
            {mounted ? currentTime.toLocaleTimeString() : ""}
          </div>
        </div>

        {/* After the header, use a flex layout for main content and sidebar */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Content: Leaderboard only */}
          <div className="flex-1">
            {/* 1. Live Leaderboard */}
            <Card className="bg-black/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,247,0.1)] mb-8">
          <CardHeader>
                <CardTitle className="text-4xl text-cyan-400 text-center text-shadow-cyber font-extrabold tracking-wide mb-4">
                  Live Leaderboard
            </CardTitle>
                {/* Problem Completion Statistics as text row */}
                <div className="flex justify-center gap-8 mt-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{stats.solved}</div>
                <div className="text-sm text-cyan-200">Solved</div>
              </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{stats.attempted}</div>
                <div className="text-sm text-purple-200">Attempted</div>
              </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{stats.notStarted}</div>
                <div className="text-sm text-cyan-200">Not Started</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                    {teams.map((team, index) => {
                      // Badge color for top 3
                      const badgeColors = [
                        "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900 border-yellow-300",
                        "bg-gradient-to-r from-gray-400 to-gray-200 text-gray-900 border-gray-300",
                        "bg-gradient-to-r from-orange-400 to-orange-200 text-orange-900 border-orange-300"
                      ];
                      const badgeClass = badgeColors[index] || "bg-cyan-800 text-cyan-100 border-cyan-400";
                      const isTop = index === 0;
                      return (
                  <motion.div
                          key={team.teamName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                          className={`flex items-center justify-between p-4 rounded-xl border shadow-lg transition-all
                            ${isTop ? "border-yellow-400 bg-gradient-to-r from-yellow-100/30 to-cyan-100/10 shadow-yellow-200/40" : "bg-black/30 border-cyan-500/30"}
                            hover:shadow-[0_0_15px_rgba(0,255,247,0.2)]`}
                  >
                    <div className="flex items-center gap-4">
                            {/* Rank Badge */}
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold text-lg shadow ${badgeClass}`}>
                              {index + 1}
                            </div>
                            {/* Team Avatar/Initial */}
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-700 text-cyan-100 font-bold text-xl shadow-inner mr-2">
                              {team.teamName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                              <h3 className={`text-lg font-semibold text-shadow-cyber ${isTop ? "text-yellow-500" : "text-cyan-300"}`}>
                                {team.teamName}
                        </h3>
                              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.77l-4.77 2.51.91-5.32-3.87-3.77 5.34-.78L10 2z"/></svg>
                                <span className="text-green-400">{team.points}</span>
                                <span className="text-xs text-cyan-200 ml-2">pts</span>
                                {/* Member list */}
                                <ul className="ml-4 text-xs text-purple-200">
                                  {(usersMap[team.teamName]?.members || []).map((member: any, idx: number) => (
                                    <li key={idx} className="whitespace-nowrap">
                                      {member.name}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="text-xs text-cyan-200">
                                {team.totalTime > 0 ? `${Math.floor(team.totalTime / 60000)}:${((team.totalTime % 60000) / 1000).toFixed(0).padStart(2, '0')}` : "Not completed"}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
              </AnimatePresence>
            </div>
                {/* Problem Completion Statistics as text row */}
                <div className="flex justify-center gap-8 mt-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{stats.solved}</div>
                    <div className="text-sm text-cyan-200">Solved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{stats.attempted}</div>
                    <div className="text-sm text-purple-200">Attempted</div>
        </div>
                      <div>
                    <div className="text-2xl font-bold text-cyan-400">{stats.notStarted}</div>
                    <div className="text-sm text-cyan-200">Not Started</div>
                      </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 